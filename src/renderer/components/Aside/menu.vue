<template>
  <el-scrollbar class="menu-view scroll-page">
    <div class="menu-group">
      <div class="menu-title">在线音乐</div>
      <div
        class="menu-item"
        :class="{ active: this.$route.name === 'music' }"
        @click="
          () => {
            this.$router.push({ name: 'music' });
          }
        "
      >
        <div class="left"><i class="iconfont icon-yinle"></i>发现音乐</div>
      </div>
      <div
        class="menu-item"
        :class="{ active: this.$route.name === 'show-mvlist' }"
        @click="showMVList"
      >
        <div class="left"><i class="iconfont icon-mv"></i>MV</div>
      </div>

    </div>

    <div class="menu-group">
      <div class="menu-title">我的音乐</div>
      <div
        class="menu-item"
        :class="{ active: this.$route.name === 'show-likelist' }"
        v-if="user.is_login"
        @click="
          () => {
            this.$router.push({ name: 'show-likelist' });
          }
        "
      >
        <div class="left"><i
            class="iconfont icon-shoucang hot"
            style="color: #666"
          ></i>我喜欢</div>
      </div>
      <div
        class="menu-item"
        :class="{ active: this.$route.name === 'show-localmusic' }"
        @click="
          () => {
            this.$router.push({ name: 'show-localmusic' });
          }
        "
      >
        <div class="left"><i class="iconfont icon-screen"></i>本地和下载</div>
      </div>

      <div
        class="menu-item"
        :class="{ active: this.$route.name === 'show-playhistory' }"
        @click="
          () => {
            this.$router.push({ name: 'show-playhistory' });
          }
        "
      >
        <div class="left"><i class="iconfont icon-lishi"></i>播放历史</div>
      </div>
    </div>

    <div class="menu-group">
      <div class="menu-title">
        <div class="left">我创建的歌单</div>
        <div class="right"><i
            class="iconfont icon-jia-copy"
            @click="createPlaylist"
          ></i><i
            class="iconfont icon-xiangxia"
            @click="handleCreateToggle"
            ref="createToggleIcon"
          ></i></div>
      </div>

      <div
        v-if="user.is_login"
        v-show="showCreatePlaylist"
      >
        <div
          class="menu-item"
          v-for="(item,index) of userCreatePlaylist"
          :key="index"
          @click="showUserCreatePlaylist(item.id)"
          @contextmenu="playlistRightClick(item.id,like=false)"
        >
          <div class="left">
            <i class="iconfont icon-yinyue"></i>
            <span>{{ item.name}}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-group">
      <div class="menu-title">
        <div class="left">我收藏的歌单</div>
        <div class="right"><i
            class="iconfont icon-xiangxia"
            ref="likeToggleIcon"
            @click="handleLikeToggle"
          ></i></div>
      </div>
      <div
        v-if="user.is_login"
        v-show="showLikePlaylist"
      >
        <div
          class="menu-item"
          v-for="(item,index) of userLikePlaylist"
          :key="index"
          @click="showUserLikePlaylist(item.id)"
          @contextmenu="playlistRightClick(item.id,like=true)"
        >
          <div class="left">
            <i class="iconfont icon-yinyue"></i>
            <span>{{ item.name}}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="新建歌单"
      :visible.sync="playlistDialogVisible"
      width="50%"
      top="23%"
      :modal="false"
      center
    >
      <el-input
        placeholder="请输新歌单标题"
        size="small"
        v-model="newplaylist"
      >
      </el-input>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          :disabled="!newplaylist"
          round
          :loading="isLoading"
          @click="handleCreate"
        >创 建</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="delDialogVisible"
      width="50%"
      top="23%"
      :modal="false"
      center
    >
      <p style="text-align:center;">确定删除该歌单？</p>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          round
          @click="handleDelPlaylist"
        >确 定</el-button>
      </span>
    </el-dialog>
  </el-scrollbar>
</template>

<script>
import { mapState } from "vuex";
import { ipcRenderer, remote, globalShortcut } from "electron";
import { createPlaylist, delPlaylist } from "../../api/user";
import db from "../../../lowdb/datastore";

