<template>
  <div class="search-music">
    <div class="top">
      <div class="cover">
        <img :src="likelist[0].al.picUrl" />
      </div>
      <div class="info">
        <div class="title">我喜欢的音乐</div>
        <div class="author">
          <img :src="profile.avatarUrl" />
          <span>{{ profile.nickname }}</span>
        </div>
        <div class="desc line-1">歌曲：{{ likelist.length }}</div>
        <div class="actions">
          <el-button
            @click="playAll"
            size="mini"
            round
            type="primary"
            icon="iconfont icon-bofangsanjiaoxing"
          >播放全部</el-button>
        </div>
      </div>
    </div>

    <p style="font-size: 16px; font-weight: bold; margin-left: 20px">歌曲列表</p>

    <div class="tracks">
      <div class="list">
        <el-table
          size="small"
          :data="likelist"
          :stripe="true"
          align="center"
        >
          <el-table-column label="音乐标题">
            <template slot-scope="scope">
              <div class="name-row">
                <div class="left">
                  <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
                  <div style="display: inline-block; margin-left: 20px">
                    <img
                      style=" width: 15px;height: 15px;margin-right: 5px;cursor:pointer;"
                      @click="unlikeMusic(scope.row)"
                      title="取消喜欢"
                      src="../../../assets/images/shoucang.png"
                    />
                    <span>{{ scope.row.name }}</span>
                    <img
                      class="tag"
                      src="../../../assets/images/sq.png"
                    />
                    <img
                      v-if="scope.row.mv > 0"
                      class="tag"
                      src="../../../assets/images/mv.png"
                    />
                  </div>
                </div>
                <div class="btns">
                  <i
                    class="iconfont icon-zanting play"
                    @click="play(scope.row)"
                  ></i>
                  <i class="iconfont icon-gengduo more"></i>
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
                :title="scope.row.ar[0].name"
              >{{
                        scope.row.ar[0].name
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
          @click="handleUnlike"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { ipcRenderer } from "electron";
import db from "../../../../lowdb/datastore";
export default {
  data() {
    return {
      showPlaylist: false,
      dialogVisible: false,
      likelistIds: [],
      songId: 0
    };
  },
  computed: {
    ...mapState({
      likelist: state => state.user.likelist,
      profile: state => state.user.profile
    })
  },
  // mounted() {
  //   console.log("---Play list=", this.list);
  //   console.log("---Play song=", this.song);

  //   this.globalClick(this.hidePlaylist);
  //   this.playlistClick(() => {});
  // },
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
    unlikeMusic(item) {
      this.dialogVisible = true;
      this.songId = item.id;
    },
    handleUnlike() {
      let store = localStorage.getItem("profile");
      if (store !== null) {
        const userId = JSON.parse(store).userId;
        ipcRenderer.send("unlike_music", { songId: this.songId, userId });
        ipcRenderer.on("reply_unlike_music", (event, data) => {
          if (data.code === 200) {
            this.likelistIds.splice(this.likelistIds.indexOf(this.songId), 1);
            localStorage.setItem("likelistIds", JSON.stringify(this.likelistIds));
            this.fetchData(userId);

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
    play(item) {
      console.log("item.id=", item.id);
      this.$store.dispatch("playMusic", item.id);
    },
    playAll() {
      //   this.$store.dispatch("playPlaylist", this.playlist.id);
    },
    hidePlaylist() {
      // console.log('-----globalClick -> hidePlaylist-----',this.$refs.playlist)
    },
    getLikelistIds() {
      let store = localStorage.getItem("likelistIds");
      if (store !== null) {
        this.likelistIds = JSON.parse(store);
      }
    }
  },
  mounted() {
    this.getLikelistIds();
  }
};
</script>
<style lang="scss" scoped>
.search-music {
  min-height: 430px;
  width: 100%;
  overflow-x: auto;
}
.top {
  padding: 25px 30px;
  display: flex;
  .cover {
    width: 147px;
    height: 147px;
    position: relative;
    flex-shrink: 0;
    img {
      width: 147px;
      height: 147px;
    }
  }
  .info {
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .title {
      font-size: 22px;
      color: #000;
      font-weight: bold;
    }
    .author {
      display: flex;
      align-items: center;
      font-size: 13px;
      color: #555;
      img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    .desc {
      font-size: 13px;
      color: #555;
      line-height: 20px;
    }
    /deep/ .actions {
      button {
        min-width: 90px;
        i {
          font-size: 13px;
          margin-right: 3px;
        }
      }
    }
  }
}
/deep/ .tracks {
  //   background: #fafafa;
  padding: 0 30px;
  .list {
    .el-table {
      background: none;
      th {
        background: none;
      }
      tr {
        background: none;
      }
      tr:hover {
        .btns {
          .iconfont {
            display: block;
          }
          .iconfont:hover {
            color: #31c27c;
          }
        }
      }
    }
    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left {
        .shoucang {
          width: 15px;
          height: 15px;
          //   font-size: 15px;
          margin-right: 5px;
          cursor: pointer;
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
