"ui";
ui.statusBarColor("#3498db");
ui.layout(
  <vertical weightSum="5">
    <text
      layout_weight="4"
      id="welcomeText"
      text="欢迎使用 AI 语音助手"
      textSize="20sp"
      gravity="top|center"
      color="#3498db"
      marginTop="30"
    />
    <vertical gravity="center" layout_weight="1">
      <button

        id="recordBtn"
        text="按住 说话"
        bg="#3498db"
        w="200"
        h="60"
        textSize="16sp"
        textColor="#ffffff"
      />
      <button
        id="result"
        text="AI识别"
        bg="#3498db"
        w="200"
        h="60"
        textSize="16sp"
        marginTop="20"
        textColor="#ffffff"
      />
      <button
        id="demo"
        text="demo脚本"
        bg="#3498db"
        w="200"
        h="60"
        textSize="16sp"
        marginTop="20"
        textColor="#ffffff"
      />
    </vertical>
  </vertical>
);
const axios = require("axios");
const { message, recorder, checkPermission, xFSign, httpInputStream, getXfJsonResult } = require("./utils.js");
const { questionScript } = require("./script.js");


const axiosPost = () => {
  const filePath = "/sdcard/voice.wav";
  const file = new File(filePath);
  if (!files.exists(filePath)) {
    message("语音文件不存在");
    return;
  }
  const fileLength = file.length();
  message("AI大模型识别中...");
  const signData = xFSign();
  const params = {
    signa: signData.signa,
    appId: signData.appId,
    ts: signData.ts,
    duration: 200,
    fileName: file.getName(),
    fileSize: fileLength,
  };
  const url = `http://raasr.xfyun.cn/v2/api/upload?duration=${params.duration}&fileName=${params.fileName}&fileSize=${params.fileSize}&signa=${params.signa}&appId=${params.appId}&ts=${params.ts}`;
  console.log(url);
  const result = httpInputStream(url, filePath, fileLength);
  // console.log(result);
  if (result.descInfo !== "success") {
    message("大模型识别失败：" + result.descInfo);
    return;
  }
  const orderId = result.content.orderId;
  message('创建任务成功OrderID:' + orderId)
  const resultUrl = `http://raasr.xfyun.cn/v2/api/getResult?signa=${params.signa}&appId=${params.appId}&ts=${params.ts}&orderId=${orderId}&resultType=transfer`;
  console.log(resultUrl);
  message("等待AI识别结果中...", true);
  const begin = new Date().getTime() / 1000;
  const waitResult = () => {
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        if (new Date().getTime() / 1000 - begin > 60) {
          message('识别超时(60s限制)')
          reject('识别超时')
          return
        }
        axios.post(resultUrl, {}).then((res) => {
          const result = res.data;
          console.log('识别status:' + result.content.orderInfo.status)
          message("等待AI识别结果中...(状态：" + result.content.orderInfo.status + ')', true);
          if (result.content.orderInfo.status === 4) {
            console.log('识别完成')
            resolve(JSON.parse(result.content.orderResult));
          } else {
            console.log('识别还未完成')
            setTimeout(checkResult, 5000);
          }
        }).catch((error) => {
          reject(error);
        });
      };
      checkResult();
    });
  };
  waitResult().then((res) => {
    const result = getXfJsonResult(res);
    console.log('识别成功，识别结果:' + result);
    message('识别成功，识别结果:' + result, false, 5000);
  })
};

const recordHandle = () => {
  try {
    const recordBtn = ui.recordBtn;
    let rec;
    const isPermission = checkPermission();
    if (!isPermission) {
      recordBtn.click(() => {
        message("没有开启录音权限");
      });
      return;
    }
    recordBtn.setOnTouchListener({
      onTouch: function (view, event) {
        switch (event.getAction()) {
          case android.view.MotionEvent.ACTION_DOWN:
            rec = recorder();
            message("正在说话中", true);
            rec.start();
            break;
          case android.view.MotionEvent.ACTION_UP:
            message("说话完毕，正在识别中...");
            rec.stop();
            rec.release();
            setTimeout(() => {
              axiosPost();
              floaty.closeAll();
            }, 500);
            break;
        }
        return true;
      },
    });
  } catch (error) {
    console.log(error);
  }
};

threads.start(recordHandle);


ui.result.click(() => {
  threads.start(axiosPost);
});


ui.demo.click(() => {
  threads.start(questionScript);
});