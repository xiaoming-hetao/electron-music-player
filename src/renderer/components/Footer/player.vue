<template>
  <div class="player">
    <div class="control">
      <el-button
        type="text"
        @click="playBefore"
      >
        <i class="iconfont icon-kuaitui"></i>
      </el-button>
      <el-button
        class="play-btn"
        type="text"
        @click="playClick"
      >
        <i
          class="iconfont icon-zanting"
          v-if="!is_play"
        ></i>
        <i
          class="iconfont icon-bofang"
          v-else
        ></i>
      </el-button>
      <el-button
        type="text"
        @click="playAfter"
      >
        <i class="iconfont icon-kuaijin"></i>
      </el-button>
    </div>
    <div class="cover">
      <img
        class="cover-image"
        :src="cover"
        @click="showSongLyric()"
      />
      <audio
        v-show="false"
        ref="audio"
        v-if="play_url"
        :src="play_url"
        preload
      />
      <!-- <audio
        v-show="false"
        ref="audio"
        preload
      /> -->

    </div>
    <div class="tone">
      <el-dropdown
        trigger="click"
        placement="top"
        @command="handleCommand"
      >
        <span class="tone-dropdown">{{playType}}<i class="el-icon-arrow-up el-icon--right"></i></span>
        <el-dropdown-menu
          slot="dropdown"
          style="width: 220px"
        >
          <el-dropdown-item command="随机播放">
            <div class="flex-c-l">
              <div
                class="check"
                style="width: 30px"
              >
                <i
                  v-if="playType==='随机播放'"
                  class="el-icon-check"
                  style="color: #31c27c"
                ></i>
              </div>
              <span>随机播放</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="单曲循环">
            <div class="flex-c-l">
              <div
                class="check"
                style="width: 30px"
              >
                <i
                  v-if="playType==='单曲循环'"
                  class="el-icon-check"
                  style="color: #31c27c"
                ></i>
              </div>
              <span>单曲循环</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="列表循环">
            <div class="flex-c-l">
              <div
                class="check"
                style="width: 30px"
              >
                <i
                  v-if="playType==='列表循环'"
                  class="el-icon-check"
                  style="color: #31c27c"
                ></i>
              </div>
              <span>列表循环</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </div>
    <div class="info">
      <div class="top">
        <div class="names">
          <div>
            <span class="name">{{ name }}</span>
            <span
              class="ar_name"
              v-if="ar_name"
            > - {{ ar_name }}</span>

          </div>
        </div>
        <div class="time">{{ (play_time * 1000) | formatDuring }} / {{ song.dt | formatDuring }}</div>
      </div>
      <div class="progress">
        <el-slider
          :show-tooltipss="true"
          v-model="play_time"
          input-size="mini"
          :show-tooltip="false"
          :min="0"
          :max="song.dt / 1000"
          @change="playTimeChange"
        ></el-slider>
      </div>
    </div>
    <div class="actions">
      <el-button
        type="text"
        v-if="likelistIds.includes(this.song.id)"
        style="margin-top:5px"
      >
        <img
          @click="unlikeMusic"
          title="取消喜欢"
          style=" width: 15px;height: 15px;margin-right: 5px;cursor:pointer;"
          src="../../assets/images/shoucang.png"
        />
      </el-button>
      <el-button
        type="text"
        style="margin-top:5px"
        v-if="song.name && !likelistIds.includes(this.song.id)"
      >
        <i
          @click="likeMusic"
          class="shoucang iconfont icon-shoucang"
          title="喜欢"
        ></i>

      </el-button>
      <el-button
        type="text"
        style="margin-top:4px;;margin-left:-10px"
      >
        <i
          class="el-icon-bell"
          style="font-size:18px"
          title="静音"
          v-if="!isVolume"
          @click="closeVolume"
        ></i>
        <i
          class="el-icon-close-notification"
          style="font-size:18px"
          title="恢复声音"
          v-if="isVolume"
          @click="restoreVolume"
        ></i>
      </el-button>
      <div
        class="progress"
        style="width:100px;"
      >

        <el-slider
          :show-tooltip="false"
          style="margin-top:-2px;margin-left:-5px"
          v-model="volumeControl"
          input-size="mini"
          :min="0"
          @change="volumeChange"
        ></el-slider>
      </div>
      <el-popover
        placement="top-start"
        width="400"
        popper-class="ls"
        trigger="click"
      >
        <playlist />
        <el-button
          style="margin-left:10px;margin-top:5px"
          type="text"
          @click.native="showPlaylist"
          slot="reference"
        >
          <i class="iconfont icon-liebiao"></i>
        </el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
