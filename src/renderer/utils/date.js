// 格式化时间
export function getFormatDate(nowTimeStamp) {
  let defaultYear = nowTimeStamp.getFullYear();
  let defaultMonth = nowTimeStamp.getMonth() + 1;
  let defaultDay = nowTimeStamp.getDate();

  if (defaultMonth < 10) {
    defaultMonth = "0" + defaultMonth;
  }
  if (defaultDay < 10) {
    defaultDay = "0" + defaultDay;
  }

  return defaultYear + "-" + defaultMonth + "-" + defaultDay;
}

export function getCommentDate(nowTimeStamp) {
  let defaultYear = nowTimeStamp.getFullYear();
  let defaultMonth = nowTimeStamp.getMonth() + 1;
  let defaultDay = nowTimeStamp.getDate();
  let defaultHours = nowTimeStamp.getHours();
  let defaultMinutes = nowTimeStamp.getMinutes();

  // 此时此刻
  const cur = new Date();
  const curYear = cur.getFullYear();
  const curMonth = cur.getMonth() + 1;
  const curDay = cur.getDate();

  if (defaultHours < 10) {
    defaultHours = "0" + defaultHours;
  }
  if (defaultMinutes < 10) {
    defaultMinutes = "0" + defaultMinutes;
  }

  if (curYear === defaultYear) {
    //当前年则不需要显示年份

    if (curMonth === defaultMonth) {
      // 当前月
      if (curDay - defaultDay === 1) {
        //昨天
        return "昨天" + " " + defaultHours + ":" + defaultMinutes;
      } else if (curDay - defaultDay === 0) {
        //今天
        return defaultHours + ":" + defaultMinutes;
      } else {
        return defaultMonth + "月" + defaultDay + "日" + " " + defaultHours + ":" + defaultMinutes;
      }
    } else {
      return defaultMonth + "月" + defaultDay + "日" + " " + defaultHours + ":" + defaultMinutes;
    }
  } else {
    return defaultYear + "年" + defaultMonth + "月" + defaultDay + "日" + " " + defaultHours + ":" + defaultMinutes;
  }
}
