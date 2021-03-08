import { app, BrowserWindow, ipcMain } from "electron";
import db from "../lowdb/datastore";
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\");
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
  app.all("*", function (req, res, next) {
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

  app.use(function (req, res, next) {
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

  mainWindow.on("closed", () => {
    mainWindow = null;
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

ipcMain.on("close", e => {
  mainWindow.close();
});
ipcMain.on("minimize", e => {
  mainWindow.minimize();
});

// 数据库操作
ipcMain.on("set_user", (event, data) => {
  const value = db.get("user").value();
  console.log(value, "database");
  if (!value.length) {
    //第一次添加数据
    db.get("user")
      .insert({
        nickname: data.profile.nickname,
        userId: data.profile.userId
      })
      .write();
    console.log("success");
  } else {
    // 查看用户是否存在，存在则不进行存储
    const id = db.get("user").find({ userId: data.profile.userId }).value().userId;
    console.log(id);
    if (!id) {
      db.get("user")
        .insert({
          nickname: data.profile.nickname,
          userId: data.profile.userId
        })
        .write();
    }
  }
});

ipcMain.on("set_likelist", (event, data) => {
  const value = db.get("user-like").value();
  if (!value.length) {
    db.get("user-like").insert(data).write();

    console.log(value, "user-like");
  }
});
ipcMain.on("get_likelist", (event, data) => {
  const value = db.get("user-like").value();
  if (value.length) {
    event.reply("reply_likelist", value);
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
