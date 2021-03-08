<template>
  <div>
    <div class="tracks">
      <div class="list">
        <el-table size="small" :stripe="true" :data="songlist">
          <el-table-column label="音乐标题">
            <template slot-scope="scope">
              <div class="name-row">
                <div class="left">
                  <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
                  <div style="display: inline-block; margin-left: 20px">
                    <i @click="likeMusic(scope.row)" class="shoucang iconfont icon-shoucang"></i>
                    <span>{{ scope.row.name }}</span>
                    <img class="tag" src="../../assets/images/sq.png" />
                    <img v-if="scope.row.mv > 0" class="tag" src="../../assets/images/mv.png" @click="playmv(scope.row.mv)" />
                  </div>
                </div>
                <div class="btns">
                  <i class="iconfont icon-zanting play" @click="play(scope.row)"></i>
                  <i class="iconfont icon-gengduo more"></i>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="200" label="歌手" prop="ar[0].name">
            <template slot-scope="scope">
              <span style="width: 140px; cursor: pointer" class="line-1 hover" :title="scope.row.ar[0].name">{{
                scope.row.ar[0].name
              }}</span>
            </template>
          </el-table-column>
          <el-table-column width="200" label="专辑" prop="al.name">
            <template slot-scope="scope">
              <span style="width: 190px; cursor: pointer" class="line-1 hover" :title="scope.row.al.name">{{ scope.row.al.name }}</span>
            </template>
          </el-table-column>
          <el-table-column width="60" label="时长" prop="dt">
            <template slot-scope="scope">
              <span>{{ scope.row.dt | formatDuring }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- <div style="text-align: center; margin: 20px 0">
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
      </div> -->
    </div>
  </div>
</template>
<script>
import { like } from "../../api";
export default {
  props: {
    songlist: Array
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
      this.$store.dispatch("playMv", mvid);
      this.$router.push({ name: "play-mv" });
    }
  }
};
</script>
<style lang="scss" scoped>
.tracks {
  //   background: #fafafa;
  padding: 0 30px;
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
}
</style>
