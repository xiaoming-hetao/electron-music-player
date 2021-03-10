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
            <span>{{ playlist.creator.nickname }} &emsp;{{ getDate(playlist.createTime) }}创建</span>

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
              v-if="isLike"
              size="mini"
              round
              @click="handleCancelShoucang"
            ><i
                class="iconfont icon-shoucang"
                style="color: red"
              ></i>已收藏</el-button>
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
      <songlist :songlist="playlist.tracks" />
    </template>
  </el-scrollbar>
</template>

<script>
import { getPlaylistDetail, like } from "../../api";
import { likePlaylist, dislikePlaylist } from "../../api/user";
import songlist from "../../components/Songlist";
import { getFormatDate } from "../../utils/date";
export default {
  components: {
    songlist
  },
  data() {
    return {
      id: "",
      isLike: false,
      loading: true,
      show: false,
      playlist: []
    };
  },
  mounted() {
    this.$bus.$on("page-refresh", name => {
      if (name === "playlist-detail") {
        this.getData();
      }
    });
  },
  activated() {
    let id = this.$route.query.id;
    this.isLike = this.$route.query.isLike;
    if (id !== this.id) {
      this.id = id;
      this.getData();
    } else {
      this.show = true;
    }
  },
  deactivated() {
    this.show = false;
  },
  methods: {
    getDate(time) {
      return getFormatDate(new Date(time));
    },
    handleShoucang() {
      likePlaylist(this.id).then(res => {
        console.log(res, "likePlaylist");
      });
    },
    handleCancelShoucang() {
      dislikePlaylist(this.id).then(res => {
        console.log(res, "dislikePlaylist");
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
    likeMusic(item) {
      like(item.id).then(res => {
        console.log(res, "like");
      });
    },
    play(item) {
      //console.log(item.id)
      this.$store.dispatch("playMusic", item.id);
      this.$store.commit("SET_PLAYER_LIST", this.playlist.tracks);
    },
    playAll() {
      this.$store.dispatch("playPlaylist", this.playlist.id);
    }
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
