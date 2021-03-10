<template>
  <div
    class="search-music"
    ref="searchlist"
  >
    <p style="font-size: 16px; font-weight: bold; margin-left: 20px">
      找到<span>&nbsp;{{ songCount }}&nbsp;首单曲</span>
    </p>
    <p style="font-size: 14px; font-weight: bold; margin-left: 20px">歌曲列表</p>

    <songlist :songlist="list" />

    <div style="text-align: center; margin: 20px 0">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :hide-on-single-page="true"
        :page-size="pageSize"
        layout="prev, pager, next"
        :total="songCount"
      >
      </el-pagination>
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import songlist from "../../../components/Songlist";
export default {
  components: {
    songlist
  },
  data() {
    return {
      showPlaylist: false,
      currentPage: 1,
      pageSize: 100,
      keywords: ""
    };
  },
  computed: {
    ...mapState({
      list: state => state.search.list,
      song: state => state.search.song,
      songCount: state => state.search.songCount
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
    handleCurrentChange(currentPage) {
      // 单曲，专辑，歌手搜索分别对应不同的action
      const keywords = localStorage.getItem("keywords");
      console.log(currentPage, "当前页");
      this.$store.dispatch("handleHotSearch", {
        keywords,
        limit: this.pageSize,
        offset: currentPage - 1
      });

      //   this.currentPage = currentPage;
      //   每次切换页面让滚动条回到顶部
      this.$refs.searchlist.scrollTop = 0;
    },
    likeMusic(item) {
      like(item.id).then(res => {});
    },
    play(item) {
      console.log("item.id=", item.id);
      this.$store.dispatch("playMusic", item.id);
    },
    hidePlaylist() {
      // console.log('-----globalClick -> hidePlaylist-----',this.$refs.playlist)
    }
  }
};
</script>
<style lang="scss" scoped>
.search-music {
  min-height: 430px;
  width: 100%;
  overflow-y: auto;
}
</style>
