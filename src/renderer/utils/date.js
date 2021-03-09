// 格式化时间
function getFormatDate(nowTimeStamp) {
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

export default getFormatDate;
