<template>
  <div>
    <el-container
      class="container"
      id="main"
    >
      <el-header
        class="header"
        height="70px"
        style="-webkit-app-region: drag"
      >
        <header-view height="70px" />
      </el-header>
      <el-container style="position: relative;">
        <el-aside
          width="210px"
          class="aside"
        >
          <aside-view />
        </el-aside>
        <el-container>

          <el-main class="main">
            <keep-alive v-if="isRouteActive">
              <router-view></router-view>
            </keep-alive>
          </el-main>
        </el-container>

      </el-container>
      <keep-alive>
        <el-footer
          class="footer"
          height="70px"
        >
          <footer-view height="70px" />
        </el-footer>
      </keep-alive>
    </el-container>
    <login-view />
  </div>
</template>
<script>
import AsideView from "../components/Aside/";
import HeaderView from "../components/Header/";
import FooterView from "../components/Footer/";
import LoginView from "../components/Login/";
import Playlist from "../components/Playlist/";

export default {
  components: {
    AsideView,
    HeaderView,
    FooterView,
    LoginView,
    Playlist
  },
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
<style lang="scss" scoped>
.aside {
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #efefef, #efefef);
}

.container {
  height: 100vh;
}

.header {
  background: #fafafa;
}

.main {
  padding: 0;
  margin: 0;
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-shrink: 0;
  border-left: 1px solid #ebebe5;
}

.footer {
  background: #f7f7f7;
  padding: 0;
}
</style>
