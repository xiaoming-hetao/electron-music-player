<template>
  <el-scrollbar
    class="playlist-detail scroll-page"
    v-loading="loading"
  >
    <template v-if="playlist && show">
      <div class="top">
        <div class="cover">
          <img :src="playlist.coverImgUrl" />
        </div>
        <div class="info">
          <div class="title">
            <el-tag
              type="danger"
              effect="plain"
              size="small"
            >
              歌单
            </el-tag>{{ playlist.name }}
          </div>
          <div class="author">
            <img :src="playlist.creator.avatarUrl" />
            <span>{{ playlist.creator.nickname }} &emsp;{{ getDate(playlist.createTime) }}&emsp;创建</span>

          </div>
          <div class="desc line-1">
            标签：<span
              v-for="(item, index) of playlist.tags"
              :key="index"
            >{{item}}&emsp;</span>
          </div>
          <div class="desc line-1">歌曲：{{ playlist.tracks.length }}&emsp;&emsp;播放：{{Math.floor(playlist.playCount/10000)}}万</div>
          <div class="desc line-1">简介：{{ playlist.description }}</div>
          <div class="actions">
            <el-button
              @click="playAll"
              size="mini"
              round
              type="primary"
              icon="iconfont icon-bofangsanjiaoxing"
            >播放全部</el-button>
            <el-button
              v-if="likePlaylistIds.includes(id)"
              size="mini"
              round
              icon="el-icon-folder-checked"
              @click="handleCancelShoucang"
            >已收藏</el-button>
            <el-button
              v-else
              size="mini"
              round
              icon="iconfont icon-shoucang"
              @click="handleShoucang"
            >收藏</el-button>

            <el-button
              size="mini"
              round
              icon="iconfont icon-xiazai2"
            >下载</el-button>
          </div>
        </div>
      </div>

      <!-- 歌单详细列表 -->
      <songlist
        :songlist="playlist.tracks"
        @updatePlaylist="handlePpdatePlaylist"
      />
    </template>
    <el-dialog
      :visible.sync="dialogVisible"
      width="50%"
      top="23%"
      :modal="false"
      center
    >
      <p style="text-align:center;">确定不再收藏该歌单？</p>
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
  </el-scrollbar>
</template>

<script>
import { getPlaylistDetail, like } from "../../api";
import { likePlaylist, dislikePlaylist } from "../../api/user";
import songlist from "../../components/Songlist";
import { getFormatDate } from "../../utils/date";
import { ipcRenderer } from "electron";
import db from "../../../lowdb/datastore";
export default {
  components: {
    songlist
  },
  data() {
    return {
      id: "",
      loading: true,
      dialogVisible: false,
      show: false,
      playlist: {},
      likePlaylistIds: [],
      userId: ""
    };
  },

  methods: {
    // 重新向数据库拉取数据
    fetchData(userId) {
      const value = db
        .read()
        .get("like-playlist")
        .find({ userId })
        .value();
      this.$store.commit("SET_LIKE_PLAYLIST_DATA", { userLikePlaylist: value.userLikePlaylist });
    },
    getDate(time) {
      return getFormatDate(new Date(time));
    },
    handlePpdatePlaylist(id) {
      console.log(id, "update");
    },
    handleShoucang() {
      let store = localStorage.getItem("profile");
      if (store !== null) {
        const userId = JSON.parse(store).userId;
        likePlaylist(this.id).then(res => {
          if (res.code === 200) {
            ipcRenderer.send("like_playlist", { playlist: this.playlist, userId });
            ipcRenderer.on("reply_like_playlist", (event, data) => {
              if (data.code === 200) {
                this.$message({
                  message: data.message,
                  type: "success",
                  center: true
                });
                this.fetchData(userId);
                this.likePlaylistIds.push(this.playlist.id);
                localStorage.setItem("likePlaylistIds", JSON.stringify(this.likePlaylistIds));
              }
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
    handleCancelShoucang() {
      let store = localStorage.getItem("profile");
      if (store !== null) {
        this.dialogVisible = true;
        this.userId = JSON.parse(store).userId;
      } else {
        this.$message({
          message: "请先登录再进行此操作",
          type: "info",
          center: true
        });
      }
    },
    handleUnlike() {
      const userId = this.userId;
      dislikePlaylist(this.id).then(res => {
        if (res.code === 200) {
          ipcRenderer.send("unlike_playlist", { id: this.playlist.id, userId });
          ipcRenderer.on("reply_unlike_playlist", (event, data) => {
            if (data.code === 200) {
              this.$message({
                message: data.message,
                type: "success",
                center: true
              });
              this.dialogVisible = false;
              this.fetchData(userId);
              this.likePlaylistIds.splice(this.likePlaylistIds.indexOf(this.playlist.id), 1);
              localStorage.setItem("likePlaylistIds", JSON.stringify(this.likePlaylistIds));
            }
          });
        }
      });
    },
    getData() {
      this.loading = true;
      getPlaylistDetail(this.id).then(res => {
        this.playlist = res.playlist;
        this.show = true;
        this.loading = false;
      });
    },

    playAll() {
      this.$store.dispatch("playPlaylist", this.playlist.id);
    },
    getLikePlaylistIds() {
      let store = localStorage.getItem("likePlaylistIds");
      if (store !== null) {
        this.likePlaylistIds = JSON.parse(store);
      }
    }
  },
  mounted() {
    this.getLikePlaylistIds();
    this.$bus.$on("page-refresh", name => {
      if (name === "playlist-detail") {
        this.getData();
      }
    });
  },
  // updated() {
  //   this.getLikePlaylistIds();
  // },
  activated() {
    let id = this.$route.query.id;
    if (id !== this.id) {
      this.id = id;
      this.getData();
    } else {
      this.show = true;
    }
  },
  deactivated() {
    this.show = false;
  }
};
</script>

<style lang="scss" scoped>
.playlist-detail {
  // background: #f0f0f0;
  flex: 1;
  .top {
    padding: 25px 30px;
    display: flex;
    .cover {
      width: 175px;
      height: 175px;
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
        height: 30px;
        line-height: 30px;
        .el-tag {
          margin-right: 10px;
          line-height: 30px;
        }
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
        margin-top: 5px;
      }
      /deep/ .actions {
        button {
          min-width: 90px;
          margin-top: 10px;
          i {
            font-size: 13px;
            margin-right: 3px;
          }
        }
      }
    }
  }
}

.scroll-page {
  overflow: hidden;
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
</style>
