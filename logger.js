/*
 * @Author: mingLiang
 * @Date: 2024-04-27 12:50:59
 * @LastEditTime: 2024-04-27 18:43:43
 * @FilePath: \巡检助手\logger.js
 */
init = false;
existsLog = [];
maxShowNum = 2;

function isBeyondMaxLength(existsLog) {
  return existsLog.length > maxShowNum ? true : false;
}

function existsLogToStr(existsLog) {
  var result = existsLog.join("\n");
  return result;
}

function formatDate(date) {
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  return hours + ":" + minutes + ":" + seconds;
}

function formatDateFull(date) {
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // getMonth() is zero-based
  var day = ("0" + date.getDate()).slice(-2);
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  return (
    year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds
  );
}

function log(text) {
  if (!init) {
    w = floaty.rawWindow(
      <horizontal
        id="move"
        background="#aa000000"
        paddingLeft="10"
        paddingRight="10"
        w={`${Math.floor((device.width * 8) / 10)}px`}
      >
        <button
          id="logger"
          textSize="13dp"
          textColor="white"
          style="Widget/AppCompat.Button.Borderless"
          text="日志输出："
          textStyle="bold"
          layout_gravity="right"
          layout_weight="5"
          layout_width="wrap_content"
          layout_height="wrap_content"
        />
      </horizontal>
    );
    ui.run(() => {
      var x = Math.floor(device.width / 10);
      //   var y = Math.floor(device.height / 10);
      w.setPosition(x, 0);
      w.setTouchable(false);
    });
    init = true;
  }
  if (isBeyondMaxLength(existsLog)) {
    existsLog.shift();
  }
  const dateThis = new Date();
  existsLog.push(`${formatDate(dateThis)}：${text}`);
  const print = existsLogToStr(existsLog);
  console.log(print);
  files.append(
    "/sdcard/qiqiLog.txt",
    `${formatDateFull(dateThis)}：${text}`,
    (encoding = "UTF-8")
  );
  ui.run(() => {
    w.logger.text(print);
  });
}

module.exports = {
  log,
};
