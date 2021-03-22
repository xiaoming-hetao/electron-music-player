<template>
  <div class="history">
    <div style="margin:20px 0">
      <el-tag
        style=""
        type="success"
        effect="plain"
      >
        历史记录
      </el-tag>

      <div
        :class="{disable: !historyData.length}"
        style="margin: 0 30px"
      >
        <span style="float:left;font-size:14px;color:#999">总{{historyData.length}}首</span>
        <span
          style="float: right;cursor: pointer;font-size:14px;color:#999"
          @click="delPlayHistory"
        ><i class="el-icon-delete"></i>&nbsp;清空</span>
      </div>
    </div>

    <div class="tracks">
      <div class="list">
        <el-table
          size="small"
          :stripe="true"
          :data="historyData"
          @row-contextmenu="songRightClick"
          @row-dblclick="handleDBclick"
        >
          <el-table-column label="音乐标题">
            <template slot-scope="scope">
              <div class="name-row">
                <div class="left">
                  <div style="display: inline-block; margin-left: 20px">
                    <span>{{ scope.row.name }}</span>
                    <img
                      class="tag"
                      src="../../../assets/images/sq.png"
                    />
                    <img
                      v-if="scope.row.mv > 0"
                      class="tag"
                      src="../../../assets/images/mv.png"
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
            width="100"
            label="播放时间"
            prop="playtime"
          >
            <template slot-scope="scope">
              <span>{{  getDate(scope.row.playtime) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>

  </div>
</template>
<script>
import { getSongComment } from "../../../api";
import { getCommentDate } from "../../../utils/date";
import { remote } from "electron";
import { mapState } from "vuex";
export default {
  data() {
    return {
      historyData: [],
      songId: "",
      commentTotal: 0
    };
  },
  methods: {
    getDate(timestamp) {
      return getCommentDate(new Date(timestamp));
    },
    // 右键菜单
    async songRightClick(row) {
      // 获取歌曲评论
      await this.getSongComment(row);

      let path = require("path");
      const commentPath = path.join(__dirname, "../../../assets/images/comment.png");
      const playPath = path.join(__dirname, "../../../assets/images/playIcon.png");
      const shoucangPath = path.join(__dirname, "../../../assets/images/add.png");
      const deletePath = path.join(__dirname, "../../../assets/images/delete.png");
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
          submenu: that.playlistMenu
        },
        {
          type: "separator"
        },
        {
          label: "从列表中删除",
          icon: deletePath,
          click() {
            that.handleDelsong();
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
    // 右键从播放历史中删除歌曲
    handleDelsong() {
      const data = JSON.parse(localStorage.getItem("userPlayHistory"));
      const handleData = data.filter(item => item.id !== this.songId);
      localStorage.setItem("userPlayHistory", JSON.stringify(handleData));
      this.historyData = handleData;
    },
    handleDBclick(row) {
      this.play(row);
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
      this.$store.dispatch("playMusic", item);
    },
    playmv(mvid) {
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    },

    delPlayHistory() {
      localStorage.setItem("userPlayHistory", JSON.stringify([]));
      this.historyData = [];
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
      const playlistPath = path.join(__dirname, "../../../assets/images/playlistIcon.png");
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
  created() {
    let store = localStorage.getItem("userPlayHistory");
    if (store !== null) {
      this.historyData = JSON.parse(store);
    }
  }
};
</script>
<style lang="scss" scoped>
.history {
  min-height: 430px;
  width: 100%;
  overflow-y: auto;
  text-align: center;
  //禁用鼠标的点击事件
  .disable {
    pointer-events: none;
  }
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
}
</style>