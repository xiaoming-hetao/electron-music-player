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
          <canvas
            id="waveCanvas"
            style="margin-left:20px;margin-top:50px;"
          >

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
              <span @click="toAlbum">{{songdetail.ar[0].name}}</span>--<span @click="toSinger">{{songdetail.al.name}}</span>
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
      // audio: null,
      baseY: Math.floor((window.innerHeight * 2) / 3)
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
  updated() {
    // this.toWordPosition();
    // this.initAudioContext();
  },
  methods: {
    // 波形图
    initAudioContext() {
      let audioContext = new (window.AudioContext || window.webkitAudioContext)();
      let canvas = document.getElementById("waveCanvas");
      // console.log(canvas);
      let ctx = canvas.getContext("2d");
      let width = canvas.offsetWidth;
      let height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      ctx.beginPath();
      ctx.fillStyle = "rgba(102,102,102,0.8)";
      ctx.moveTo(0, this.baseY);
      ctx.lineTo(width, this.baseY);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // this.audio = document.getElementById('audio');
      this.audio.crossOrigin = "anonymous";
      let source = audioContext.createMediaElementSource(this.audio);
      console.log(this.audio, "audio1111");
      let analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      function draw(array) {
        ctx.clearRect(0, 0, width, height);
        //array的长度为1024, 总共取10个关键点,关键点左右边各取五个点作为过渡,波浪更为自然;
        let waveArr1 = [],
          waveArr2 = [],
          waveTemp = [],
          leftTemp = [],
          rightTemp = [],
          waveStep = 50,
          leftStep = 70,
          rightStep = 90;
        //事先定好要取的点的key,相比下面直接循环整个数组来说效率高很多。
        let waveStepArr = [0, 51, 102, 153, 204, 255, 306, 357, 408];
        let leftStepArr = [70, 141, 212, 283, 354];
        let rightStepArr = [90, 181, 272, 363, 454];
        waveStepArr.map(key => {
          waveTemp.push(array[key] / 2.6);
        });
        leftStepArr.map(key => {
          leftTemp.unshift(Math.floor(array[key] / 4.8));
        });
        rightStepArr.map(key => {
          rightTemp.push(Math.floor(array[key] / 4.8));
        });

        waveArr1 = leftTemp.concat(waveTemp).concat(rightTemp);
        waveArr2 = leftTemp.concat(rightTemp);
        waveArr2.map((data, k) => {
          waveArr2[k] = data * 1.8;
        });
        let waveWidth = Math.ceil(this.width / (waveArr1.length - 3));
        let waveWidth2 = Math.ceil(this.width / (waveArr2.length - 3));
        ctx.beginPath();
        ctx.fillStyle = "rgba(102,102,102,0.4)";
        ctx.moveTo(-waveWidth2, this.baseY - waveArr2[0]);
        for (let i = 1; i < waveArr2.length - 2; i++) {
          let p0 = { x: (i - 1) * waveWidth2, y: waveArr2[i - 1] };
          let p1 = { x: i * waveWidth2, y: waveArr2[i] };
          let p2 = { x: (i + 1) * waveWidth2, y: waveArr2[i + 1] };
          let p3 = { x: (i + 2) * waveWidth2, y: waveArr2[i + 2] };

          for (let j = 0; j < 100; j++) {
            let t = j * (1.0 / 100);
            let tt = t * t;
            let ttt = tt * t;
            let CGPoint = {};
            CGPoint.x =
              0.5 *
              (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * ttt);
            CGPoint.y =
              0.5 *
              (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * ttt);
            ctx.lineTo(CGPoint.x, this.baseY - CGPoint.y);
          }
          ctx.lineTo(p2.x, this.baseY - p2.y);
        }
        ctx.lineTo((waveArr2.length - 1) * waveWidth2, this.baseY - waveArr2[waveArr2.length - 1]);
        ctx.lineTo(width + waveWidth2, this.baseY);
        ctx.lineTo(width + waveWidth2, height);
        ctx.lineTo(-1 * waveWidth2, height);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(102,102,102,0.8)";
        ctx.moveTo(-waveWidth * 2, this.baseY - waveArr1[0]);
        for (let i = 1; i < waveArr1.length - 2; i++) {
          let p0 = { x: (i - 2) * waveWidth, y: waveArr1[i - 1] };
          let p1 = { x: (i - 1) * waveWidth, y: waveArr1[i] };
          let p2 = { x: i * waveWidth, y: waveArr1[i + 1] };
          let p3 = { x: (i + 1) * waveWidth, y: waveArr1[i + 2] };

          for (let j = 0; j < 100; j++) {
            let t = j * (1.0 / 100);
            let tt = t * t;
            let ttt = tt * t;
            let CGPoint = {};
            CGPoint.x =
              0.5 *
              (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * ttt);
            CGPoint.y =
              0.5 *
              (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * ttt);
            ctx.lineTo(CGPoint.x, this.baseY - CGPoint.y);
          }
          ctx.lineTo(p2.x, this.baseY - p2.y);
        }
        ctx.lineTo(waveArr1.length * waveWidth, this.baseY - waveArr1[waveArr1.length - 1]);
        ctx.lineTo(width + waveWidth * 2, this.baseY);
        ctx.lineTo(width + waveWidth * 2, height);
        ctx.lineTo(-2 * waveWidth, height);
        ctx.fill();
        console.log("draw");
      }
      function animate() {
        function con() {
          let array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          draw(array);
          this.timer = requestAnimationFrame(con);
        }
        this.timer = requestAnimationFrame(con);
        console.log("animate");
      }
      animate();
    },
    toAlbum() {},
    toSinger() {}
    // 调到指定歌词
    // toWord() {
    //   var _this = this;
    //   this.audio.addEventListener("timeupdate", function(e) {
    //     let currentTime = e.target.currentTime;
    //     for (let key in _this.lyc) {
    //       if (key == Math.floor(currentTime)) {
    //         if (_this.lyc[key] == "&#8197;") {
    //           continue;
    //         }
    //         _this.cur = key;
    //       }
    //     }
    //   });
    // },
    // // 调到指定歌词的位置
    // toWordPosition() {
    //   if (this.mousein) {
    //     return;
    //   }
    //   this.$nextTick(() => {
    //     let lis = this.$refs.wordContainer.children;
    //     setTimeout(() => {
    //       clearTimeout(this.timer);
    //       for (let i = 0; i < lis.length; i++) {
    //         if (lis[i].classList[1] == "active" && lis[i - 1]) {
    //           let prevOffsetTop = lis[i - 1].offsetTop ? lis[i - 1].offsetTop : "",
    //             nowOffsetTop = lis[i].offsetTop ? lis[i].offsetTop : "",
    //             diff = nowOffsetTop - prevOffsetTop,
    //             t = 0,
    //             d = 30,
    //             height = this.$refs.outsideContainer.offsetHeight;
    //           run(this.$refs.outsideContainer, this.timer, t, prevOffsetTop, diff, d, height);
    //         }
    //       }
    //     }, 50);
    //   });
    // }
  },
  mounted() {
    this.initAudioContext();
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
            height: 320px;
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
      .otherControl {
        width: 50px;
        height: 100%;
        position: relative;
        i {
          color: rgb(170, 170, 170);
          font-size: 22px;
          position: absolute;
          left: 5px;
          cursor: pointer;
          &:hover {
            color: #9d9da4;
          }
        }
        .prev {
          top: 130px;
        }
        .next {
          top: 160px;
        }
        .icon-wenhao {
          bottom: 10px;
        }
        .icon-suoxiao {
          left: 50px;
          top: 50px;
          font-size: 35px;
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