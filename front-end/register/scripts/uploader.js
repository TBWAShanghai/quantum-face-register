var $canvas = $('<canvas></canvas>');
var $antialiasingCanvas = $('<canvas></canvas>');
var $cropCanvas = $('<canvas></canvas>');

function handleFile(callback){

    return function(){
        if (this.files.length <= 0) {
            return false;
        }

        var file = this.files[0];
        var reader = new FileReader();

        reader.onload = function() {
            // 转换二进制数据

            var binary = this.result;
            var binaryData = new BinaryFile(binary);
            var imgExif = EXIF.readFromBinaryFile(binaryData);

            var fullScreenImg = new Image();
            fullScreenImg.onload = function(){
                //callback(fullScreenImg)
            };

            var mpImg = new MegaPixImage(file);

            mpImg.render(fullScreenImg, {
                maxWidth:960,
                maxHeight:960,
                orientation:imgExif.Orientation
            });
        };

        console.log(reader);
        reader.readAsBinaryString(file);
    }
}

function imageCompress(img,max2,quality2){
    var max= max2 || 1000;
    var quality= quality2 || 0.8;
    var imgWidth = img.width;
    var imgHeight = img.height;
    var ratio = imgWidth / imgHeight;
    var width = imgWidth , height = imgHeight;

    if(imgWidth > max && ratio>=1){
        width = max;
        height = max/ratio
    }
    if(imgHeight > max && ratio<=1){
        height = max;
        width = max * ratio
    }
    var ctx = $canvas[0].getContext('2d');
    $canvas.attr({
        width:width,
        height:height
    });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    var base64 = $canvas[0].toDataURL('image/jpeg',quality);

    return base64
}

function antialiasing (image, transform, canvas, quality){
    var distCanvas =  $antialiasingCanvas[0];

    distCanvas.width = canvas.width * quality;
    distCanvas.height = canvas.height * quality;
    var res_ctx = distCanvas.getContext("2d");
    res_ctx.clearRect(0, 0, distCanvas.width, distCanvas.height);

    res_ctx['webkitImageSmoothingEnabled'] = true;
    res_ctx['imageSmoothingEnabled'] = true;
    res_ctx.save();

    res_ctx.translate(
        distCanvas.width / 2 + transform.translate.x * quality,
        distCanvas.height / 2 + transform.translate.y * quality
    );
    res_ctx.rotate(Math.PI * (transform.angle / 180));

    var scaleWidth = transform.width * transform.scale * quality;
    var scaleHeight = transform.height * transform.scale * quality;

    res_ctx.drawImage(image, - scaleWidth / 2 , -scaleHeight / 2 , scaleWidth + 1, scaleHeight + 1);
    res_ctx.translate(-distCanvas.width / 2 , -distCanvas.height / 2 );
    res_ctx.restore();

    return distCanvas;
}

function snapShot (image, transform, canvas, left, top, cwidth, cheight) {
  const cropCanvas = $cropCanvas[0];
  const crop_ctx = cropCanvas.getContext("2d");
  const distcanvas = antialiasing(image, transform, canvas, 2);

  const width = cwidth * 2;
  const height = cheight * 2;
  cropCanvas.width = width;
  cropCanvas.height = height;
  crop_ctx.clearRect(0, 0, width, height);
  crop_ctx.fillStyle = "#000000";
  crop_ctx.fillRect(0, 0, width, height);
  crop_ctx.drawImage(distcanvas, -left*2, -top*2, distcanvas.width, distcanvas.height);
  const dataURL = cropCanvas.toDataURL('image/jpeg',0.6);
  return dataURL;
}