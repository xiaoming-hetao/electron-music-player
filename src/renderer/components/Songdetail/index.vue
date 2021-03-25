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
            @click="handleShouqi"
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
      audioDom: "",
      baseY: 260,
      audioContext: ""
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
    },
    is_playLocal() {
      return this.$store.state.player.is_playLocal;
    }
  },

  methods: {
    onLoadAudio(audio) {
      // 创建音频上下文
      var context = new (window.AudioContext || window.webkitAudioContext)();
      this.audioContext = context;
      // 创建分析器，用于获取音频的频率数据
      var analyser = context.createAnalyser();
      analyser.fftSize = 512;

      // 设置音频节点，关联到 AudioContext 上，作为整个音频分析过程的输入
      var source = context.createMediaElementSource(audio); //通过<audio>节点创建音频源
      source.connect(analyser); //将音频源关联到分析器
      analyser.connect(context.destination); //把分析器关联到输出设备

      var canvas = document.getElementById("waveCanvas");
      canvas.width = window.innerWidth;
      canvas.height = 300;

      var ctx = canvas.getContext("2d");
      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;

      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      var barWidth = (WIDTH / bufferLength) * 1.5;
      var barHeight;

      function renderFrame() {
        requestAnimationFrame(renderFrame);
        // 获取频率数据
        // getByteFrequencyData 是对已有的数组元素进行赋值，而不是创建后返回新的数组。
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        for (var i = 0, x = 0; i < bufferLength; i++) {
          // 根据频率值映射一个矩形的高度
          barHeight = dataArray[i];

          // 根据每个矩形的高度映射一个背景色，使用渐变效果
          var gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(1, "#0f00f0");
          gradient.addColorStop(0.5, "#ff0ff0");
          gradient.addColorStop(0, "#f00f00");
          ctx.fillStyle = gradient; //填充

          // ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      }

      renderFrame();
    },
    handleShouqi() {
      this.$router.go(-1);
      // if (this.is_playLocal) {
      //   this.audioContext.close();
      // }
    }
  },

  mounted() {
    if (this.is_playLocal) {
      this.onLoadAudio(this.audio);
    }
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