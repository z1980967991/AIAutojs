/*
 * @Author: mingLiang
 * @Date: 2024-04-20 13:34:14
 * @LastEditTime: 2024-04-20 13:36:21
 * @FilePath: \巡检助手\test\recordTest.js
 */
// 导入需要的类
importClass(android.media.MediaRecorder);
importClass(android.speech.SpeechRecognizer);
importClass(java.io.File);

// 创建 MediaRecorder 实例
var recorder = new MediaRecorder();

// 设置音频源为麦克风
recorder.setAudioSource(MediaRecorder.AudioSource.MIC);

// 设置输出格式为默认的三星格式
recorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);

// 设置音频编码器为默认的AMR_NB
recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

var file = new File("/sdcard/speek.3gp");
recorder.setOutputFile(file);
// // 准备录音
recorder.prepare();

// // 开始录音
recorder.start();

sleep(10000);
recorder.stop();
