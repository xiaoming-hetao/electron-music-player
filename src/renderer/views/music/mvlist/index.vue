<template>
  <div class="mv-list">
    <div class="new-mv">
      <p
        class="title"
        @click="showAllNewMV"
      >最新MV&nbsp;<i
          ref="newmvIcon"
          class="el-icon-arrow-right"
        ></i></p>
      <el-row :gutter="15">
        <el-col
          class="mv-item"
          v-for="(item, index) of newMV"
          :key="index"
          :span="8"
          v-show="showNewAll ? true: index<3"
        >
          <div
            class="container"
            @click="playmv(item.id)"
          >
            <img
              :src="item.cover"
              width="260"
              height="140"
            />
            <div class="center">
              <i class="iconfont icon-iconset0481"></i>&nbsp;&nbsp;{{Math.floor(item.playCount/10000)}}万

            </div>
          </div>

          <p style="font-size:14px">{{item.name}}</p>
          <p style="font-size:12px;color:#999;margin-top:-10px;">{{item.artistName}}</p>
        </el-col>

      </el-row>
    </div>
    <div class="recommend-mv">
      <p
        class="title"
        @click="showAllRecommendMV"
      >推荐MV&nbsp;<i
          class="el-icon-arrow-right"
          ref="recommendmvIcon"
        ></i></p>
      <el-row :gutter="15">
        <el-col
          class="mv-item"
          v-for="(item, index) of recommendMV"
          :key="index"
          :span="8"
          v-show="showRecommendAll ? true: index<3"
        >
          <div
            class="container"
            @click="playmv(item.id)"
          >
            <img
              :src="item.picUrl"
              width="260"
              height="140"
            />
            <div class="center">
              <i class="iconfont icon-iconset0481"></i>&nbsp;&nbsp;{{item.playCount}}

            </div>
          </div>

          <p style="font-size:14px">{{item.name}}</p>
          <p style="font-size:12px;color:#999;margin-top:-10px;">
            <span
              v-for="(artist, index) of item.artists"
              :key="index"
            >{{artist.name}}&emsp;</span>
          </p>
        </el-col>

      </el-row>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      showNewAll: false,
      showRecommendAll: false
    };
  },
  computed: {
    ...mapState({
      newMV: state => state.search.newMVList,
      recommendMV: state => state.search.recommendMVList
    })
  },
  methods: {
    showAllRecommendMV() {
      this.showRecommendAll = !this.showRecommendAll;
      // 进来前先清除之前添加的类
      // 需要通过$el来获取组件中的DOM元素
      this.$refs.recommendmvIcon.classList.remove("rotate-down");
      this.$refs.recommendmvIcon.classList.remove("rotate-up");
      if (this.showRecommendAll) {
        this.$refs.recommendmvIcon.classList.add("rotate-down");
      } else {
        this.$refs.recommendmvIcon.classList.add("rotate-up");
      }
    },
    showAllNewMV() {
      this.showNewAll = !this.showNewAll;
      // 进来前先清除之前添加的类
      // 需要通过$el来获取组件中的DOM元素
      this.$refs.newmvIcon.classList.remove("rotate-down");
      this.$refs.newmvIcon.classList.remove("rotate-up");
      if (this.showNewAll) {
        this.$refs.newmvIcon.classList.add("rotate-down");
      } else {
        this.$refs.newmvIcon.classList.add("rotate-up");
      }
    },
    playmv(mvid) {
      console.log(mvid);
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    }
  }
};
</script>
<style lang="scss" scoped>
.mv-list {
  min-height: 620px;
  margin-left: 20px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  .title {
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
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
}
@keyframes up {
  0% {
    transform: rotate(90deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
@keyframes down {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(90deg);
  }
}
.rotate-down {
  animation: down 0.3s linear;
  animation-fill-mode: forwards;
}
.rotate-up {
  animation: up 0.3s linear;
  animation-fill-mode: forwards;
}
</style>