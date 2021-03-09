import { getMusicUrl, getPlaylistDetail, getSongDetail, getmvDetail, getmvUrl } from "../../api";

export default {
  state: {
    list: [],
    song: {},
    music_urls: [],
    is_play: false,
    currentTime: 0,
    mvDetail: {},
    mvUrl: ""
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
    }
  },
  actions: {
    playMusic({ commit, state }, id) {
      commit("SET_PLAYER_DATA", { is_play: false, currentTime: 0 });
      getSongDetail(id).then(res => {
        commit("SET_PLAYER_DATA", { song: res.songs[0] });
      });
      getMusicUrl(id).then(res => {
        commit("SET_PLAYER_DATA", { music_urls: res.data, is_play: true });
      });
    },
    playPlaylist({ commit, state, dispatch }, id) {
      getPlaylistDetail(id).then(res => {
        commit("SET_PLAYER_LIST", res.playlist.tracks);
        dispatch("playMusic", res.playlist.tracks[0].id);
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
    }
  }
};
