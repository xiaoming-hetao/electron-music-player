<template>
  <div
    class="local-music"
    v-loading.lock="loading"
    element-loading-text="正在扫描歌曲文件..."
    element-loading-spinner="el-icon-loading"
  >

    <div style="margin: 20px 20px;">
      <div style="float:left">
        <span style="font-size:18px;font-weight:bold">本地音乐</span>&emsp;<span style="color:#999;font-size:14px">共{{localMusicList.length}}首</span>
      </div>
      <div style="float:right"><span style="color:#999;font-size:14px">当前目录：{{musicPath}}</span>&emsp;
        <span
          @click="() => {this.addFileDialog = true}"
          style="color:#0a87fc;font-size:14px;cursor:pointer"
        >选择目录</span>
      </div>
    </div>

    <el-dialog
      title="选择本地音乐文件夹"
      :visible.sync="addFileDialog"
      :modal="false"
      center
      top="23%"
    >

      <div class="list">
        <div
          v-for="(item, index) of addedDir"
          :key="index"
        >
          当前所选文件目录：<span>{{item.path}}</span>
        </div>

      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          size="small"
          @click="fileDialogOpen"
        >添加文件夹</el-button>
        <el-button
          type="primary"
          size="small"
          @click="scan"
          :disabled="!addedDir.length"
        >确 认</el-button>
      </div>
    </el-dialog>
    <div class="tracks">
      <div class="list">
        <el-table
          size="small"
          :stripe="true"
          :data="localMusicList"
          @row-dblclick="handleDBclick"
        >
          <el-table-column label="音乐标题">
            <template slot-scope="scope">
              <div class="name-row">
                <div class="left">
                  <span style="color: #dbdbdb">{{ scope.$index &lt; 9 ? "0" + (scope.$index + 1) : scope.$index + 1 }}</span>
                  <div style="display: inline-block; margin-left: 20px">
                    <span>{{ scope.row.name }}</span>
                  </div>

                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            width="200"
            label="歌手"
            prop="ar[0].name"
          >
            <template slot-scope="scope">
              <span
                style="width: 140px; cursor: pointer"
                class="line-1 hover"
                :title="scope.row.ar[0].name"
              >{{
                scope.row.ar[0].name
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="200"
            label="专辑"
            prop="al.name"
          >
            <template slot-scope="scope">
              <span
                style="width: 190px; cursor: pointer"
                class="line-1 hover"
                :title="scope.row.al.name"
              >{{ scope.row.al.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="150"
            label="大小"
          >
            <template slot-scope="scope">
              <span>{{  parseFloat(scope.row.size/(1024*1024)).toFixed(2) }}MB</span>
            </template>
          </el-table-column>
        </el-table>

      </div>
    </div>

  </div>
</template>
<script>
import { remote, ipcRenderer } from "electron";
import db from "../../../../lowdb/localmusic";
export default {
  data() {
    return {
      addedDir: [],
      addFileDialog: false,
      loading: false,
      musicPath: "",
      localMusicList: []
    };
  },

  methods: {
    handleDBclick(row) {
      console.log(typeof row);
      this.play(row);
    },
    play(row) {
      this.$store.dispatch("playLocalMusic", { music: row, is_playLocal: true });
    },
    fileDialogOpen() {
      remote.dialog.showOpenDialog(
        {
          title: "选择本地音乐文件夹",
          properties: ["openDirectory"]
        },
        files => {
          if (!files) return;
          let addedDir = [];
          files.map(dir => {
            addedDir.push({
              path: dir
            });
          });
          this.addedDir = addedDir;
        }
      );
    },
    addFileDialogClose() {
      this.addFileDialog = false;
    },
    scan() {
      this.loading = true;
      this.addFileDialogClose();
      let addedDir = this.addedDir;
      // 由主进程对扫描数据进行处理
      ipcRenderer.send("scanningDir", addedDir);
      ipcRenderer.on("scanningEnd", (event, data) => {
        const value = db
          .read()
          .get("local-music")
          .value();
        const path = db
          .read()
          .get("addedDir")
          .value();
        this.musicPath = path[0].path;
        this.localMusicList = value;
      });
    }
  },
  watch: {
    localMusicList(newVal, oldVal) {
      if (newVal.length) {
        this.loading = false;
      } else {
        const value = db
          .read()
          .get("local-music")
          .value();
        const path = db
          .read()
          .get("addedDir")
          .value();
        this.musicPath = path[0].path;

        this.localMusicList = value;
      }
    }
  },
  mounted() {
    const value = db
      .read()
      .get("local-music")
      .value();
    const path = db
      .read()
      .get("addedDir")
      .value();
    this.musicPath = path[0].path;

    this.localMusicList = value;
  }
};
</script>
<style lang="scss" scoped>
.local-music {
  min-height: 430px;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  .tracks {
    //   background: #fafafa;

    padding: 0 20px;

    .list {
      .el-table {
        background: none;
        th {
          background: none;
        }
        tr {
          background: none;
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
}
</style>