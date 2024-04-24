/*
 * @Author: mingLiang
 * @Date: 2024-04-21 15:25:55
 * @LastEditTime: 2024-04-21 15:27:27
 * @FilePath: \巡检助手\test\shatest.js
 */
// 导入相关的Java类
var SecretKeySpec = javax.crypto.spec.SecretKeySpec;
var Mac = javax.crypto.Mac;
var Base64 = java.util.Base64;

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

// 对结果进行Base64处理
function base64Encode(input) {
  var encodedBytes = Base64.getEncoder().encode(input);
  return new java.lang.String(encodedBytes);
}

// 输入的密钥和数据
var key = "79bc13e566ccff70c1cd7cb925dd39ed";
var data = "d0eb191d176b333edddc1be5d39df215";

// HMAC-SHA1加密
var hmacResult = hmacSha1(key, data);
console.log("hmacResult", hmacResult);

// Base64处理
var base64Result = $base64.encode(hmacResult);

// 输出结果
console.log("HMAC-SHA1 Result: " + base64Result);
