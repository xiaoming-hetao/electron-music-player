<template>
  <div
    class="header-view"
    :style="{ height: height }"
  >
    <div class="left flex-c-l">
      <el-button
        class="no-drag"
        size="mini"
        type="text"
        @click="back"
      >
        <i class="btn el-icon-arrow-left"></i>
      </el-button>
      <el-button
        class="no-drag"
        size="mini"
        type="text"
        @click="advance"
      >
        <i class="btn el-icon-arrow-right"></i>
      </el-button>
      <el-button
        class="no-drag hover-color"
        size="mini"
        type="text"
        @click="refresh"
      >
        <i class="btn el-icon-refresh"></i>
      </el-button>

      <div class="search no-drag">
        <el-popover
          width="350"
          trigger="click"
          :disabled="hotVisible"
        >
          <el-input
            size="mini"
            prefix-icon="el-icon-search"
            v-model="searchContent"
            @focus="showHotSearch"
            @input="handleSearchInput"
            placeholder="搜索音乐、歌手、歌单、专辑"
            slot="reference"
          ></el-input>
          <!-- 输入搜索 -->
          <div
            v-if="searchContent"
            class="input-search"
          >
            <div v-if="searchInputData.songs">
              <p><img src="../../assets/images/song.png" />&nbsp;&nbsp;单曲</p>
              <div
                v-for="(song, index) of searchInputData.songs"
                :key="index"
                class="search-item"
                @click="handleHotSearch(song.name)"
              >
                {{ song.name }}-{{ song.artists[0].name }}
              </div>
            </div>
            <div v-if="searchInputData.albums">
              <p><img src="../../assets/images/album.png" />&nbsp;&nbsp;专辑</p>
              <div
                v-for="(album, index) of searchInputData.albums"
                :key="index"
                class="search-item"
                @click="handleAlbumSearch(album)"
              >
                {{ album.name }}-{{ album.artist.name }}
              </div>
            </div>
            <div
              class="palylists"
              v-if="searchInputData.playlists"
            >
              <p><img src="../../assets/images/playlist.png" />&nbsp;&nbsp;歌单</p>
              <div
                v-for="(playlist, index) of searchInputData.playlists"
                :key="index"
                class="search-item"
                @click="handlePlaylistSearch(playlist.id)"
              >
                {{ playlist.name }}
              </div>
            </div>
            <div v-if="searchInputData.artists">
              <p><img src="../../assets/images/user.png" />&nbsp;&nbsp;歌手</p>
              <div
                v-for="(artist, index) of searchInputData.artists"
                :key="index"
                class="search-item"
                @click="handleArtistSearch(artist)"
              >
                {{ artist.name }}
              </div>
            </div>
          </div>
          <!-- 热搜榜 -->
          <div
            style="height: 500px; overflow-y: auto"
            v-if="!searchContent"
          >
            <div
              class="search-history"
              v-if="searchHistory.length"
            >
              <p>搜索历史&nbsp;&nbsp;<i
                  class="el-icon-delete"
                  style="cursor: pointer"
                  @click="delHistory"
                ></i></p>
              <el-tag
                v-for="(songName, index) of searchHistory"
                :key="index"
                @close="handleTagClose(songName)"
                @click="handleHotSearch(songName)"
                effect="plain"
                size="small"
                closable
                type="info"
              >
                {{ songName }}
              </el-tag>
            </div>
            <p>热搜榜</p>
            <div
              v-for="(item, index) of hotSearchData"
              :key="item.score"
              @click="handleHotSearch(item.searchWord)"
              class="hot-div"
              style="margin-top: 20px; line-height: 20px"
            >
              <span :class="{ active: index <= 2 }">{{ index + 1 }}</span>
              <div style="display: inline-block; margin-left: 25px; cursor: pointer">
                <span>
                  {{ item.searchWord }}&nbsp;&nbsp;<img
                    style="width: 20px; height: 12px"
                    v-if="item.iconUrl"
                    :src="item.iconUrl"
                  />&nbsp;&nbsp;<i style="font-size: 12px; color: #bfbfbf">{{ item.score }}</i>
                </span>
                <span style="display: block; font-size: 12px; color: #bfbfbf">{{ item.content }}</span>
              </div>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="center">
      <div
        class="avatar"
        @click="login"
      >
        <img
          v-if="user.is_login"
          :src="user.profile.avatarUrl || initAvatar"
        />
        <img
          v-else
          src="../../assets/images/user.png"
        />
      </div>

      <el-popover
        width="70"
        trigger="click"
        :disabled="visible"
      >
        <div @click="handleLogout">
          <i class="el-icon-switch-button"></i>
          <span style="pointer: cursor">退出</span>
        </div>
        <el-button
          style="color: #555"
          type="text"
          class="no-drag"
          size="mini"
          @click="login"
          slot="reference"
        >
          {{ user.is_login ? user.profile.nickname : "未登录" }}
          <span style="font-size: 16px; color: bfbfbf"><i class="el-icon-caret-bottom"></i></span>
        </el-button>
      </el-popover>
    </div>

    <div class="right">
      <el-button
        @click="minimize"
        class="no-drag"
        size="mini"
        type="text"
      >
        <i class="btn el-icon-minus"></i>
      </el-button>
      <el-button
        @click="close"
        class="no-drag hover-color"
        size="mini"
        type="text"
      >
        <i class="btn el-icon-close"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
