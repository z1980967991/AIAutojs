"ui";
ui.statusBarColor("#3498db");
const qiqi = storages.create("巡检助手");
if (qiqi.get("userName") == undefined) {
  qiqi.put("userName", "");
}
if (qiqi.get("password") == undefined) {
  qiqi.put("password", "");
}
const setting = () => {
  ui.layout(
    <vertical w="*" h="*">
      <appbar fitsSystemWindows="true">
        <toolbar
          bg="#3498DB"
          id="toolbar"
          title="配置页面"
          paddingTop="0dp"
          h="auto"
        >
          <button
            id="tohome"
            layout_gravity="right"
            textColor="#ffffff"
            text="保存并返回首页"
            style="Widget.AppCompat.Button.Borderless.Colored"
            w="auto"
          />
        </toolbar>
      </appbar>
      <vertical h="*" padding="12">
        <horizontal h="auto" w="*">
          <text
            text="账号密码配置："
            textColor="black"
            textSize="15sp"
            marginTop="1"
            w="auto"
          />
        </horizontal>
        <horizontal h="auto" w="*">
          <text
            text="账号："
            textColor="black"
            textSize="15sp"
            marginTop="1"
            w="auto"
          />
          <input
            id="userName"
            layout_weight="1"
            text="10"
            gravity="left"
            textSize="15sp"
            width="100px"
          />
        </horizontal>
        <horizontal h="auto" w="*">
          <text
            text="密码："
            textColor="black"
            textSize="15sp"
            marginTop="1"
            w="auto"
          />
          <input
            id="password"
            text="10"
            layout_weight="1"
            gravity="left"
            textSize="15sp"
            width="100px"
          />
        </horizontal>
      </vertical>
    </vertical>
  );
  ui.run(() => {
    //读取配置
    ui.userName.setText(qiqi.get("userName"));
    ui.password.setText(qiqi.get("password"));
  });

  const goHome = () => {
    qiqi.put("userName", ui.userName.text());
    qiqi.put("password", ui.password.text());
  };

  ui.tohome.click(() => {
    threads.start(goHome);
    homePage();
  });
};

const homePage = () => {
  ui.layout(
    <vertical w="*" h="*">
      <appbar fitsSystemWindows="true">
        <toolbar
          bg="#3498DB"
          id="toolbar"
          title="AI巡检语音助手"
          paddingTop="0dp"
          h="auto"
        >
          <button
            id="setting"
            layout_gravity="right"
            textColor="#ffffff"
            text="设置配置项"
            style="Widget.AppCompat.Button.Borderless.Colored"
            w="auto"
          />
        </toolbar>
      </appbar>
      <vertical h="*" weightSum="5">
        <text
          layout_weight="4"
          id="welcomeText"
          text="欢迎使用 AI 巡检语音助手"
          textSize="20sp"
          gravity="top|center"
          color="#3498db"
          marginTop="20"
        />
        <vertical gravity="center" layout_weight="1">
          <button
            id="recordBtn"
            text="按住 说话"
            bg="#3498db"
            w="180"
            h="50"
            textSize="16sp"
            textColor="#ffffff"
          />
          <button
            id="result"
            text="AI识别"
            bg="#3498db"
            w="180"
            h="50"
            textSize="16sp"
            marginTop="10"
            textColor="#ffffff"
          />
          <button
            id="demo"
            text="demo脚本"
            bg="#3498db"
            w="180"
            h="50"
            textSize="16sp"
            marginTop="10"
            textColor="#ffffff"
          />
        </vertical>
      </vertical>
    </vertical>
  );

  const axios = require("axios");
  const {
    recorder,
    checkPermission,
    xFSign,
    httpInputStream,
    getXfJsonResult,
  } = require("./utils.js");
  const { questionScript } = require("./script.js");
  const { message } = require("./messager.js");

  const axiosPost = () => {
    message("AI大模型识别中...");
    let signData = xFSign();
    const postFile = () => {
      const filePath = "/sdcard/voice.wav";
      const file = new File(filePath);
      if (!files.exists(filePath)) {
        message("语音文件不存在", true);
        return;
      }
      const fileLength = file.length();
      const params = {
        signa: signData.signa,
        appId: signData.appId,
        ts: signData.ts,
        duration: 200,
        fileName: file.getName(),
        fileSize: fileLength,
      };
      const url = `http://raasr.xfyun.cn/v2/api/upload?duration=${params.duration}&fileName=${params.fileName}&fileSize=${params.fileSize}&signa=${params.signa}&appId=${params.appId}&ts=${params.ts}`;
      // console.log(url);
      const result = httpInputStream(url, filePath, fileLength);
      return result;
    };
    let result = postFile();
    // console.log(result);
    while (result.code === "26601") {
      console.log("signa失败，重试");
      sleep(1000);
      signData = xFSign();
      result = postFile();
    }
    if (result.descInfo === undefined) {
      console.log("录音资源没释放，等待中...");
      setTimeout(axiosPost, 1000);
      return;
    }
    if (result.descInfo !== "success") {
      message("大模型识别失败：" + result.descInfo, true);
    } else {
      const orderId = result.content.orderId;
      message("创建任务成功OrderID:" + orderId);
      const resultUrl = `http://raasr.xfyun.cn/v2/api/getResult?signa=${signData.signa}&appId=${signData.appId}&ts=${signData.ts}&orderId=${orderId}&resultType=transfer`;
      console.log(resultUrl);
      message("等待AI识别结果中...", true);

      const getResult = () => {
        const result = http.postJson(resultUrl, {});
        const content = JSON.stringify(result.body.json());
        // console.log(content);
        return JSON.parse(content);
      };

      const waitResult = () => {
        const begin = new Date().getTime() / 1000;
        return new Promise((resolve, reject) => {
          const checkResult = () => {
            try {
              if (new Date().getTime() / 1000 - begin > 180) {
                console.log("识别超时(180s限制)");
                reject("识别超时");
                return;
              }
              const result = getResult();
              console.log("识别status:" + result.content.orderInfo.status);
              if (result.content.orderInfo.status === 4) {
                console.log("识别完成");
                resolve(JSON.parse(result.content.orderResult));
              } else {
                console.log("识别还未完成");
                setTimeout(checkResult, 3000);
              }
            } catch (error) {
              console.log("请求识别结果失败", error);
            }
          };
          checkResult();
        });
      };
      sleep(3000);
      waitResult().then((res) => {
        try {
          const result = getXfJsonResult(res).replace(/\s/g, "");
          // 植物园站房发现中间接头松动，通知运维人员处理，问题描述：中间接头松动
          if (
            result.includes("站房") &&
            result.includes("植物") &&
            result.includes("中间接头") &&
            result.includes("运维")
          ) {
            message("匹配知识库成功，开始执行脚本");
            const desc = result.split("问题描述")[1];
            threads.start(function () {
              questionScript({ questionDesc: desc }, result);
            });
          } else {
            message(
              "匹配知识库失败，无对应指令，您的指令是：" + result,
              false,
              5000
            );
          }
        } catch (error) {
          console.log("222", error);
        }
      });
    }
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
              message("说话完毕，正在识别中...", true);
              rec.stop();
              rec.release();
              threads.start(function () {
                sleep(1000);
                axiosPost();
              });
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

  ui.setting.click(() => {
    setting();
  });
};

homePage();
// setting();
