<template>
  <div class="songDetail scrollStyle">

    <section class="songContainer allCenter">
      <div
        class="bg"
        :style="{backgroundImage:`url(${songdetail.al.picUrl})`}"
      ></div>
      <div class="song alignCenter">
        <div class="playDetail">
          <header
            class="zheng"
            :class="{'playActive':is_play}"
          >
          </header>
          <div class="main">
            <img
              class="singPic"
              :class="{play:is_play === true }"
              :src="songdetail.al.picUrl"
              :key="songdetail.id"
            />
          </div>
          <canvas id="waveCanvas">

          </canvas>

        </div>
        <div class="word">
          <header class="titleContainer">
            <div
              class="alignCenter"
              style="font-size:20px"
            >
              <p>{{songdetail.name}}</p>
            </div>
            <p style="font-size:12px">
              <span>{{songdetail.ar[0].name}}</span>--<span>{{songdetail.al.name}}</span>
            </p>

          </header>
          <section
            class="wordoutside scrollStyle"
            ref="outsideContainer"
            @mouseenter="mousein = true"
            @mouseleave="mousein = false"
          >
            <ul
              class="wordContainer"
              ref="wordContainer"
            >
              <li
                v-for="(item,index) in lyc"
                :key="index"
                class="wordItem"
                :class="{'active':cur == index}"
                v-html="item"
              >
              </li>
            </ul>
          </section>
        </div>
        <div><img
            src="../../assets/images/shouqi.png"
            width="30"
            height="30"
            alt="收起"
            style="cursor: pointer;margin-top:20px;margin-left:20px"
            @click="()=> {this.$router.go(-1);}"
          ></div>
      </div>
    </section>
  </div>
</template>
<script>
import { formatLyric } from "../../utils/lyric";
// import { lyricMixin } from "../../utils/mixin";
import { run } from "../../utils/runlyric";
import { getSongLyric } from "../../api";
export default {
  data() {
    return {
      timer: null,
      cur: 0,
      currentTime: 0,
      mousein: false,
      audioDom: ""
    };
  },

  computed: {
    lyc() {
      return formatLyric(this.$store.state.player.lyric);
    },
    audio() {
      return this.$store.state.player.audioDom;
    },
    is_play() {
      return this.$store.state.player.is_play;
    },
    songdetail() {
      return this.$store.state.player.song;
    }
  },

  methods: {
    onLoadAudio(audio) {
      var context = new (window.AudioContext || window.webkitAudioContext)();
      var analyser = context.createAnalyser();
      analyser.fftSize = 512;
      var source = context.createMediaElementSource(audio);

      source.connect(analyser);
      analyser.connect(context.destination);

      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      var canvas = document.getElementById("waveCanvas");
      canvas.width = window.innerWidth;
      canvas.height = 270;

      var ctx = canvas.getContext("2d");
      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;

      var barWidth = (WIDTH / bufferLength) * 1.5;
      var barHeight;

      function renderFrame() {
        requestAnimationFrame(renderFrame);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0, x = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          var r = barHeight + 25 * (i / bufferLength);
          var g = 250 * (i / bufferLength);
          var b = 50;

          ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      }

      renderFrame();
      // setInterval(renderFrame, 44);
    }
  },
  watch: {
    audioDom(newVal, oldVal) {
      console.log(newVal, "1");
      console.log(oldVal, "2");
      if (newVal !== oldVal) {
        this.onLoadAudio(newVal);
      }
    }
  },
  mounted() {
    this.audioDom = this.audio;
    this.onLoadAudio(this.audio);
  }
};
</script>
<style lang="scss" scoped>
.songDetail {
  position: fixed;
  top: 70px;
  bottom: 50px;
  width: 100%;
  height: 81%;
  left: 0;
  z-index: 99;
  overflow-x: hidden;
  background: #fff;
  overflow: auto;
  .songContainer {
    position: relative;
    box-sizing: border-box;

    position: relative;
    width: 100%;
    height: 460px;
    margin: 0 auto;
    .bg {
      position: absolute;
      z-index: -1;
      width: 100%;
      height: 100%;
      background: radial-gradient(rgba(33, 33, 33, 0.7), rgba(33, 33, 33, 0)) no-repeat center / cover;
      filter: blur(50px);
    }
    .song {
      display: flex;
      .playDetail {
        width: 320px;
        height: 100%;
        position: relative;
        .playActive {
          transform: rotate(30deg);
          transform-origin: 35px -14px;
          transition: transform 0.5s ease-in;
          z-index: 100;
        }
        .zheng {
          transition: transform 0.5s ease-in;
          background: url("../../assets/images/play.jpg");
          height: 60px;
          width: 160px;
          position: absolute;
          left: 45%;
          top: 0;
        }
        .main {
          box-sizing: border-box;
          position: relative;
          width: 325px;
          height: 325px;
          border-radius: 50%;
          background: url("../../assets/images/track.jpg");
          background-position: center;
          border: 8px solid #8c8c8d;
          top: 50px;
          left: 20px;
          .singPic {
            background-color: #fff;
            width: 210px;
            height: 210px;
            border-radius: 50%;
            position: absolute;
            top: 50px;
            left: 50px;
            background-position: center center;
            background-repeat: no-repeat;
            background-size: cover;
          }
          .play {
            animation: rotate 30s linear infinite;
          }
          .pause {
            animation-play-state: paused;
          }
        }
      }
      .word {
        width: 400px;
        height: 100%;
        margin-left: 120px;
        .titleContainer {
          width: 100%;
          height: 60px;
          margin-top: 40px;
          color: #fff;
        }
        .wordoutside {
          margin-top: 30px;
          position: relative;
          overflow-y: auto;
          .wordContainer {
            height: 260px;
            .wordItem {
              padding: 8px 0;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 15px;
              font-size: 14px;
            }
            .active {
              color: #fff;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>