import { logout } from "../../api/user";
import { search, searchHot, searchSuggest } from "../../api/search";
const { ipcRenderer } = require("electron");
export default {
  data() {
    return {
      visible: true,
      hotVisible: true,
      initAvatar: "../../assets/images/initAvatar.png",
      searchContent: "",
      hotSearchData: [],
      searchHistory: [],
      searchInputData: {}
    };
  },
  props: {
    height: {
      type: String,
      default: "40px"
    }
  },
  methods: {
    handleSearchInput() {
      if (this.searchContent) {
        searchSuggest(this.searchContent).then(res => {
          this.searchInputData = res.result;
        });
      }
    },
    handleAlbumSearch(album) {
      this.$router.push({ name: "show-albumdetail" });
      this.$store.dispatch("handleAlbumSearch", { album });
      this.hotVisible = true;
    },
    handlePlaylistSearch(id) {},
    handleArtistSearch(artist) {
      this.$router.push({ name: "show-singerdetail" });
      localStorage.setItem("artistID", artist.id);
      this.$store.dispatch("handleArtistSearch", { id: artist.id });
      this.hotVisible = true;
    },
    showHotSearch() {
      this.hotVisible = false;
    },
    handleHotSearch(keywords) {
      console.log(keywords);
      // 加入搜索历史(localStorage只能存储字符串)
      let historyData = localStorage.getItem("searchHistory");
      if (!historyData) {
        historyData = [];
      } else {
        historyData = JSON.parse(historyData);
      }
      // 防止重复加入
      if (!historyData.includes(keywords)) {
        historyData.push(keywords);
        localStorage.setItem("searchHistory", JSON.stringify(historyData));
        this.searchHistory = historyData;
      }

      this.$router.push({ name: "show-searchlist" });
      localStorage.setItem("keywords", keywords);
      this.$store.dispatch("handleHotSearch", { keywords });
      this.hotVisible = true;
    },
    handleTagClose(songName) {
      this.searchHistory.splice(this.searchHistory.indexOf(songName), 1);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },
    delHistory() {
      localStorage.removeItem("searchHistory");
      this.searchHistory = [];
    },

    close() {
      ipcRenderer.send("close");
    },
    minimize() {
      ipcRenderer.send("minimize");
    },
    back() {
      console.log(this.$route.name, "routername");
      if (this.$route.name !== "music") {
        this.$router.go(-1);
      }
      if (this.$route.name === "show-searchlist") {
        this.$router.go(-1);
      }
    },
    advance() {
      this.$router.go(1);
    },
    refresh() {
      this.$bus.$emit("page-refresh", this.$route.name);
    },
    login() {
      if (this.user.is_login) {
        this.visible = false;
        console.log("login");
        this.$bus.$emit("logout");
      } else {
        this.$bus.$emit("login");
      }
    },
    handleLogout() {
      logout().then(res => {
        if (res.code === 200) {
          this.$store.dispatch("SET_LOGOUT");
          this.visible = true;
        }
      });
    }
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
  },
  mounted() {
    let historyData = localStorage.getItem("searchHistory");
    if (historyData) {
      this.searchHistory = JSON.parse(historyData);
    } else {
      localStorage.setItem("searchHistory", []);
    }
    searchHot().then(res => {
      this.hotSearchData = res.data;
    });
  }
};
</script>

<style lang="scss" scoped>
.input-search {
  p {
    height: 30px;
    line-height: 30px;
    background: #e6e6e6;

    img {
      width: 25px;
      height: 25px;
    }
  }
  .search-item {
    cursor: pointer;
    margin: 10px 32px;
    font-size: 12px;
  }
}

/deep/.el-tag {
  cursor: pointer;
  border-radius: 15px;
  margin: 5px 5px;
}
.hot-div:hover {
  background: #e6e6e6;
}
.active {
  color: red;
}
.header-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /deep/ .left {
    .btn {
      font-size: 17px;
      color: #999;
    }
    .btn:hover {
      color: #31c27c;
    }
    .el-icon-refresh {
      color: #333;
    }
    .search {
      margin-left: 20px;
      width: 200px;
      .el-input__inner {
        border: none;
        border-radius: 30px;
        background: #e9e9e9;
        color: #8c8c8c;
      }
    }
  }
  .center {
    .avatar {
      display: inline-block;
      width: 30px;
      height: 30px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        cursor: pointer;
      }
    }
  }
  .right {
    .btn {
      font-size: 17px;
      color: #333;
    }
    .btn:hover {
      color: #31c27c;
    }
  }
}
</style>
