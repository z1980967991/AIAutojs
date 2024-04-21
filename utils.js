importClass(android.content.pm.PackageManager);
importClass("androidx.core.app.ActivityCompat");
importClass(android.media.MediaRecorder);
importClass(android.speech.SpeechRecognizer);
importClass(java.io.File);
importClass(java.security.MessageDigest);
const SecretKeySpec = javax.crypto.spec.SecretKeySpec;
const Mac = javax.crypto.Mac;
const Base64 = java.util.Base64;

const appId = "7a3bf92a";
const secretKey = "79bc13e566ccff70c1cd7cb925dd39ed";

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

function message(text, isNotClose) {
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
    }, 1500);
  }
}

const xFSign = () => {
  const ts = new Date().getTime();
  const baseString = appId + ts;
  const md5Str = MD5(baseString);
  const hmac = hmacSha1(secretKey, md5Str);
  const signa = base64Encode(hmac);
  console.log(JSON.stringify({ appId, signa, ts }));
  return { appId, signa, ts };
};

module.exports = {
  checkPermission,
  recorder,
  message,
  xFSign,
};