import songdetail from "../Songdetail";
import playlist from "../Playlist";
import { getSongLyric } from "../../api";
import { shuffle } from "../../utils/shuffle";
const path = require("path");
export default {
  inject: ["reloadRouterView"],
  components: {
    songdetail,
    playlist
  },
  data() {
    return {
      audio: null,
      play_time: 0,
      max_time: 0,
      interval: null,
      playType: "随机播放",
      play_type: 1, //播放次序 0单曲循环 1列表循环 2随机播放
      likelistIds: [],
      volumeControl: 0, //音量控制
      isVolume: false,
      songId: ""
    };
  },

  watch: {
    playType(newVal, oldVal) {
      localStorage.setItem("playType", newVal);
      if (newVal === "单曲循环") {
        this.play_type = 0;
      } else if (newVal === "随机播放") {
        this.play_type = 2;
      } else {
        this.play_type = 1;
      }
    },
    is_play(newVal, oldVal) {
      try {
        this.$nextTick(() => {
          this.audio = this.$refs["audio"];
          this.audio.crossOrigin = "anonymous";

          if (newVal) {
            this.audio.play();
            this.audio.volume = parseFloat(localStorage.getItem("volumeControl"));

            this.max_time = this.audio.duration;
            this.getPlayTime();
            this.audio.addEventListener("ended", () => {
              this.playEnded();
            });

            if (!this.is_playLocal) {
              getSongLyric(this.song.id).then(res => {
                this.$store.commit("SET_PLAYER_DATA", { lyric: res.lrc.lyric });
              });
            } else {
              this.$store.commit("SET_PLAYER_DATA", { lyric: "" });
            }
          } else {
            this.audio.pause();
            clearInterval(this.interval);
          }
        });
      } catch (e) {
        console.log("play error");
      }
    },
    currentTime(val) {
      this.play_time = val;
    }
  },
  computed: {
    // 本地音乐和在线音乐的信息分开为不同的计算属性
    is_playLocal() {
      return this.$store.state.player.is_playLocal;
    },
    play_list() {
      return this.$store.state.player.list;
    },
    song() {
      return this.$store.state.player.song;
    },
    music_urls() {
      return this.$store.state.player.music_urls;
    },

    cover() {
      try {
        return this.song.al.picUrl;
      } catch (e) {
        return "http://p3.music.126.net/4MweH6c68gCe893Xk3vIQA==/109951165605589048.jpg?param=140y140";
      }
    },
    name() {
      try {
        return this.song.name || "深空音乐，畅听无限";
      } catch (e) {
        return "深空音乐，畅听无限";
      }
    },
    ar_name() {
      try {
        return this.song.ar[0].name;
      } catch (e) {
        return false;
      }
    },

    play_url() {
      return this.music_urls[0] ? this.music_urls[0].url : false;
    },
    is_play() {
      return this.$store.state.player.is_play;
    },
    currentTime() {
      return this.$store.state.player.currentTime;
    }
  },
  methods: {
    handleCommand(command) {
      this.playType = command;

      console.log(command);
    },
    closeVolume() {
      this.isVolume = true;
      this.audio.muted = "muted";
    },
    restoreVolume() {
      this.isVolume = false;
      this.audio.muted = "";
    },
    // 展示歌词
    showSongLyric() {
      if (this.song.id) {
        this.$router.push({ name: "song-detail" });
        this.$store.commit("SET_PLAYER_DATA", { audioDom: this.audio });
        this.reloadRouterView();
      }
    },
    // 改变音量
    volumeChange(val) {
      localStorage.setItem("volumeControl", val / 100);
      // 音频volume属性的值区间为[0,1]
      this.audio.volume = val / 100;
    },
    //播放/暂停按钮点击
    playClick() {
      console.log(this.song);
      this.$store.commit("SET_PLAYER_DATA", { is_play: !this.is_play });
    },
    //获取当前已播放时间
    getPlayTime() {
      this.interval = setInterval(() => {
        this.$store.commit("SET_PLAYER_DATA", { currentTime: this.audio.currentTime });
      }, 1000);
    },
    //改变播放时间
    playTimeChange(val) {
      this.audio.currentTime = val;
      this.$store.commit("SET_PLAYER_DATA", { currentTime: val });
    },
    //播放结束事件
    playEnded() {
      switch (this.play_type) {
        case 0:
          this.rePlay();
          break;
        case 1:
          this.playAfter();
          break;
        case 2:
          this.playAfter();
          break;
      }
    },
    //重新播放
    rePlay() {
      this.$store.commit("SET_PLAYER_DATA", { is_play: false, currentTime: 0 });
      setTimeout(() => {
        this.$store.commit("SET_PLAYER_DATA", { is_play: true });
      }, 1000);
    },
    playBefore() {
      if (this.play_type === 2) {
        //随机播放
        let song = null;
        // 每次都使用洗牌算法生成一个随机的播放列表
        let list = JSON.parse(JSON.stringify(this.play_list));
        const shuffleData = shuffle(list);

        const len = shuffleData.length;
        song = shuffleData[Math.floor(Math.random() * len)];

        // 返回打乱顺序后的数组的随机一个元素
        this.$store.dispatch("playMusic", { music: song, is_playLocal: false });
      } else {
        //列表循环、单曲循环

        let s_index = -1;
        let song = null;
        this.play_list.map((item, index) => {
          if (this.song.id === item.id && index > 0) {
            s_index = index - 1;
            song = this.play_list[s_index];
          }
        });

        // 播放列表的最后一首的下一首是第一首
        if (song) {
          this.$store.dispatch("playMusic", { music: song, is_playLocal: false });
        } else {
          this.$store.dispatch("playMusic", { music: this.play_list[this.play_list.length - 1], is_playLocal: false });
        }
      }
    },
    playAfter() {
      if (this.play_type === 2) {
        //随机播放
        let song = null;
        // 每次都使用洗牌算法生成一个随机的播放列表
        let list = JSON.parse(JSON.stringify(this.play_list));
        const shuffleData = shuffle(list);

        const len = shuffleData.length;
        song = shuffleData[Math.floor(Math.random() * len)];

        // 返回打乱顺序后的数组的随机一个元素
        this.$store.dispatch("playMusic", { music: song, is_playLocal: false });
      } else {
        //列表循环、单曲循环

        let s_index = -1;
        let song = null;

        this.play_list.map((item, index) => {
          if (this.song.id === item.id && index < this.play_list.length - 1) {
            s_index = index + 1;
            song = this.play_list[s_index];
          }
        });
        // 播放列表的最后一首的下一首是第一首
        if (song) {
          this.$store.dispatch("playMusic", { music: song, is_playLocal: false });
        } else {
          this.$store.dispatch("playMusic", { music: this.play_list[0], is_playLocal: false });
        }
      }
    },
    // 弹出播放列表
    showPlaylist() {
      this.$bus.$emit("showPlaylist");
    },
    getLikelistIds() {
      let store = localStorage.getItem("likelistIds");
      if (store !== null) {
        this.likelistIds = JSON.parse(store);
      }
    },
    likeMusic() {
      this.$bus.$emit("footerLike", this.song);
    },
    unlikeMusic() {
      this.$bus.$emit("footerUnlike", this.song);
    }
  },
  mounted() {
    this.songId = this.song.id;
    this.getLikelistIds();
    this.playType = localStorage.getItem("playType") ? localStorage.getItem("playType") : "随机播放";
    switch (this.playType) {
      case "随机播放":
        this.play_type = 2;
        break;
      case "列表循环":
        this.play_type = 1;
        break;
      case "单曲循环":
        this.play_type = 0;
        break;
    }
    const volume = localStorage.getItem("volumeControl") ? parseFloat(localStorage.getItem("volumeControl")) * 100 : 0;
    this.volumeControl = volume;
  }
};
</script>

