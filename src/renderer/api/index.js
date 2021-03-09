import http from "../utils/http";

export function banner() {
  return http.get("/banner");
}

export function personalized() {
  return http.get("/personalized");
}

// 获取歌单详情
export function getPlaylistDetail(id) {
  return http.get(`/playlist/detail?id=${id}`);
}

// 获取mv数据
export function getmvDetail(mvid) {
  return http.get(`/mv/detail?mvid=${mvid}`);
}

//获取歌词
export function getSongLyric(id) {
  return http.get(`/lyric?id=${id}`);
}

export function getmvUrl(mvid) {
  return http.get(`/mv/url?id=${mvid}`);
}

export function getPlaylistHot() {
  return http.get("/playlist/hot");
}

export function getTopPlaylistHighquality(cat = "全部", limit = 30) {
  return http.get("/top/playlist/highquality?cat=" + cat + "&limit=" + limit);
}

export function like(id) {
  return http.get("/like?id=" + id);
}

export function toplist(idx) {
  return http.get("/top/list?idx=" + idx);
}

export function singerlist(cat, offset) {
  if (cat == 0) {
    return http.get("/top/artists?offset=0");
  }
  return http.get("/artist/list?cat=" + cat + "&offset=" + offset);
}

// 获取歌曲详情
export function getSongDetail(ids) {
  return http.get("/song/detail?ids=" + ids);
}

export function getMusicUrl(id) {
  return http.get(`/song/url?id=${id}`);
}

export function djlist(catid) {
  if (catid == 0) {
    return http.get("/dj/recommend");
  } else {
    return http.get("/dj/recommend/type?type=" + catid);
  }
}
export function djcat() {
  return http.get("/dj/catelist");
}
