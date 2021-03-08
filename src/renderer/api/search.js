import http from "../utils/http";

// 搜索单曲
export function search(keywords, limit = 100, offset = 0) {
  return http.get(`/cloudsearch?keywords=${keywords}&limit=${limit}&offset=${offset}`);
}

// 热搜列表
export function searchHot() {
  return http.get(`/search/hot/detail`);
}

// 搜索建议
export function searchSuggest(keywords) {
  return http.get(`/search/suggest?keywords=${keywords}`);
}

// 获取专辑内容
export function getAlbumContent(id) {
  return http.get(`/album?id=${id}`);
}

// 获取歌手全部歌曲
export function getArtistSongs(id, limit = 100, offset = 0) {
  return http.get(`/artist/songs?id=${id}&limit=${limit}&offset=${offset}&order=hot`);
}