<style lang="scss" scoped>
$height: 70px;
.player {
  display: flex;
  align-items: center;
  /deep/ .el-dialog {
    // height: 525px;
    overflow-y: auto;
  }
  /deep/ .control {
    width: 230px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    button {
      margin: 0 15px;
      color: #31c27c;
      i {
        font-size: 32px;
      }
    }
    button:hover {
      color: #2fab67;
    }
    .play-btn {
      i {
        font-size: 38px;
      }
    }
  }

  .cover {
    width: $height;
    height: $height;
    display: flex;
    align-items: center;
    justify-content: center;
    .cover-image {
      cursor: pointer;
      width: $height - 20px;
      height: $height - 20px;
      border-radius: 2px;
    }
  }
  /deep/ .tone {
    width: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    .el-dropdown {
      border: 1px solid #999;
      font-size: 10px;
      color: #333;
      padding: 1px 5px;
      border-radius: 2px;
      cursor: pointer;
      i {
        font-size: 10px;
      }
    }
    .el-dropdown:hover {
      color: #31c27c;
      border: 1px solid #31c27c;
    }
  }
  .info {
    flex: 1;
    height: $height;
    display: flex;
    flex-direction: column;
    padding: 0px;
    justify-content: center;
    .top {
      font-size: 13px;
      margin-top: 10px;
      color: #666;
      display: flex;
      justify-content: space-between;
      .names {
        font-size: 13px;
        color: #444;
      }
      .time {
        font-size: 12px;
        color: #999;
      }
    }
  }
  .actions {
    width: 200px;
    padding: 0 20px;
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    button {
      color: #333;
      flex: 1;
      flex-shrink: 0;
    }
    button:hover {
      color: #31c27c;
    }
  }
}
.progress {
  margin-top: 10px;

  /deep/ .el-slider {
    .el-slider__runway {
      height: 3px;
    }
    .el-slider__bar {
      height: 3px;
    }
    .el-slider__button-wrapper {
      width: 6px;
      height: 6px;
      top: -8px;
    }
    .el-slider__button {
      width: 3px;
      height: 3px;
    }
  }
}
</style>
