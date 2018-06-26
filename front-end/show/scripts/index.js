 var url = "http://localhost:3000/tencent/identify";
 window.onload = function() {
   var video = document.getElementById('video');
   var canvas = document.getElementById('canvas');
   var context = canvas.getContext('2d');
   var tracker = new tracking.ObjectTracker('face');
   var shortCut = document.getElementById('shortCut');
   var scContext = shortCut.getContext('2d');

   var full = document.getElementById('full');
   var fullContext = full.getContext('2d');
   var time = 3000;
   tracker.setInitialScale(4);
   tracker.setInitialScale(1);
   tracker.setStepSize(2);
   tracker.setEdgesDensity(0.1);
   tracking.track('#video', tracker, {
     camera: true
   });
   var flag = true;
   var config=new function(){
    this.width=300;
   }
   tracker.on('track', function(event) {
     context.clearRect(0, 0, canvas.width, canvas.height);
     var rect = event.data[0];
     if (event.data[0] && rect.width > config.width) {

       if (flag) {
         console.log("拍照");
         // getPhoto();
         // shortCut.width = rect.width;
         // shortCut.height = rect.height;
         scContext.clearRect(0, 0, shortCut.width, shortCut.height);
         fullContext.drawImage(video, 0, 0, canvas.width, canvas.height);
         var rectX = (rect.x - 50 > 0) ? (rect.x - 50) : 0;
         var rectY = (rect.y - 50 > 0) ? (rect.y - 50) : 0;
         // console.log(rect.width);
         // console.log(full.toDataURL('image/jpeg'))
         scContext.drawImage(full, rectX, rectY, rect.width + 100, rect.height + 100, 0, 0, shortCut.width, shortCut.width);
         var base64 = full.toDataURL('image/jpeg');
         sendPhoto(base64, rect);
         flag = false;
         setTimeout(function() {
           flag = true;
         }, time);
       } else {
         console.log("冷却中");
       }


       context.strokeStyle = '#a64ceb';
       context.strokeRect(rect.x, rect.y, rect.width, rect.height);
       context.font = '11px Helvetica';
       context.fillStyle = "#fff";
       context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
       context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
       context.fillText('width: ' + rect.width + 'px', rect.x + rect.width + 5, rect.y + 33);
       context.fillText('height: ' + rect.height + 'px', rect.x + rect.width + 5, rect.y + 44);
     }
   });
   var gui = new dat.GUI();
   gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
   gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
   gui.add(tracker, 'stepSize', 1, 5).step(0.1);
   gui.add(config, 'width', 200, 500);

   function sendPhoto(photo, rec) {
     $.ajax({
       url: url,
       type: "post",
       dataType: "json",
       data: {
         img: photo.substring(photo.indexOf(",") + 1)
       },
       success: function(result) {
         console.log(result);
         if (result.message == 'OK') {
           if (result.data.candidates[0].confidence >= 70) {
             console.log("验证成功");
           } else {
             console.log("验证失败");
           }
         }

       }
     });
   }
 };