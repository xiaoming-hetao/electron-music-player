<template>
  <div class="search-music">
    <div class="top">
      <div class="cover">
        <img :src="artist.picUrl" />
      </div>
      <div class="info">
        <div class="title">
          <p>{{artist.name}}</p>
        </div>
        <div class="author">
          <span>{{ artist.alias[0] }}</span>
        </div>
        <div class="desc line-1">单曲数：{{ songCount }} &nbsp;&nbsp;专辑数：{{hotAlbums.length}} &nbsp;&nbsp;MV数：{{ mvs.length}}</div>

      </div>
    </div>

    <div>
      <el-tabs
        v-model="activeName"
        style="margin:0 20px;"
      >
        <!-- 专辑 -->
        <el-tab-pane
          label="专辑"
          name="album"
        >
          <div
            v-for="(item, index) of hotAlbums"
            :key="index"
            class="album-flex-container"
          >
            <div class="album-cover">
              <img
                :src="item.picUrl"
                width="100"
                height="100"
              />
              <p style="font-size:12px;text-align:center">{{getDate(item.publishTime)}}</p>
            </div>
            <div class="tracks">

              <div class="list">
                <p style="font-weight:bold;">{{item.name}}</p>
                <el-table
                  size="small"
                  :stripe="true"
                  :data="item.songlist"
                >
                  <el-table-column>
                    <template slot-scope="scope">
                      <div class="name-row">
                        <div class="left">
                          <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
                          <div style="display: inline-block; margin-left: 20px">
                            <i
                              @click="likeMusic(scope.row)"
                              class="shoucang iconfont icon-shoucang"
                            ></i>
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
                    width="60"
                    prop="dt"
                  >
                    <template slot-scope="scope">
                      <span>{{ scope.row.dt | formatDuring }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

            </div>
          </div>
        </el-tab-pane>
        <!-- mv -->
        <el-tab-pane
          label="MV"
          name="mv"
        >
          <el-row :gutter="15">
            <el-col
              class="mv-item"
              v-for="(item, index) of mvs"
              :key="index"
              :span="8"
            >
              <div class="container">
                <img
                  @click="playmv(item.id)"
                  :src="item.imgurl"
                  width="260"
                  height="140"
                />
                <div class="center">
                  <i class="iconfont icon-iconset0481"></i>&nbsp;&nbsp;{{Math.floor(item.playCount/10000)}}万
                  <div style="margin-top:20px">{{item.duration | formatDuring }}</div>
                </div>
              </div>

              <p style="font-size:14px">{{item.name}}</p>
            </el-col>

          </el-row>
        </el-tab-pane>
        <!-- 歌手详情 -->
        <el-tab-pane
          label="歌手详情"
          name="desc"
        >
          <div>
            <p class="desc-title">{{artist.name}}简介</p>
            <p class="desc-content">{{desc.briefDesc}}</p>
          </div>
          <div
            v-for="(item, index) of desc.introduction"
            :key="index"
          >
            <p class="desc-title">{{item.ti}}</p>
            <p
              class="desc-content"
              v-html="item.txt.replace(/\r\n/g, '<br/>&emsp;&emsp;')
              .replace(/\n\r/g, '<br>&emsp;&emsp;')
              .replace(/\r/g, '<br/>&emsp;&emsp;')
              .replace(/\n/g, '<br>&emsp;&emsp;')
              .replace(/ /g, '&nbsp;')"
            ></p>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>

  </div>
</template>
<script>
import { mapState } from "vuex";
import getFormatDate from "../../../utils/date";
export default {
  data() {
    return {
      showPlaylist: false,
      activeName: "album"
    };
  },
  computed: {
    ...mapState({
      artist: state => state.search.artistInfo,
      hotAlbums: state => state.search.hotAlbumsList,
      mvs: state => state.search.mvs,
      desc: state => state.search.desc,
      songCount: state => state.search.songCount
    })
  },
  mounted() {
    console.log("---Play list=", this.list);
    console.log("---Play song=", this.song);
  },
  methods: {
    getDate(time) {
      return getFormatDate(new Date(time));
    },
    likeMusic(item) {
      like(item.id).then(res => {
        console.log(res, "likesuccess");
      });
    },
    play(item) {
      console.log("item.id=", item.id);
      this.$store.dispatch("playMusic", item.id);
    },
    playmv(mvid) {
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    }
  }
};
</script>
<style lang="scss" scoped>
.search-music {
  min-height: 430px;
  width: 100%;
  overflow-x: auto;
  .album-flex-container {
    display: flex;
    margin-top: 50px;
  }
  .mv-item {
    cursor: pointer;
    margin-top: 10px;
    .container {
      position: relative;
      width: 260px;
      height: 140px;
      img {
        background: #999;
        border-radius: 7px;
      }
      .center {
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        text-align: center;
        font-size: 12px;
        margin-top: -9px;
        color: #fff;
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
.top {
  padding: 25px 30px;
  display: flex;
  .cover {
    width: 175px;
    height: 175px;
    position: relative;
    flex-shrink: 0;
    img {
      width: 175px;
      height: 175px;
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
.tracks {
  //   background: #fafafa;
  width: 520px;
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