export default {
  inject: ["reloadRouterView"],
  data() {
    return {
      playlistDialogVisible: false,
      delDialogVisible: false,
      newplaylist: "",
      isLoading: false,
      playlistId: "",
      like: false,
      showCreatePlaylist: true,
      showLikePlaylist: true
    };
  },

  methods: {
    // 重新向数据库拉取数据
    fetchCreateListData(userId) {
      const value = db
        .read()
        .get("create-playlist")
        .find({ userId })
        .value();
      this.$store.commit("SET_CREATE_PLAYLIST_DATA", { userCreatePlaylist: value.userCreatePlaylist });
    },
    fetchLikeListData(userId) {
      const value = db
        .read()
        .get("like-playlist")
        .find({ userId })
        .value();
      this.$store.commit("SET_LIKE_PLAYLIST_DATA", { userLikePlaylist: value.userLikePlaylist });
    },
    handleCreateToggle() {},
    handleLikeToggle() {},
    // 创建右键菜单
    playlistRightClick(id, like) {
      const that = this;
      let { Menu } = remote;
      let menu = Menu.buildFromTemplate([
        {
          label: "播放(Enter)",
          click() {
            that.playAll(id);
          }
        },
        {
          label: "下一首播放",
          click() {
            console.log("下一首播放", id, like);
          }
        },
        {
          type: "separator"
        },
        {
          label: "删除歌单(Delete)",

          accelerator: "Del", //绑定快捷键
          click() {
            that.delDialogVisible = true;
            that.playlistId = id;
            that.like = like;
          }
        }
      ]);
      menu.popup(remote.getCurrentWindow());
    },
    handleDelPlaylist() {
      const id = this.playlistId;
      const like = this.like;
      const userId = this.user.profile.userId;
      delPlaylist(id).then(res => {
        console.log(res, "删除歌单");
        if (res.code === 200) {
          ipcRenderer.send("delete_playlist", { id, like, userId });
          ipcRenderer.on("reply_delete_playlist", (event, data) => {
            if (data.code === 200 && data.type === "create") {
              this.delDialogVisible = false;
              this.fetchCreateListData(userId);
            } else if (data.code === 200 && data.type === "like") {
              this.delDialogVisible = false;
              this.fetchLikeListData(userId);
            }
          });
        }
      });
    },
    playAll(id) {
      this.$store.dispatch("playPlaylist", id);
    },
    showMVList() {
      this.$store.dispatch("showMVList");
      this.$router.push({ name: "show-mvlist" });
    },
    showUserCreatePlaylist(id) {
      this.$router.push({ name: "userplaylist-detail", query: { id } });
      this.reloadRouterView();
    },
    showUserLikePlaylist(id) {
      this.$router.push({ name: "userplaylist-detail", query: { id } });
      this.reloadRouterView();
    },
    createPlaylist() {
      // 登录后才允许创建歌单
      if (this.user.is_login) {
        this.playlistDialogVisible = true;
      } else {
        this.$bus.$emit("login");
      }
      console.log(this.user.profile.nickname);
    },
    handleCreate() {
      this.isLoading = true;
      createPlaylist(this.newplaylist).then(res => {
        if (res.code === 200) {
          this.$store.dispatch("SET_PLAYLIST", this.user.profile.userId);
          this.playlistDialogVisible = false;
          this.$message({
            message: "创建成功",
            type: "success",
            center: true
          });
        }
      });
    },
    // 侧边栏歌单的收起与展开动画
    handleCreateToggle() {
      this.showCreatePlaylist = !this.showCreatePlaylist;

      this.$refs.createToggleIcon.classList.remove("rotate-down");
      this.$refs.createToggleIcon.classList.remove("rotate-up");

      if (this.showCreatePlaylist) {
        this.$refs.createToggleIcon.classList.add("rotate-down");
      } else {
        this.$refs.createToggleIcon.classList.add("rotate-up");
      }
    },
    handleLikeToggle() {
      this.showLikePlaylist = !this.showLikePlaylist;

      this.$refs.likeToggleIcon.classList.remove("rotate-down");
      this.$refs.likeToggleIcon.classList.remove("rotate-up");

      if (this.showLikePlaylist) {
        this.$refs.likeToggleIcon.classList.add("rotate-down");
      } else {
        this.$refs.likeToggleIcon.classList.add("rotate-up");
      }
    }
  },
  created() {
    // 每次启动向主进程获取用户数据（喜欢列表，创建和收藏的歌单）
    let store = localStorage.getItem("profile");
    if (store !== null) {
      const userId = JSON.parse(store).userId;
      ipcRenderer.send("get_user_data", userId);
      ipcRenderer.on("reply_user_data", (event, data) => {
        let likelist = {
          songs: data.likelistData.likelist
        };

        const userCreatePlaylist = data.createPlaylistData.userCreatePlaylist;
        const userLikePlaylist = data.likePlaylistData.userLikePlaylist;

        this.$store.commit("SET_LIKELIST_DATA", likelist);
        this.$store.commit("SET_CREATE_PLAYLIST_DATA", { userCreatePlaylist });
        this.$store.commit("SET_LIKE_PLAYLIST_DATA", { userLikePlaylist });
      });
    }
  },
  computed: {
    ...mapState({
      user: state => state.user,
      userCreatePlaylist: state => state.user.userCreatePlaylist,
      userLikePlaylist: state => state.user.userLikePlaylist
    })
  }
};
</script>

<style lang="scss" scoped>
.scroll-page {
  overflow: hidden;
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
}

.menu-view {
  flex: 1;
  overflow: hidden;
  background: #fff;
  .menu-group {
    margin-bottom: 25px;
    padding: 0 20px;
    .menu-title {
      margin-bottom: 10px;
      font-size: 12px;
      padding-left: 10px;
      display: flex;
      align-items: center;
      color: #666;
      .left {
        flex: 1;
      }
      .right {
        width: 80px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .iconfont {
          cursor: pointer;
          font-size: 14px;
          color: #888;
          margin-left: 10px;
        }
      }
    }
    .menu-item {
      padding: 5px 10px;
      font-size: 13px;
      border-radius: 2px;
      margin-bottom: 5px;
      cursor: pointer;

      .left {
        width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        .iconfont {
          margin-right: 10px;
        }
        .iconfont.hot {
          color: #ff4400;
        }
      }
    }
    .menu-item:hover {
      background: #f7f7f3;
    }

    .menu-item.active {
      background: #f7f7f3;
    }
  }
}
@keyframes up {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-90deg);
  }
}
@keyframes down {
  0% {
    transform: rotate(-90deg);
  }
  100% {
    transform: rotate(0deg);
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
