import { getMusicUrl, getPlaylistDetail, getSongDetail, getmvDetail, getmvUrl } from "../../api";
import { search, getAlbumContent, getArtistSongs } from "../../api/search";

export default {
  state: {
    list: [],
    song: {},
    singer: "",
    albumName: "",
    songCount: 0,
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
      Object.keys(data).forEach(function (key) {
        state[key] = data[key];
      });
    },
    SET_HOT_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.songCount;
    },
    SET_ALBUM_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.songs.length;
      state.albumName = data.album.name;
    },
    SET_ARTIST_SEARCH_LIST: (state, data) => {
      state.list = data.songs;
      state.songCount = data.total;
      state.singer = data.songs[1].ar[0].name;
    },
    SER_SINGER_ALBUM: state => {
      state.singer = "";
      state.albumName = "";
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
    },
    // 搜索相关
    handleHotSearch({ commit, state, dispatch }, res) {
      search(res.keywords, res.limit, res.offset).then(res => {
        dispatch("showSearchlist", res.result);
      });
      commit("SER_SINGER_ALBUM");
    },
    handleAlbumSearch({ commit, state, dispatch }, res) {
      getAlbumContent(res.album.id).then(res => {
        commit("SET_ALBUM_SEARCH_LIST", res);
        console.log(res, "album");
      });
    },
    handleArtistSearch({ commit, state, dispatch }, res) {
      getArtistSongs(res.id, res.limit, res.offset).then(res => {
        commit("SET_ARTIST_SEARCH_LIST", res);
        console.log(res, "artist");
      });
    },
    showSearchlist({ commit, state, dispatch }, res) {
      commit("SET_HOT_SEARCH_LIST", res);
    }
  }
};
