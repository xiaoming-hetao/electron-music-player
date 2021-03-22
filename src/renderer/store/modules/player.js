import { json } from "express";
import { getMusicUrl, getPlaylistDetail, getSongDetail, getmvDetail, getmvUrl, getSongComment } from "../../api";

export default {
  state: {
    list: [],
    song: {},
    music_urls: [],
    is_play: false,
    audioDom: {},
    currentTime: 0,
    mvDetail: {},
    mvUrl: "",
    lyric: "",
    // 歌曲评论相关
    comments: [],
    hotComments: [],
    songDetail: {}
  },
  mutations: {
    SET_PLAYER_LIST: (state, data) => {
      state.list = data;
    },
    SET_PLAYER_DATA: (state, data) => {
      Object.keys(data).forEach(function(key) {
        state[key] = data[key];
      });
    },
    // MV
    SET_MV_DATA: (state, data) => {
      state.mvDetail = data.mvDetail;
      state.mvUrl = data.mvUrl;
    },
    // 歌曲评论
    SET_SONG_COMMENT: (state, data) => {
      state.comments = data.comments;
      state.hotComments = data.hotComments;
      state.songDetail = data.songDetail;
    }
  },
  actions: {
    playMusic({ commit, state }, music) {
      commit("SET_PLAYER_DATA", { is_play: false, currentTime: 0 });
      commit("SET_PLAYER_DATA", { song: music });

      // 更新播放列表(要深克隆state中的list)
      let isExist = false;
      let data = JSON.parse(JSON.stringify(state.list));
      // 判断当前音乐是否已经存在于播放列表中
      data.map((item, index) => {
        if (item.id === music.id) {
          isExist = true;
        }
      });
      if (!isExist) {
        data.unshift(music);
        commit("SET_PLAYER_LIST", data);
      }

      //存入播放历史
      const historyData = JSON.parse(localStorage.getItem("userPlayHistory"));
      music["playtime"] = new Date().getTime();
      historyData.unshift(music);
      localStorage.setItem("userPlayHistory", JSON.stringify(historyData));

      getMusicUrl(music.id).then(res => {
        commit("SET_PLAYER_DATA", { music_urls: res.data, is_play: true });
      });
    },
    playPlaylist({ commit, state, dispatch }, id) {
      getPlaylistDetail(id).then(res => {
        console.log(res, "playlistdetail");
        dispatch("playMusic", res.playlist.tracks[0]);
        commit("SET_PLAYER_LIST", res.playlist.tracks);
      });
    },
    playMv({ commit, state, dispatch }, mvid) {
      getmvDetail(mvid).then(res => {
        const detail = res.data;
        console.log(res, "mvdetail");
        getmvUrl(detail.id).then(res => {
          const urlData = res.data;
          commit("SET_MV_DATA", { mvDetail: detail, mvUrl: urlData.url });
          console.log(urlData.url, "url");
        });
      });
    },
    getSongComment({ commit, state }, song) {
      getSongComment(song.id).then(res => {
        commit("SET_SONG_COMMENT", { comments: res.comments, hotComments: res.hotComments, songDetail: song });
      });
    }
  }
};
