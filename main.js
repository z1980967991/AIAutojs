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
        id="getResult"
        text="AI识别结果"
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
const { message, recorder, checkPermission, xFSign } = require("./utils.js");
const RequestBody = Packages.okhttp3.RequestBody;
const MediaType = Packages.okhttp3.MediaType;
const Request = Packages.okhttp3.Request;
const axios = require("axios");

const axiosPost = () => {
  const filePath = "/sdcard/voice.wav";
  const file = new File(filePath);

  if (!files.exists(filePath)) {
    message("语音文件不存在");
    return;
  }
  const fileInputStream = new java.io.FileInputStream(filePath);
  // 读取文件内容示例
  // let content = "";
  // let data;
  // while ((data = fileInputStream.read()) !== -1) {
  //   content += String.fromCharCode(data);
  // }
  // fileInputStream.close();
  // const fileData = content.toString();
  message("AI大模型识别中...");
  const signData = xFSign();
  const params = {
    signa: signData.signa,
    appId: signData.appId,
    ts: signData.ts,
    duration: 200,
    fileName: file.getName(),
    fileSize: file.length(),
  };

  const url = `http://raasr.xfyun.cn/v2/api/upload?duration=${params.duration}&fileName=${params.fileName}&fileSize=${params.fileSize}&signa=${params.signa}&appId=${params.appId}&ts=${params.ts}`;
  console.log(url);

  const fileLength = file.length();
  const buffer = java.lang.reflect.Array.newInstance(
    java.lang.Byte.TYPE,
    fileLength
  );
  fileInputStream.read(buffer);
  const requestBody = RequestBody.create(
    MediaType.parse("application/octet-stream"),
    buffer
  );
  const client = new OkHttpClient();
  const request = new Request.Builder().url(url).post(requestBody).build();
  // // 发起请求
  const response = client.newCall(request).execute();
  const responseData = response.body().string();
  console.log(responseData);
  //  { code: '000000',
  //   descInfo: 'success',
  //   content:
  //    { orderInfo:
  //       { orderId: 'DKHJQ202404212353583702WSWQeqPYDnHilaU',
  //         failType: 0,
  //         status: 3,
  //         originalDuration: 200 },
  //      orderResult: '',
  //      taskEstimateTime: 2369401 } }
};

// 获取讯飞识别结果
const getResult = () => {
  const path = "/sdcard/voice.wav";
  const fileThis = new File(path);
  if (!fileThis.exists()) {
    message("语音文件不存在");
    return;
  }

  // message("AI大模型识别中...");
  const signData = xFSign();

  const params = {
    signa: signData.signa,
    appId: signData.appId,
    ts: signData.ts,
    duration: 200,
    fileName: fileThis.name,
    fileSize: fileThis.length(),
  };
  // const url = `https://raasr.xfyun.cn/v2/api/upload?duration=${params.duration}&fileName=${params.fileName}&fileSize=${params.fileSize}&signa=${params.signa}&appId=${params.appId}&ts=${params.ts}`;
  // console.log(url);
  // const bytes = files.readBytes(path);
  // const byteBuffer = java.nio.ByteBuffer.wrap(bytes);
  // const res = http.request(url, {
  //   method: "POST",
  //   body: byteBuffer.array(),
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Accept-Encoding": "gzip, deflate, br",
  //     Accept: "*/*",
  //     Connection: "keep-alive",
  //     "Content-Length": fileThis.length(),
  //   },
  // });

  // const result = res.body.json();
  // console.log(result);
  // if (result.descInfo !== "success") {
  //   message("大模型识别失败：" + result.descInfo);
  //   return;
  // }
  const orderId = "DKHJQ202404212353583702WSWQeqPYDnHilaU";

  //  https://raasr.xfyun.cn/v2/api/getResult?signa=Wv23VLOg%2F6sQ1BDx4DKnnxtgiwQ%3D&orderId=DKHJQ2022090217220902175209AAEBD000015&appId=3e79d91c&resultType=predict&ts=1662112340

  const resultUrl = `http://raasr.xfyun.cn/v2/api/getResult?signa=${params.signa}&appId=${params.appId}&ts=${params.ts}&orderId=${orderId}`;
  console.log(resultUrl);
  const resultHeaders = { "Content-Type": "application/json" };
  let status = 3;
  message("等待AI识别结果");
  while (status === 3) {
    // try {
    const resultRes = http.post(resultUrl, {}, { headers: resultHeaders });
    const resultData = resultRes.body.json();
    console.log(resultData);
    status = resultData.content.orderInfo.status;
    console.log("status", status);
    if (status === 4) {
      break;
    }
    sleep(5000);
    // } catch (error) {
    //   console.log(error);
    // }
  }
};

ui.result.click(() => {
  threads.start(axiosPost);
});
ui.getResult.click(() => {
  threads.start(getResult);
});
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
              floaty.closeAll();
            }, 1000);
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
