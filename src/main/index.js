import { app, BrowserWindow, ipcMain, globalShortcut, Cookies } from "electron";
import db from "../lowdb/datastore";
const child_process = require("child_process");
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL = process.env.NODE_ENV === "development" ? `http://localhost:9080` : `file://${__dirname}/index.html`;

//const express = require('/app.js');

const express = require("express");
const apicache = require("apicache");
const path = require("path");
const fs = require("fs");
let cache = apicache.middleware;

import routes from "./routers";

function createWindow() {
  const app = express();

  // 跨域设置
  app.all("*", function(req, res, next) {
    if (req.path !== "/" && !req.path.includes(".")) {
      res.header("Access-Control-Allow-Credentials", true);
      // 这里获取 origin 请求头 而不是用 *
      res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
      res.header("Content-Type", "application/json;charset=utf-8");
    }
    next();
  });
  const onlyStatus200 = (req, res) => res.statusCode === 200;

  app.use(cache("2 minutes", onlyStatus200));

  app.use(express.static(path.resolve(__dirname, "public")));

  app.use(function(req, res, next) {
    const proxy = req.query.proxy;
    if (proxy) {
      req.headers.cookie = req.headers.cookie + `__proxy__${proxy}`;
    }
    next();
  });

  app.use("/", routes);
  const port = 3000;
  app.listen(port, () => {
    console.log(`server running @ http://localhost:${port}`);
  });
  //express();
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 1200,
    // 一开始先不让窗口显示出来，在App.vue组件中手动调用win.show()方法来显示窗口
    show: false,
    frame: false,
    // resizable: false,
    skipTaskbar: false,
    transparent: false,
    title: "electron音乐播放器",
    autoHideMenuBar: true,
    x: "50%",
    y: "50%"
  });

  mainWindow.loadURL(winURL);
  // mainWindow.webContents.openDevTools() = false
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 禁止按F5以及Ctrl||Command+R刷新
  globalShortcut.register("F5", () => {
    return false;
  });
  globalShortcut.register("CommandOrControl+R", () => {
    return false;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregister("F5");
  globalShortcut.unregister("CommandOrControl+X");
});
// app.setName("深空音乐");

ipcMain.on("close", e => {
  mainWindow.close();
});
ipcMain.on("minimize", e => {
  mainWindow.minimize();
});
ipcMain.on("maximize", e => {
  mainWindow.maximize();
});
ipcMain.on("unmaximize", e => {
  mainWindow.unmaximize();
});

//主进程监听scanningDir，当渲染进程触发scanningDir时主进程开始进行扫描
// ipcMain.on("scanningDir", (e, dirs) => {
//   const cp = child_process.fork(path.join(__dirname, "scanLocalFile.js"));
//   cp.on("message", m => {
//     console.log("message from child: " + JSON.stringify(m));
//     e.sender.send("scanningEnd");
//     cp.disconnect();
//   });
//   cp.send(dirs);
//   console.log(dirs, "11111");
// });

// 数据库操作
ipcMain.on("set_user", (event, data) => {
  const value = db
    .read()
    .get("user")
    .value();
  console.log(value, "database");
  if (!value.length) {
    //第一次添加数据
    db.read()
      .get("user")
      .insert({
        nickname: data.profile.nickname,
        userId: data.profile.userId
      })
      .write();
    console.log("success");
  } else {
    // 查看用户是否存在，存在则不进行存储
    const id = db
      .read()
      .get("user")
      .find({ userId: data.profile.userId })
      .value().userId;
    console.log(id);
    if (!id) {
      db.read()
        .get("user")
        .insert({
          nickname: data.profile.nickname,
          userId: data.profile.userId
        })
        .write();
    }
  }
});

ipcMain.on("set_likelist", (event, data) => {
  const value = db
    .read()
    .get("user-like")
    .value();
  if (!value.length) {
    db.read()
      .get("user-like")
      .insert(data)
      .write();

    console.log(value, "user-like");
  }
});

