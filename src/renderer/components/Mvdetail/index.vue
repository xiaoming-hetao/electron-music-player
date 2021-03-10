<template>
  <div class="mv-div">
    <div
      class="back"
      @click="()=>{handleBack()}"
    ><i class="el-icon-arrow-left"></i>&nbsp;MV详情</div>
    <video
      width="520"
      height="320"
      controls
      style="cursor: pointer;margin-top:20px;"
      autoplay
      ref="video"
    >
      <source type="video/mp4" />
    </video>

    <div class="top">
      <div class="info">
        <div class="author">
          <img :src="mvDetail.cover" />
          <span>{{ mvDetail.artistName }}</span>
        </div>
        <p style="font-size: 20px; font-weight: bold; margin-bottom: 5px">
          {{ mvDetail.name }}<i
            class="el-icon-caret-bottom"
            ref="descIcon"
            @click="handleShowDesc"
          ></i>
        </p>
        <span style="font-size: 14px; color: #cdcdcd">发布：{{ mvDetail.publishTime }}&nbsp;&nbsp;播放{{ Math.floor(mvDetail.playCount / 10000) }}万次</span>
        <div
          class="desc"
          v-if="showDesc"
        >{{ mvDetail.desc }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      showDesc: false
    };
  },
  methods: {
    handleBack() {
      this.$router.go(-1);
    },
    handleShowDesc() {
      this.showDesc = !this.showDesc;
      // 进来前先清除之前添加的类
      // 注意：this.$refs.descIcon获取到的是icon组件，不是dom元素
      // 需要通过$el来获取组件中的DOM元素
      this.$refs.descIcon.classList.remove("rotate-down");
      this.$refs.descIcon.classList.remove("rotate-up");
      if (this.showDesc) {
        this.$refs.descIcon.classList.add("rotate-up");
      } else {
        this.$refs.descIcon.classList.add("rotate-down");
      }
    }
  },
  computed: {
    ...mapState({
      mvDetail: state => state.player.mvDetail,
      mvUrl: state => state.player.mvUrl
    })
  },
  watch: {
    mvUrl(newValue, oldValue) {
      let video = this.$refs.video;
      console.log(video, "video");
      video.src = this.mvUrl;
    }
  }
};
</script>
<style lang="scss" scoped>
// //全屏按钮
// video::-webkit-media-controls-fullscreen-button {
//   display: none;
// }
// //播放按钮
// video::-webkit-media-controls-play-button {
//   display: none;
// }
// //进度条
// video::-webkit-media-controls-timeline {
//   display: none;
// }
// //观看的当前时间
// video::-webkit-media-controls-current-time-display {
//   display: none;
// }
// //剩余时间
// video::-webkit-media-controls-time-remaining-display {
//   display: none;
// }
// //音量按钮
// video::-webkit-media-controls-mute-button {
//   display: none;
// }
// video::-webkit-media-controls-toggle-closed-captions-button {
//   display: none;
// }
// //音量的控制条
// video::-webkit-media-controls-volume-slider {
//   display: none;
// }
// //所有控件
// video::-webkit-media-controls-enclosure {
//   display: none;
// }

.mv-div {
  width: 100%;
  min-height: 450px;
  margin-left: 20px;
  overflow-y: auto;
  .back {
    margin-top: 20px;
    font-size: 18px;
    font-weight: blod;
    cursor: pointer;
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
          width: 45px;
          height: 45px;
          border-radius: 50%;
          margin-right: 10px;
        }
      }
      .desc {
        font-size: 13px;
        color: #555;
        line-height: 20px;
        margin-top: 15px;
      }
    }
  }
}
// 旋转动画
@keyframes down {
  0% {
    transform: rotate(-180deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes up {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-180deg);
  }
}

// animation-fill-mode 属性规定动画在播放之前或之后，其动画效果是否可见,默认值为none
// forwards当动画完成后，保持最后一个属性值（在最后一个关键帧中定义）。
.rotate-down {
  animation: down 0.3s linear;
  animation-fill-mode: forwards;
}
.rotate-up {
  animation: up 0.3s linear;
  animation-fill-mode: forwards;
}
</style>
