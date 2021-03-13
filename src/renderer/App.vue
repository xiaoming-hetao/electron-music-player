<template>
  <div id="app">
    <router-view v-if="isRouteActive"></router-view>
  </div>
</template>

<script>
export default {
  name: "clound-music",
  provide() {
    return {
      reloadRouterView: this.reloadRouterView
    };
  },
  data() {
    return {
      isRouteActive: true
    };
  },
  methods: {
    reloadRouterView() {
      this.isRouteActive = false;
      this.$nextTick(() => {
        this.isRouteActive = true;
      });
    }
  }
};
</script>

<style lang="scss">
@import url(./assets/styles/public.scss);

body {
  padding: 0;
  margin: 0;
  -webkit-user-select: none;
  height: 800px;
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
/*滚动条的整体部分*/
::-webkit-scrollbar {
  width: 6px;
  height: 4px;
  background-color: #fff;
}
/*定义滚动条轨道*/
::-webkit-scrollbar-track {
  border-radius: 2px;
  background: #fff;
}
/*定义滑块*/
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: #ddd;
}
</style>
