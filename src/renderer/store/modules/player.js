import { getMusicUrl, getPlaylistDetail, getSongDetail, getmvDetail, getmvUrl, getSongComment } from "../../api";
function updateInfo(state, commit, music) {
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
  let playSong = JSON.parse(JSON.stringify(music));
  const historyData = JSON.parse(localStorage.getItem("userPlayHistory"));
  playSong["playtime"] = new Date().getTime();
  historyData.unshift(playSong);
  localStorage.setItem("userPlayHistory", JSON.stringify(historyData));
}
export default {
  state: {
    list: [],
    song: {},
    music_urls: [],
    localMusic: {},
    is_play: false,
    is_playLocal: false,
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
    playLocalMusic({ commit, state }, musicData) {
      commit("SET_PLAYER_DATA", { is_play: false, currentTime: 0 });
      commit("SET_PLAYER_DATA", { song: musicData.music, is_playLocal: musicData.is_playLocal });
      // 解析本地音乐的url为数据流
      const fs = require("fs");
      const buf = fs.readFileSync(musicData.music.url); //读取文件，并将缓存区进行转换
      const uint8Buffer = Uint8Array.from(buf);
      const bolb = new Blob([uint8Buffer]); //转为一个新的Blob文件流
      // window.URL.createObjectURL方法可以解析本息磁盘文件的路径，让浏览器可以识别并使用对应的资源
      const streamUrl = window.URL.createObjectURL(bolb); //转换为url地址并直接给到audio
      setTimeout(() => {
        commit("SET_PLAYER_DATA", { music_urls: [{ url: streamUrl }], is_play: true });
      }, 1000);
    },
    playMusic({ commit, state }, musicData) {
      commit("SET_PLAYER_DATA", { is_play: false, currentTime: 0 });
      commit("SET_PLAYER_DATA", { song: musicData.music, is_playLocal: musicData.is_playLocal });

      updateInfo(state, commit, musicData.music);

      getMusicUrl(musicData.music.id).then(res => {
        commit("SET_PLAYER_DATA", { music_urls: res.data, is_play: true });
      });
    },
    playPlaylist({ commit, state, dispatch }, id) {
      getPlaylistDetail(id).then(res => {
        console.log(res, "playlistdetail");
        dispatch("playMusic", { music: res.playlist.tracks[0], is_playLocal: false });

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
