<template>
  <el-scrollbar class="playlist-detail scroll-page">
    <template>
      <div class="top">
        <div class="cover">
          <img :src="album.picUrl" />
        </div>
        <div class="info">
          <div class="title">
            <el-tag
              type="success"
              effect="plain"
              size="small"
            >
              专辑
            </el-tag>
            <span>{{ album.name }}</span>
          </div>
          <div class="author">
            <p>歌手：<span>{{ album.artist.name}}</span></p>
            <p>时间：<span>{{ getDate(album.publishTime)}}</span></p>

          </div>

          <div class="actions">
            <el-button
              @click="playAll(album.id)"
              size="mini"
              round
              type="primary"
              icon="iconfont icon-bofangsanjiaoxing"
            >播放全部</el-button>

            <el-button
              size="mini"
              round
              icon="iconfont icon-xiazai2"
            >下载</el-button>
          </div>
        </div>
      </div>
      <el-tabs
        v-model="activeName"
        style="margin:0 20px;"
      >
        <el-tab-pane
          label="歌曲列表"
          name="songlist"
        >
          <songlist :songlist="list" />
        </el-tab-pane>
        <el-tab-pane
          label="专辑详情"
          name="albumdetail"
        >
          <p class="desc-title">专辑介绍</p>
          <p
            class="desc-content"
            v-html="album.description.replace(/\r\n/g, '<br/>&emsp;&emsp;')
              .replace(/\n\r/g, '<br>&emsp;&emsp;')
              .replace(/\r/g, '<br/>&emsp;&emsp;')
              .replace(/\n/g, '<br>&emsp;&emsp;')
              "
          ></p>
        </el-tab-pane>

      </el-tabs>

    </template>
  </el-scrollbar>
</template>

<script>
import songlist from "../../../components/Songlist";
import { mapState } from "vuex";
import { getFormatDate } from "../../../utils/date";
export default {
  components: {
    songlist
  },
  data() {
    return {
      activeName: "songlist"
    };
  },
  methods: {
    playAll(id) {
      this.$store.dispatch("playPlaylist", id);
    },
    getDate(time) {
      return getFormatDate(new Date(time));
    }
  },
  computed: {
    ...mapState({
      list: state => state.search.list,
      album: state => state.search.album
    })
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
        height: 30px;
        line-height: 30px;
        .el-tag {
          margin-right: 10px;
        }
        font-size: 22px;

        color: #000;
        font-weight: bold;
      }
      .author {
        font-size: 13px;
        color: #555;
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
  .desc-title {
    font-weight: bold;
  }
  .desc-content {
    line-height: 2em;
    text-indent: 2em;
    font-size: 14px;
    color: #8a8a8a;
  }
}

.scroll-page {
  overflow: hidden;
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}
/deep/ .el-tabs {
  .el-tabs__header {
    padding: 0;
    margin: 0;
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }
  .el-tabs__item {
    font-size: 14px;
  }
}
</style>