ipcMain.on("set_create_playlist", (event, data) => {
  const value = db
    .read()
    .get("create-playlist")
    .value();
  // 第一次添加
  if (!value.length) {
    db.read()
      .get("create-playlist")
      .insert(data)
      .write();
  } else {
    //更新歌单
    db.read()
      .get("create-playlist")
      .find({ userId: data.userId })
      .update("userCreatePlaylist", list => data.userCreatePlaylist)
      .write();
  }
});

ipcMain.on("set_like_playlist", (event, data) => {
  const value = db.get("like-playlist").value();
  if (!value.length) {
    db.read()
      .get("like-playlist")
      .insert(data)
      .write();
  }
});

ipcMain.on("get_user_data", (event, data) => {
  console.log(data, "get_user_data");
  const userId = data;
  const likelistData = db
    .read()
    .get("user-like")
    .find({ userId })
    .value();
  const likePlaylistData = db
    .read()
    .get("like-playlist")
    .find({ userId })
    .value();
  const createPlaylistData = db
    .read()
    .get("create-playlist")
    .find({ userId })
    .value();
  event.sender.send("reply_user_data", { likelistData, likePlaylistData, createPlaylistData });
});

// 喜欢音乐
ipcMain.on("like_music", (event, data) => {
  try {
    db.read()
      .get("user-like")
      .find({ userId: data.userId })
      .update("likelist", list => {
        list.unshift(data.song);
        return list;
      })
      .write();

    event.sender.send("reply_like_music", { code: 200, message: "已添加到我喜欢的音乐" });
  } catch (err) {
    console.log(err, "like_music error");
  }
});
// 取消喜欢
ipcMain.on("unlike_music", (event, data) => {
  try {
    db.read()
      .get("user-like")
      .find({ userId: data.userId })
      .update("likelist", list => {
        const afterRemove = list.filter(item => item.id !== data.songId);
        return afterRemove;
      })
      .write();

    event.sender.send("reply_unlike_music", { code: 200, message: "取消喜欢成功" });
  } catch (err) {
    console.log(err, "unlike_music error");
  }
});

// 收藏歌单
ipcMain.on("like_playlist", (event, data) => {
  try {
    db.read()
      .get("like-playlist")
      .find({ userId: data.userId })
      .update("userLikePlaylist", list => {
        list.unshift(data.playlist);
        return list;
      })
      .write();
    event.sender.send("reply_like_playlist", { code: 200, message: "收藏成功" });
  } catch (err) {
    console.log(err, "like_playlist error");
  }
});

// 取消收藏
ipcMain.on("unlike_playlist", (event, data) => {
  try {
    db.read()
      .get("like-playlist")
      .find({ userId: data.userId })
      .update("userLikePlaylist", list => {
        const afterRemove = list.filter(item => item.id !== data.id);
        return afterRemove;
      })
      .write();
    event.sender.send("reply_unlike_playlist", { code: 200, message: "歌单取消收藏成功" });
  } catch (err) {
    console.log(err, "like_playlist error");
  }
});

// 删除歌单
ipcMain.on("delete_playlist", (event, data) => {
  const isLikelist = data.like;
  if (isLikelist) {
    //删除用户喜欢的歌单
    db.read()
      .get("like-playlist")
      .find({ userId: data.userId })
      .update("userLikePlaylist", list => {
        const afterRemove = list.filter(item => item.id !== data.id);
        return afterRemove;
      })
      .write();
    event.sender.send("reply_delete_playlist", { code: 200, type: "like" });
  } else {
    //删除用户创建的歌单
    try {
      db.read()
        .get("create-playlist")
        .find({ userId: data.userId })
        .update("userCreatePlaylist", list => {
          const afterRemove = list.filter(item => item.id !== data.id);
          return afterRemove;
        })
        .write();
      event.sender.send("reply_delete_playlist", { code: 200, type: "create" });
    } catch (err) {
      console.log(err, "delete_playlist error");
    }
  }
});
