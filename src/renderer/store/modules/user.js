import locs from "../../utils/locs";
import { getUserLikelist, getUserPlayList } from "../../api/user";
import { getSongDetail } from "../../api/index";
const { ipcRenderer } = require("electron");
import db from "../../../lowdb/datastore";
export default {
  state: {
    is_login: locs.get("profile") ? true : false,
    profile: locs.get("profile"),
    likelist: [],
    userCreatePlaylist: [],
    userLikePlaylist: []
  },
  mutations: {
    SET_USER_DATA: (state, data) => {
      Object.keys(data).forEach(function(key) {
        state[key] = data[key];
      });
    },
    REMOVE_USER_DATA: (state, data) => {
      Object.keys(data).forEach(function(key) {
        state[key] = data[key];
      });
    },
    SET_LIKELIST_DATA: (state, data) => {
      state.likelist = data.songs;
    },
    SET_CREATE_PLAYLIST_DATA: (state, data) => {
      state.userCreatePlaylist = data.userCreatePlaylist;
    },
    SET_LIKE_PLAYLIST_DATA: (state, data) => {
      state.userLikePlaylist = data.userLikePlaylist;
    }
  },
  actions: {
    SET_LOGIN({ commit, state, dispatch }, res) {
      let data = {
        is_login: true,
        profile: res.profile
      };
      locs.set("profile", res.profile);
      commit("SET_USER_DATA", data);

      // 登录后，判断用户是否第一次登录，如果是第一次登录，那么本地的用户数据表为空
      // 可通知主进程保存从网易云api获取的用户数据，如果不是第一次登录，那么直接读取本地的用户数据
      const uid = res.profile.userId;
      const user = db
        .get("user")
        .find({ userId: uid })
        .value();
      if (user == null) {
        // 登录之后获取用户喜欢歌曲列表，用户创建的歌单，用户收藏的歌单等
        dispatch("SET_LIKELIST", uid);
        dispatch("SET_PLAYLIST", uid);
      } else {
        console.log("用户不是第一次登录");
      }
    },
    SET_LOGOUT({ commit, state }) {
      let data = {
        is_login: false,
        profile: {},
        likelist: []
      };
      locs.remove("profile");

      commit("REMOVE_USER_DATA", data);
    },
    SET_LIKELIST({ commit, state }, uid) {
      getUserLikelist(uid).then(res => {
        const songIds = res.ids;
        let id = "";
        // 把所有歌曲的id拼接起来，作为参数
        for (let item of songIds) {
          id += item + ",";
        }
        id = id.substr(0, id.length - 1);
        getSongDetail(id).then(res => {
          commit("SET_LIKELIST_DATA", res);
          // 把我喜欢的音乐的id存储到本地
          let likelistIds = [];
          for (let item of res.songs) {
            likelistIds.push(item.id);
          }
          localStorage.setItem("likelistIds", JSON.stringify(likelistIds));

          // 向主进程发送消息，请求把likelist存储到数据库中
          let data = {
            userId: uid,
            likelist: res.songs
          };
          ipcRenderer.send("set_likelist", data);
          console.log(res, "songdetail");
        });
      });
    },
    SET_PLAYLIST({ commit, state, dispatch }, uid) {
      getUserPlayList(uid).then(res => {
        console.log(res, "userplaylist");
        // 去掉歌单我喜欢（处于返回的数据中的第一条）
        const handleData = res.playlist.splice(1);
        // 区分用户创建的歌单和用户收藏的歌单
        let userCreatePlaylist = [];
        let userLikePlaylist = [];
        for (let item of handleData) {
          if (item.userId === uid) {
            userCreatePlaylist.push(item);
          } else {
            userLikePlaylist.push(item);
          }
        }

        let createPlaylistData = {
          userId: uid,
          userCreatePlaylist
        };
        let likePlaylistData = {
          userId: uid,
          userLikePlaylist
        };
        ipcRenderer.send("set_create_playlist", createPlaylistData);
        ipcRenderer.send("set_like_playlist", likePlaylistData);
        commit("SET_CREATE_PLAYLIST_DATA", { userCreatePlaylist });
        commit("SET_LIKE_PLAYLIST_DATA", { userLikePlaylist });
      });
    }
  }
};
