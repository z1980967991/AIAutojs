const url =
  "https://raasr.xfyun.cn/v2/api/upload?appId=7a3bf92a&signa=g8ie%2BG%2BQx1GrHmOn20e9xkb7Bl0%3D&ts=1713711198&fileSize=9179&fileName=voice.wav&duration=200";

const res = http.request(url, {
  headers: {
    "Content-Type": "application/octet-stream",
  },
  body: [],
});
console.log(res.body.json());
