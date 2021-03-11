import { search, getAlbumContent, getArtistSongs, getArtistAlbum, getArtistMV, getArtistDesc } from "../../api/search";
import { newMV, recommendMV } from "../../api";
export default {
  state: {
    list: [],
    song: {},
    songCount: 0,
    album: {},
    artistInfo: {},
    hotAlbumsList: [],
    mvs: [],
    desc: {},
    newMVList: [],
    recommendMVList: []
  },
  mutations: {
    SET_HOT_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.songCount;
    },
    SET_ALBUM_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.songs.length;
      state.album = data.album;
    },
    SET_ARTIST_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.total;
    },
    SET_ARTIST_ALBUM: (state, data) => {
      state.hotAlbumsList = data.hotAlbums;
      state.artistInfo = data.artist;
    },
    SET_ARTIST_MV: (state, data) => {
      state.mvs = data.mvs;
    },
    SET_ARTIST_DESC: (state, data) => {
      state.desc = data;
    },
    SET_NEW_MV_LIST: (state, data) => {
      state.newMVList = data;
    },
    SET_RECOMEND_MV_LIST: (state, data) => {
      state.recommendMVList = data.result;
    }
  },
  actions: {
    // 展示mv
    showMVList({ commit, state }, res) {
      newMV().then(res => {
        commit("SET_NEW_MV_LIST", res.data);
        console.log(res, "newmv");
      });
      recommendMV().then(res => {
        commit("SET_RECOMEND_MV_LIST", res);
        console.log(res, "recommendMV");
      });
    },
    // 搜索相关
    handleHotSearch({ commit, state, dispatch }, res) {
      search(res.keywords, res.limit, res.offset).then(res => {
        dispatch("showSearchlist", res.result);
      });
    },
    handleAlbumSearch({ commit, state, dispatch }, res) {
      getAlbumContent(res.album.id).then(res => {
        commit("SET_ALBUM_SEARCH_LIST", res);
        console.log(res, "album");
      });
    },
    handleArtistSearch({ commit, state, dispatch }, res) {
      getArtistAlbum(res.id, res.limit, res.offset).then(res => {
        console.log(res, "artistAlbum");
        commit("SET_ARTIST_ALBUM", res);
      });
      getArtistMV(res.id).then(res => {
        commit("SET_ARTIST_MV", res);
        console.log(res, "artistMV");
      });
      getArtistDesc(res.id).then(res => {
        commit("SET_ARTIST_DESC", res);
        console.log(res, "artistDesc");
      });
      getArtistSongs(res.id, res.limit, res.offset).then(res => {
        commit("SET_ARTIST_SEARCH_LIST", res);
        console.log(res, "artistsongs");
      });
    },
    showSearchlist({ commit, state, dispatch }, res) {
      commit("SET_HOT_SEARCH_LIST", res);
    }
  }
};
