<template>
  <div id="app">
    <router-view v-if="isRouteActive"></router-view>
  </div>
</template>

<script>
import { remote } from "electron";
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
    // 保存窗口此时此刻的的大小
    setWindowState() {
      let win = remote.getCurrentWindow();
      // getBounds()方法返回一个Rectangle对象，包含窗口在屏幕上的坐标和大小
      let rect = win.getBounds();
      let isMaximize = win.isMaximized();
      let curWindowInfo = { rect, isMaximize };
      localStorage.setItem("winState", JSON.stringify(curWindowInfo));
    },
    // 每次启动应用恢复窗口大小
    getWindowState() {
      let win = remote.getCurrentWindow();
      let winState = localStorage.getItem("winState");
      if (winState) {
        winState = JSON.parse(winState);
        if (winState.isMaximize) {
          win.maximize();
        } else {
          win.setBounds(winState.rect);
        }
      }
      win.show();
    },
    // 防抖函数
    debounce(fn) {
      let timeout = null;
      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fn.apply(this, arguments);
        }, 300);
      };
    },
    reloadRouterView() {
      this.isRouteActive = false;
      this.$nextTick(() => {
        this.isRouteActive = true;
      });
    }
  },
  mounted() {
    window.onkeydown = function(e) {
      if (e.keyCode == 82 && (e.ctrlKey || e.metaKey)) {
        return false;
      }
    };
    this.getWindowState();

    let win = remote.getCurrentWindow();

    // 监听窗口事件
    win.on("maximize", () => {
      this.setWindowState();
    });
    win.on("unmaximize", () => {
      this.setWindowState();
    });
    win.on(
      "move",
      this.debounce(() => {
        this.setWindowState();
      })
    );
    win.on(
      "resize",
      this.debounce(() => {
        this.setWindowState();
      })
    );
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
