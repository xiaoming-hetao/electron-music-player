import Datastore from "lowdb";
import LodashId from "lodash-id";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";

const fs = require("fs-extra");

import { remote, app } from "electron";

const APP = process.type === "renderer" ? remote.app : app;
const STORE_PATH = APP.getPath("userData");
console.log(STORE_PATH);

if (process.type !== "renderer") {
  if (!fs.pathExistsSync(STORE_PATH)) {
    fs.mkdirpSync(STORE_PATH);
  }
}

const adapter = new FileSync(path.join(STORE_PATH, "/database.json"));

// 初始化lodash-id，让每条记录都有一个唯一id
const db = Datastore(adapter);
db._.mixin(LodashId);

/* 初始化数据表*/

// 用户表
if (!db.has("local-music").value()) {
  db.set("local-music", {}).write();
}

// 用户表
if (!db.has("user").value()) {
  db.set("user", []).write();
}

//  用户喜欢的歌曲
if (!db.has("user-like").value()) {
  db.set("user-like", []).write();
}

//  用户创建的歌单
if (!db.has("create-playlist").value()) {
  db.set("create-playlist", []).write();
}

//  用户收藏的歌单
if (!db.has("like-playlist").value()) {
  db.set("like-playlist", []).write();
}

export default db;
