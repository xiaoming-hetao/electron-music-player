import { search, getAlbumContent, getArtistSongs, getArtistAlbum, getArtistMV, getArtistDesc } from "../../api/search";

export default {
  state: {
    list: [],
    song: {},
    songCount: 0,
    album: {},
    artistInfo: {},
    hotAlbumsList: [],
    mvs: [],
    desc: {}
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
      state.artistInfo = data.singerDesc;
    },
    SET_ARTIST_MV: (state, data) => {
      state.mvs = data.mvs;
    },
    SET_ARTIST_DESC: (state, data) => {
      state.desc = data;
    }
  },
  actions: {
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

        let album = res.hotAlbums;
        let handleAlbum = [];

        // 遍历每一个专辑，获取每个专辑包含的歌曲
        for (let item of album) {
          getAlbumContent(item.id).then(res => {
            item["songlist"] = res.songs;
            handleAlbum.push(item);
          });
        }
        let data = {
          singerDesc: res.artist,
          hotAlbums: handleAlbum
        };
        console.log(data, "handleAlbum");
        commit("SET_ARTIST_ALBUM", data);
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
