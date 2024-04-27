/*
 * @Author: mingLiang
 * @Date: 2024-04-27 10:22:54
 * @LastEditTime: 2024-04-27 14:07:57
 * @FilePath: \巡检助手\messager.js
 */
initMessage = false;
messageTimer = null;

function hideMessage() {
  ui.run(() => {
    messageWindow.setPosition(999999, 999999);
  });
}

function showMessage() {
  ui.run(() => {
    var x = Math.floor(device.width / 4);
    var y = Math.floor((device.height * 2) / 5);
    messageWindow.setPosition(x, y);
  });
}

function message(text, isNotClose, time) {
  if (!initMessage) {
    messageWindow = floaty.rawWindow(
      <vertical
        gravity="center"
        padding="6"
        bg="#AA000000"
        w={`${Math.floor(device.width / 2)}px`}
        h="auto"
      >
        <text
          id="text"
          textSize="20sp"
          textColor="#FFFFFF"
          gravity="center"
          text=""
          singleLine="false"
        />
      </vertical>
    );
    // messageWindow.setSize(400, 100);
    initMessage = true;
    showMessage();
  } else {
    showMessage();
  }
  if (messageTimer) clearTimeout(messageTimer);
  ui.run(function () {
    messageWindow.text.setText(text);
  });
  console.log("message:", text);
  if (!isNotClose) {
    messageTimer = setTimeout(() => {
      hideMessage();
    }, time || 1500);
  }
}

module.exports = {
  message,
};
