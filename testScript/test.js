const clickObj = (obj) => {
  const x1 = obj.bounds().left;
  const x2 = obj.bounds().right;
  const x = (x2 - x1) / 2 + x1;
  const y1 = obj.bounds().bottom;
  const y2 = obj.bounds().top;
  const y = (y1 - y2) / 2 + y2;
  click(x, y + 5);
  sleep(500);
};

// const dom = id("shutter_button").findOne(1000);
// clickObj(dom);
// clickObj(
//   className("android.view.View")
//     .depth(9)
//     .drawingOrder(0)
//     .indexInParent(0)
//     .findOnce(2)
// );
toast(idContains("done_button").exists());
// var uc = className("android.widget.ImageView")
//   .find()
//   .map(function (w) {
//     return w.id();
//   });
// console.log(uc);
