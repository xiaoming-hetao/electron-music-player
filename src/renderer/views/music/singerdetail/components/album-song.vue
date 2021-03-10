<template>
  <div class="list">
    <el-table
      size="small"
      :stripe="true"
      :data="songlist"
    >
      <el-table-column>
        <template slot-scope="scope">
          <div class="name-row">
            <div class="left">
              <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
              <div style="display: inline-block; margin-left: 20px">
                <i
                  @click="likeMusic(scope.row)"
                  class="shoucang iconfont icon-shoucang"
                ></i>
                <span>{{ scope.row.name }}</span>
                <img
                  class="tag"
                  src="../../../../assets/images/sq.png"
                />
                <img
                  v-if="scope.row.mv > 0"
                  class="tag"
                  src="../../../../assets/images/mv.png"
                  @click="playmv(scope.row.mv)"
                />
              </div>
            </div>
            <div class="btns">
              <i
                class="iconfont icon-zanting play"
                @click="play(scope.row)"
              ></i>
              <i class="iconfont icon-gengduo more"></i>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        width="60"
        prop="dt"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.dt | formatDuring }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { getAlbumContent } from "../../../../api/search";
export default {
  props: {
    albumId: Number
  },
  data() {
    return {
      songlist: []
    };
  },
  methods: {
    likeMusic(item) {
      like(item.id).then(res => {
        console.log(res, "likesuccess");
      });
    },
    play(item) {
      console.log("item.id=", item.id);
      this.$store.dispatch("playMusic", item.id);
    },
    playmv(mvid) {
      console.log(mvid);
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    }
  },
  watch: {
    albumId(newValue, oldValue) {
      getAlbumContent(newValue).then(res => {
        this.songlist = res.songs;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.list {
  .el-table {
    background: none;
    th {
      background: none;
    }
    tr {
      background: none;
    }
    tr:hover {
      .btns {
        .iconfont {
          display: block;
        }
        .iconfont:hover {
          color: #31c27c;
        }
      }
    }
  }
  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .left {
      .shoucang {
        font-size: 15px;
        margin-right: 5px;
        cursor: pointer;
      }
      .shoucang:hover {
        color: red;
      }
      .tag {
        height: 20px;
        margin-left: 5px;
        margin-top: -2px;
        cursor: pointer;
      }
    }
    .btns {
      display: flex;
      align-items: center;
      .iconfont {
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
        color: #999;
        display: none;
      }
    }
  }
}
</style>