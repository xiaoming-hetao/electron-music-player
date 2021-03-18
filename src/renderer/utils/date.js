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

// 格式化评论的时间展示
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
  const curHour = cur.getHours();
  const curMinute = cur.getMinutes();

  if (curYear === defaultYear) {
    //当前年则不需要显示年份

    if (curMonth === defaultMonth) {
      // 当前月
      if (curDay - defaultDay === 1) {
        //昨天
        return (
          "昨天" +
          " " +
          (defaultHours < 10 ? "0" + defaultHours : defaultHours) +
          ":" +
          (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
        );
      } else if (curDay - defaultDay === 0) {
        //今天
        if (curHour - defaultHours === 0 && curMinute - defaultMinutes < 1) {
          //同一一小时内
          return "刚刚";
        } else if (curHour - defaultHours === 0 && curMinute - defaultMinutes >= 1) {
          return curMinute - defaultMinutes + "分钟前";
        } else if (curHour - defaultHours === 1) {
          //不在同一个小时内
          const minute1 = curHour * 60 + curMinute;
          const minute2 = defaultHours * 60 + defaultMinutes;
          if (minute1 - minute2 < 60) {
            return Math.abs(minute1 - minute2) + "分钟前";
          } else {
            return (
              (defaultHours < 10 ? "0" + defaultHours : defaultHours) + ":" + (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
            );
          }
        } else {
          return (
            (defaultHours < 10 ? "0" + defaultHours : defaultHours) + ":" + (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
          );
        }
      } else {
        return (
          defaultMonth +
          "月" +
          defaultDay +
          "日" +
          " " +
          (defaultHours < 10 ? "0" + defaultHours : defaultHours) +
          ":" +
          (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
        );
      }
    } else {
      return (
        defaultMonth +
        "月" +
        defaultDay +
        "日" +
        " " +
        (defaultHours < 10 ? "0" + defaultHours : defaultHours) +
        ":" +
        (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
      );
    }
  } else {
    return (
      defaultYear +
      "年" +
      defaultMonth +
      "月" +
      defaultDay +
      "日" +
      " " +
      (defaultHours < 10 ? "0" + defaultHours : defaultHours) +
      ":" +
      (defaultMinutes < 10 ? "0" + defaultMinutes : defaultMinutes)
    );
  }
}
