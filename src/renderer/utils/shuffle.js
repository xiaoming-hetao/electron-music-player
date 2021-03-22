export function shuffle(arr) {
  var length = arr.length,
    j = length;
  for (var i = 0; i < length; i++) {
    var random = Math.floor(Math.random() * j--); // 生成起始位置到基准位置之间的随机位置，并将基准从结束位置不停左移。

    [arr[i], arr[random]] = [arr[random], arr[i]]; // 本质为交换元素位置。
  }
  return arr;
}
