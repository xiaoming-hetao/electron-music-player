import locs from "../../utils/locs";
import { getUserLikelist, getUserPlayList } from "../../api/user";
import { getSongDetail } from "../../api/index";
const { ipcRenderer } = require("electron");
export default {
  state: {
    is_login: locs.get("profile") ? true : false,
    profile: locs.get("profile"),
    likelist: [],
    userPlaylist: []
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
    SET_PLAYLIST_DATA: (state, data) => {
      state.userPlaylist = data;
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
      // 登录之后获取用户喜欢歌曲列表，用户创建的歌单，用户收藏的歌单等
      dispatch("SET_LIKELIST", res.profile.userId);
      dispatch("SET_PLAYLIST", res.profile.userId);
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
        // 去掉歌单我喜欢（处于返回的数据中的第一条）
        const handleData = res.playlist.splice(1);
        commit("SET_PLAYLIST_DATA", handleData);
        console.log(res, "userplaylist");
      });
    }
  }
};
