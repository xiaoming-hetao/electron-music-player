<template>
  <div>
    <div @click="() => {this.addFileDialog = true}">添加</div>

    <div
      class="addfile-dialog"
      v-if="addFileDialog"
    >
      <div class="mask"></div>
      <div class="content">
        <div class="head"><label>选择本地音乐文件夹</label><span
            class="el-icon-close"
            @click="addFileDialogClose"
          ></span></div>
        <div class="list">
          <div
            v-for="(item, index) of addedDir"
            :key="index"
          >
            <div
              class="row"
              @click="() => {data.checked = !data.checked;}"
            >

              <span>{{item.path}}</span>
            </div>
          </div>

        </div>
        <div class="opts">
          <div
            class="btn confirm"
            @click="scan"
          >确认</div>
          <div
            class="btn"
            @click="fileDialogOpen"
          >添加文件夹</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { remote, ipcRenderer } from "electron";

// import _ from "underscore";
export default {
  data() {
    return {
      addedDir: [],
      addFileDialog: false
    };
  },
  mounted() {
    ipcRenderer.on("scanningEnd", e => {
      let localPlayList =
        db
          .read()
          .get("localPlayList")
          .value() || [];
      let temp = [];
      console.log(localPlayList, "localPlayList");
      // if(localPlayList.length > 0) {
      //     localPlayList.map((d, k) => {
      //         if(d.form != 'local') {
      //             temp.push(d);
      //         }
      //     })
      // }
      // store.dispatch(Actions.setPlayList(playlist));
      // store.dispatch(Actions.setLocalPlayList(temp));
    });
  },
  methods: {
    fileDialogOpen() {
      remote.dialog.showOpenDialog(
        {
          title: "选择添加目录",
          properties: ["openDirectory", "multiSelections"]
        },
        files => {
          if (!files) return;
          let addedDir = this.addedDir;
          files.map(dir => {
            let f = false;
            addedDir.map(d => {
              if (d.path == dir) {
                f = true;
              }
            });
            if (!f) {
              addedDir.push({
                path: dir,
                checked: false
              });
            }
          });
          this.addedDir = addedDir;
        }
      );
      console.log(this.addedDir, "1122");
    },
    addFileDialogClose() {
      this.addFileDialog = false;
    },
    scan() {
      this.addFileDialogClose();

      setTimeout(() => {
        let addedDir = this.addedDir;
        // 由主进程对扫描数据进行处理
        ipcRenderer.send("scanningDir", addedDir);
      }, 800);
    }
  }
};
</script>
<style lang="scss" scoped>
$theme: #666;
.addfile-dialog {
  width: calc(100vw - 50px);
  height: calc(100vh - 35px);
  // position: fixed;
  left: 25px;
  top: 10px;
  z-index: 999;
  .mask {
    width: 100%;
    height: 100%;
    background: none;
  }
  .content {
    width: 72vw;
    height: 50vh;
    background: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
    .head {
      width: 100%;
      height: 38px;
      display: flex;
      justify-content: space-between;
      padding: 0px 0px 0px 12px;
      align-items: center;
      label {
        color: #333;
        font-size: 12px;
      }
      span {
        display: flex;
        width: 38px;
        justify-content: center;
        align-items: center;
        color: #999;
        font-size: 20px;
        cursor: pointer;
        -webkit-app-region: no-drag;
        cursor: pointer;
      }
    }
    .list {
      width: 100%;
      height: calc(100% - 38px - 50px);
      overflow-y: auto;
      -webkit-app-region: no-drag;
      padding: 0px 20px 0px 12px;
      .row {
        width: 100%;
        display: flex;
        height: 40px;
        align-items: center;
        cursor: pointer;
        .checkbox {
          width: 40px;
          height: 40px;
          color: #999;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
        }
        .checked {
          color: $theme;
        }
        span {
          display: block;
          width: calc(100% - 40px);
          height: 40px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 40px;
          color: #999;
          font-size: 12px;
        }
      }
    }
    .opts {
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: flex-end;
      padding: 0px 12px;
      align-items: center;
      box-shadow: 0px -1px 5px rgba(0, 0, 0, 0.05);
      .btn {
        min-width: 20vw;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #e6e6e6;
        margin-left: 15px;
        font-size: 12px;
        padding: 0px 10px;
        -webkit-app-region: no-drag;
        cursor: pointer;
      }
      .confirm {
        background: $theme;
        color: #fff;
      }
    }
  }
}
</style>