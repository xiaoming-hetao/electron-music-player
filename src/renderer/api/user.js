import http from "../utils/http";

//手机登录
export function login(phone, password) {
  return http.get(`/login/cellphone?phone=${phone}&password=${password}`);
}

export function logout() {
  return http.get(`/logout`);
}

// 登录后

// 获取歌单
export function getUserPlayList(uid) {
  return http.get(`/user/playlist?uid=${uid}`);
}

// 获取用户播放记录
export function getUserPlayHistory(uid) {
  return http.get(`/user/record?uid=${uid}&type=0`);
}

// 获取用户喜欢列表
export function getUserLikelist(uid) {
  return http.get(`/likelist?uid=${uid}`);
}

// 获取用户歌单
export function getUserPlaylist(uid) {
  return http.get(`/user/playlist?uid=${uid}`);
}

// 收藏，取消歌单t : 类型,1:收藏,2:取消收藏
export function likePlaylist(id) {
  return http.get(`/playlist/subscribe?t=1&id=${id}`);
}
export function dislikePlaylist(id) {
  return http.get(`/playlist/subscribe?t=&id=${id}`);
}

// 创建、删除歌单
export function createPlaylist(name) {
  return http.get(`/playlist/create?name=${name}`);
}
export function delPlaylist(id) {
  return http.get(`/playlist/delete?id=${id}`);
}

// 往歌单中添加、删除歌曲
export function addToPlaylist(pid, songId) {
  return http.get(`/playlist/tracks?op=add&pid=${pid}&tracks=${songId}`);
}
export function delFromPlaylist(pid, songId) {
  return http.get(`/playlist/tracks?op=del&pid=${pid}&tracks=${songId}`);
}

// 给歌曲评论
export function sendComment(id, content) {
  return http.get(`/comment?t=1&type=0&id=${id}&content=${content}`);
}

/* 注册 */

// 发送验证码
export function sendCaptcha(phone) {
  return http.get(`/captcha/sent?phone=${phone}`);
}

// 验证验证码
export function verifyCaptcha(phone, captcha) {
  return http.get(`/captcha/verify?phone=${phone}&captcha=${captcha}`);
}

// 检测手机号是否注册
export function checkPhone(phone) {
  return http.get(`/cellphone/existence/check?phone=${phone}`);
}

// 注册操作
export function register(phone, password, captcha, nickname) {
  return http.get(`/register/cellphone?phone=${phone}&password=${password}&captcha=${captcha}&nickname=${nickname}`);
}

// 初始化昵称
export function initNickname(nickname) {
  return http.get(`/activate/init/profile?nickname=${nickname}`);
}
