<template>
  <div>
    <div class="tracks">
      <div class="list">
        <el-table
          size="small"
          :stripe="true"
          :data="songlist"
          @row-contextmenu="songRightClick"
          @row-dblclick="handleDBclick"
        >
          <el-table-column label="音乐标题">
            <template slot-scope="scope">
              <div class="name-row">
                <div class="left">
                  <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
                  <div style="display: inline-block; margin-left: 20px">
                    <img
                      @click="unlikeMusic(scope.row)"
                      title="取消喜欢"
                      style=" width: 15px;height: 15px;margin-right: 5px;cursor:pointer;"
                      src="../../assets/images/shoucang.png"
                      v-if="likelistIds.includes(scope.row.id)"
                    />
                    <i
                      v-else
                      @click="likeMusic(scope.row)"
                      class="shoucang iconfont icon-shoucang"
                      title="喜欢"
                    ></i>

                    <span>{{ scope.row.name }}</span>
                    <img
                      class="tag"
                      src="../../assets/images/sq.png"
                    />
                    <img
                      v-if="scope.row.mv > 0"
                      class="tag"
                      src="../../assets/images/mv.png"
                      @click="playmv(scope.row.mv)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            width="200"
            label="歌手"
            prop="ar[0].name"
          >
            <template slot-scope="scope">
              <span
                style="width: 140px; cursor: pointer"
                class="line-1 hover"
                :title="handleArtistName(scope.row)"
              >{{
                
                handleArtistName(scope.row)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="200"
            label="专辑"
            prop="al.name"
          >
            <template slot-scope="scope">
              <span
                style="width: 190px; cursor: pointer"
                class="line-1 hover"
                :title="scope.row.al.name"
              >{{ scope.row.al.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="60"
            label="时长"
            prop="dt"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.dt | formatDuring }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="50%"
      top="23%"
      :modal="false"
      center
    >
      <p style="text-align:center;">确定将选中的歌曲从我喜欢的音乐中删除？</p>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          round
          :loading="isLoading"
          @click="handleUnlike"
        >确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="delDialogVisible"
      width="50%"
      top="23%"
      :modal="false"
      center
    >
      <p style="text-align:center;">确定将选中的歌曲从歌单中删除？</p>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          round
          @click="handleDelsong"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { addToPlaylist, delFromPlaylist } from "../../api/user";
import { getPlaylistDetail, getSongComment } from "../../api";
import { ipcRenderer, screen, remote } from "electron";
import { mapState } from "vuex";
import db from "../../../lowdb/datastore";
export default {
  props: {
    songlist: Array
  },
  data() {
    return {
      isLoading: false,
      likelistIds: [],
      dialogVisible: false,
      delDialogVisible: false,
      songId: "",
      playlistId: "",
      commentTotal: 0
    };
  },
  methods: {
    // 重新向数据库拉取数据
    fetchData(userId) {
      const value = db
        .read()
        .get("user-like")
        .find({ userId })
        .value();
      this.$store.commit("SET_LIKELIST_DATA", { songs: value.likelist });
    },
    // 右键菜单
    async songRightClick(row) {
      // 获取歌曲评论
      await this.getSongComment(row);

      let path = require("path");
      const commentPath = path.join(__dirname, "../../assets/images/comment.png");
      const playPath = path.join(__dirname, "../../assets/images/playIcon.png");
      const shoucangPath = path.join(__dirname, "../../assets/images/add.png");
      const deletePath = path.join(__dirname, "../../assets/images/delete.png");
      const { Menu } = remote;
      const that = this;
      that.songId = row.id;
      let menu = Menu.buildFromTemplate([
        {
          label: `查看评论(${that.commentTotal})`,
          icon: commentPath,
          click() {
            that.$router.push({ name: "song-comment" });
          }
        },
        {
          label: "播放(Enter)",
          icon: playPath,
          click() {
            that.play(row);
          }
        },
        {
          label: "下一首播放",
          icon: playPath,
          click() {
            console.log("下一首播放");
          }
        },
        {
          type: "separator"
        },
        {
          label: "收藏到歌单",
          icon: shoucangPath,
          submenu: this.playlistMenu
        },
        {
          type: "separator"
        },
        {
          label: "从歌单中删除",
          icon: deletePath,
          click() {
            that.delDialogVisible = true;
          }
        }
      ]);
      menu.popup(remote.getCurrentWindow());
    },
    async getSongComment(song) {
      await getSongComment(song.id).then(res => {
        this.commentTotal = res.total;
        this.$store.dispatch("getSongComment", song);
      });
    },
    // 右键收藏歌曲到歌单
    addToPlaylist(item) {
      addToPlaylist(item.id, this.songId).then(res => {
        if (res.body.code === 200) {
          this.$message({
            message: "已收藏到歌单",
            type: "success",
            center: true
          });
        } else if (res.body.code === 502) {
          this.$message({
            message: "歌曲已存在",
            type: "info",
            center: true
          });
        }
      });
    },
    // 右键从歌单中删除歌曲
    handleDelsong() {
      delFromPlaylist(this.playlistId, this.songId).then(res => {
        if (res.body.code === 200) {
          this.delDialogVisible = false;

          setTimeout(() => {
            getPlaylistDetail(this.playlistId).then(res => {
              const playlist = res.playlist;
              this.$emit("updatePlaylist", playlist);
            });
          }, 6000);
        }
      });
    },
    handleDBclick(row) {
      this.play(row);
    },

    likeMusic(item) {
      let store = localStorage.getItem("profile");
      if (store !== null) {
        const userId = JSON.parse(store).userId;
        ipcRenderer.send("like_music", { song: item, userId });
        ipcRenderer.on("reply_like_music", (event, data) => {
          if (data.code === 200) {
            this.$message({
              message: data.message,
              type: "success",
              center: true
            });
            this.fetchData(userId);
            this.likelistIds.push(item.id);
            localStorage.setItem("likelistIds", JSON.stringify(this.likelistIds));
          }
        });
      } else {
        this.$message({
          message: "请先登录再进行此操作",
          type: "info",
          center: true
        });
      }
    },
    unlikeMusic(item) {
      this.dialogVisible = true;
      this.songId = item.id;
    },
    handleUnlike() {
      this.isLoading = true;

      let store = localStorage.getItem("profile");
      if (store !== null) {
        const userId = JSON.parse(store).userId;
        ipcRenderer.send("unlike_music", { songId: this.songId, userId });
        ipcRenderer.on("reply_unlike_music", (event, data) => {
          if (data.code === 200) {
            this.likelistIds.splice(this.likelistIds.indexOf(this.songId), 1);
            localStorage.setItem("likelistIds", JSON.stringify(this.likelistIds));
            this.fetchData(userId);

            this.isLoading = false;
            this.dialogVisible = false;

            this.$message({
              message: data.message,
              type: "success",
              center: true
            });
          }
        });
      } else {
        this.$message({
          message: "请先登录再进行此操作",
          type: "info",
          center: true
        });
      }
    },
    handleArtistName(row) {
      let name = "";
      for (let item of row.ar) {
        name += item.name + " ";
      }
      return name;
    },
    play(item) {
      console.log("item.id=", item.id);

      this.$store.dispatch("playMusic", item.id);
    },
    playmv(mvid) {
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    },
    getLikelistIds() {
      let store = localStorage.getItem("likelistIds");
      if (store !== null) {
        this.likelistIds = JSON.parse(store);
      }
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      userCreatePlaylist: state => state.user.userCreatePlaylist
    }),
    playlistMenu() {
      let subMenu = [];
      const that = this;
      let path = require("path");
      const playlistPath = path.join(__dirname, "../../assets/images/playlistIcon.png");
      for (let item of that.userCreatePlaylist) {
        subMenu.push({
          label: item.name,
          icon: playlistPath,
          click() {
            that.addToPlaylist(item);
          }
        });
      }
      return subMenu;
    }
  },
  mounted() {
    console.log(this.songlist);
    this.getLikelistIds();
    this.playlistId = this.$route.query.id;
    const that = this;
    that.$bus.$on("footerLike", song => {
      that.likeMusic(song);
    });
    that.$bus.$on("footerUnlike", song => {
      that.unlikeMusic(song);
    });
  },
  updated() {
    this.getLikelistIds();
  }
};
</script>
<style lang="scss" scoped>
.tracks {
  //   background: #fafafa;
  padding: 0 30px;
  margin-top: 20px;
  .list {
    .el-table {
      background: none;
      th {
        background: none;
      }
      tr {
        background: none;
      }
    }
    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        .shoucang {
          font-size: 15px;
          margin-right: 5px;
          cursor: pointer;
        }
        .shoucang:hover {
          color: red;
        }
        .tag {
          height: 20px;
          margin-left: 5px;
          margin-top: -2px;
          cursor: pointer;
        }
      }
      .btns {
        display: flex;
        align-items: center;
        .iconfont {
          font-size: 20px;
          cursor: pointer;
          margin-left: 10px;
          color: #999;
          display: none;
        }
      }
    }
  }
}
</style>
