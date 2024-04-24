importClass(android.content.pm.PackageManager);
importClass("androidx.core.app.ActivityCompat");
importClass(android.media.MediaRecorder);
importClass(android.speech.SpeechRecognizer);
importClass(java.io.File);
importClass(java.security.MessageDigest);
const SecretKeySpec = javax.crypto.spec.SecretKeySpec;
const Mac = javax.crypto.Mac;
const Base64 = java.util.Base64;
const RequestBody = Packages.okhttp3.RequestBody;
const MediaType = Packages.okhttp3.MediaType;
const Request = Packages.okhttp3.Request;

const appId = "7a3bf92a";
const secretKey = "79bc13e566ccff70c1cd7cb925dd39ed";

isInitLogger = false;

function MD5(strInfo) {
  try {
    // 得到一个信息摘要器
    var digest = MessageDigest.getInstance("md5");
    var result = digest.digest(new java.lang.String(strInfo).getBytes("UTF-8"));
    var buffer = new java.lang.StringBuffer();
    // 把每一个byte 做一个与运算 0xff;
    for (let index = 0; index < result.length; index++) {
      var b = result[index];
      // 与运算
      var number = b & 0xff; // 加盐
      var str = java.lang.Integer.toHexString(number);
      if (str.length == 1) {
        buffer.append("0");
      }
      buffer.append(str);
    }
    // 标准的md5加密后的结果
    return buffer.toString();
  } catch (error) {
    alert(error);
    return "";
  }
}

function base64Encode(input) {
  var encodedBytes = Base64.getEncoder().encode(input);
  var encodedString = new java.lang.String(encodedBytes);
  return encodedString.toString();
}

// HMAC-SHA1加密函数
function hmacSha1(key, data) {
  var secret = new SecretKeySpec(
    new java.lang.String(key).getBytes(),
    "HmacSHA1"
  );
  var mac = Mac.getInstance("HmacSHA1");
  mac.init(secret);
  var bytes = mac.doFinal(new java.lang.String(data).getBytes());
  return bytes;
}

function recorder() {
  // 创建 MediaRecorder 实例
  const rec = new MediaRecorder();

  // 设置音频源为麦克风
  rec.setAudioSource(MediaRecorder.AudioSource.MIC);

  // 设置输出格式为默认的三星格式
  rec.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);

  // 设置音频编码器为默认的AMR_NB
  rec.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);
  const file = new File("/sdcard/voice.wav");
  rec.setOutputFile(file);
  rec.prepare();
  return rec;
}

function checkPermission() {
  let permissionName = "RECORD_AUDIO";
  let pm = context
    .getPackageManager()
    .checkPermission(
      "android.permission." + permissionName,
      context.getPackageName()
    );
  if (PackageManager.PERMISSION_GRANTED == pm) {
    return true;
  } else {
    return false;
  }
}

function message(text, isNotClose, time) {
  floaty.closeAll();
  const window = floaty.rawWindow(
    <frame gravity="center">
      <vertical
        gravity="center"
        bg="#AA000000"
        w="200"
        h="auto"
        marginTop="-50"
        minHeight="60"
      >
        <text
          id="text"
          textSize="20sp"
          textColor="#FFFFFF"
          gravity="center"
          singleLine="false"
        />
      </vertical>
    </frame>
  );
  window.setSize(device.width, device.height);
  window.setTouchable(true);
  window.text.setText(text);
  console.log("message:", text);
  if (!isNotClose) {
    setTimeout(() => {
      window.close();
    }, time || 1500);
  }
}

const xFSign = () => {
  const ts = new Date().getTime();
  const baseString = appId + ts;
  const md5Str = MD5(baseString);
  const hmac = hmacSha1(secretKey, md5Str);
  const signa = base64Encode(hmac);
  console.log(JSON.stringify({ appId, signa, ts }), signa);
  return { appId, signa, ts };
};

const httpInputStream = (url, filePath, fileLength) => {
  try {
    const fileInputStream = new java.io.FileInputStream(filePath);
    const buffer = java.lang.reflect.Array.newInstance(
      java.lang.Byte.TYPE,
      fileLength
    );
    fileInputStream.read(buffer);
    const client = new OkHttpClient();
    const requestBody = RequestBody.create(
      MediaType.parse("application/octet-stream"),
      buffer
    );
    const request = new Request.Builder().url(url).post(requestBody).build();
    // // 发起请求
    const response = client.newCall(request).execute();
    fileInputStream.close();
    const result = JSON.parse(response.body().string());
    return result;
  } catch (error) {
    console.log('上传文件流失败' + error);
    return {}
  }
}

const getXfJsonResult = (result) => {
  let recognitionResult = "";
  if (result && result.lattice && result.lattice.length > 0) {
    let latticeArray = result.lattice;
    for (let i = 0; i < latticeArray.length; i++) {
      let lattice = latticeArray[i];
      if (lattice && lattice.json_1best) {
        let json1best = JSON.parse(lattice.json_1best);
        if (json1best && json1best.st && json1best.st.rt && json1best.st.rt.length > 0) {
          recognitionResult += json1best.st.rt.reduce((acc, rt) => {
            if (rt.ws) {
              rt.ws.forEach(ws => {
                if (ws.cw) {
                  ws.cw.forEach(cw => {
                    if (cw.w) {
                      acc += cw.w;
                    }
                  });
                }
              });
            }
            return acc;
          }, "");
          // 在每个lattice循环结束时添加一个空格，除非是最后一个lattice
          if (i < latticeArray.length - 1) {
            recognitionResult += " ";
          }
        }
      }
    }
  }
  return recognitionResult.trim() || "无法提取识别结果";
}

function initLogger() {
  window = floaty.rawWindow(
    <frame padding="2" alpha="0.7" bg="#505050" w="*">
      <vertical >
        <ScrollView id="As" h="*" w="*">
          <text id="Alog" textSize="14sp" textColor="#28FF28" margin="1">日志输出</text>
        </ScrollView>
      </vertical>
    </frame>
  );
  window.setSize(device.width / 2, 500)
  window.setPosition(0, 0)
  window.setTouchable(false)
  isInitLogger = true
}
function showLogger() {
  window.setSize(0, 0)
}
function hideLogger() {
  window.setSize(500, 500)
}

function log(text) {
  if (!isInitLogger) {
    initLogger()
  }
  if (text instanceof Object) {
    text = JSON.stringify(text)
  }
  console.log(text)

  ui.run(function () {
    window.Alog.append("\n" + text);
    //    window.As.scrollTo(0, window.Alog.getHeight());
  }
  );
  ui.run(function () {
    // window.Alog.append("\n"+日志);
    window.As.scrollTo(0, window.Alog.getHeight());
  }
  );
}

const clickObj = (obj) => {
  const x1 = obj.bounds().left
  const x2 = obj.bounds().right
  const x = ((x2 - x1) / 2) + x1
  const y1 = obj.bounds().bottom
  const y2 = obj.bounds().top
  const y = ((y1 - y2) / 2) + y2
  click(x, y + 5)
  sleep(500)
}

module.exports = {
  checkPermission,
  recorder,
  message,
  xFSign,
  httpInputStream,
  getXfJsonResult,
  log,
  hideLogger,
  showLogger,
  clickObj
};
