<template>
  <div
    class="playlist"
    :class="{ active: showPlaylist === true }"
    ref="playlist"
    id="playlist"
  >
    <div class="playlist-view">
      <div class="top">
        <div class="title">播放列表</div>
      </div>
      <div class="song-view">
        <div
          class="song-item"
          v-for="(item, index) in list"
          :key="index"
          :class="{ active: item.id === song.id }"
        >
          <div class="name">
            {{ item.name }}
            <img
              class="tag"
              src="../../assets/images/sq.png"
            />
            <img
              v-if="item.mv > 0"
              class="tag"
              src="../../assets/images/mv.png"
            />
            <div
              class="spin"
              v-show="item.id === song.id"
            ><i class="iconfont icon-yinleren"></i></div>
          </div>
          <div class="info">
            <div class="singer">{{ item.ar[0].name }}</div>

          </div>

          <div class="icon">
            <i
              class="iconfont icon-bofangsanjiaoxing"
              :class="{ 'icon-zanting1': item.id === song.id }"
              @click="play(item)"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      showPlaylist: false
    };
  },
  computed: {
    ...mapState({
      song: state => state.player.song,
      list: state => state.player.list
    })
  },
  mounted() {
    console.log("---Play list=", this.list);
    console.log("---Play song=", this.song);
    this.$bus.$on("showPlaylist", res => {
      if (this.list.length > 0) {
        if (this.showPlaylist) {
          this.showPlaylist = false;
        } else {
          this.showPlaylist = true;
        }
      }
    });

    this.globalClick(this.hidePlaylist);
    this.playlistClick(() => {
      // console.log('-----click in playlist----')
    });
  },
  methods: {
    play(item) {
      console.log("item.id=", item.id);
      this.$store.dispatch("playMusic", { music: item, is_playLocal: false });
    },
    hidePlaylist() {
      // console.log('-----globalClick -> hidePlaylist-----',this.$refs.playlist)
    }
  }
};
</script>
<style lang="scss" scoped>
.playlist {
  height: 550px;
  overflow-y: auto;
  width: 100%;
  background-color: transparent;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  .playlist-view {
    background-color: #fff;

    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
.playlist.active {
  right: 0;
  animation: 0.3s showup;
}
@keyframes showup {
  0% {
    right: -300px;
  }
  100% {
    right: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

div.spin {
  animation: spin 4s linear infinite;
  /*border: 1px red solid;*/
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;

  display: inline-block;

  transform-origin: 50% 50%;
}

.top {
  height: 50px;
  background: #31c27c;
  display: flex;
  color: #fff;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.song-item {
  font-size: 14px;
  padding: 10px 20px;
  border-bottom: 1px #f4f4f4 solid;
  position: relative;
  height: 40px;
  background: #fff;
  /*overflow: hidden;*/
  .name {
    width: 220px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .tag {
    height: 20px;
    margin-left: 5px;
    margin-top: -2px;
    cursor: pointer;
  }
  .info {
    display: flex;
    margin-top: 5px;
    font-size: 13px;
    justify-content: space-between;
    z-index: 1;
    .singer {
      color: #666;
    }
    .time {
      color: #aaa;
    }
  }
  .icon {
    position: absolute;
    width: 80px;
    background: #fafafa;
    height: 63px;
    display: flex;
    justify-content: flex-end;
    right: 0;
    top: 0;
    bottom: 0;
    border-bottom: 1px solid #f4f4f4;

    align-items: center;
    /*display: none;*/
    z-index: -1;
    padding-right: 20px;
    box-sizing: border-box;
    .iconfont {
      margin-left: 5px;
      font-size: 17px;
    }
    .iconfont:hover {
      cursor: pointer;
      color: #31c27c;
    }
  }
}
.song-item.active {
  background-color: #f8f8f8;
  .name {
    color: #31c27c;
    .iconfont {
      /*animation:3s round;*/
    }
  }
  .info {
    .singer {
      color: #31c27c;
    }
  }
  .icon {
    z-index: 1;
  }
}

.song-item:hover {
  background-color: #f8f8f8;
  .name {
    width: 180px;
  }
  .icon {
    z-index: 1;
    /*display: block;*/
  }
}
</style>
