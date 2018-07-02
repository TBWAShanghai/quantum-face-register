/**
 * Created by necis on 2018/6/26.
 */
var api = {
    "register": "http://localhost:5000/register",
    "check": "http://localhost:5000/check"
}
var Mobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function() {
        return (this.Android() || this.BlackBerry() || this.iOS() || this.Windows());
    },
    getName: function() {
        if (this.iOS()) {
            return 'ios';
        } else if (this.Android()) {
            return 'android'
        } else if (this.BlackBerry()) {
            return 'blackberry'
        } else if (this.Windows()) {
            return 'windows'
        } else {
            return 'pc'
        }
    }
};

$(function() {
    var exist = false;
    $.ajax({
        url: api.check,
        type: 'POST',
        data: {
            openid: openid,
        },
        success: function(e) {
            console.log(e);
            if (e.data) {
                console.log('注册过');
                exist = true;
                $("#check").show();
            }
        },
        error: function() {
            alert('错误的网路环境！请联系管理人员！');
        }
    });

    var img;
    var IS_IOS = Mobile.iOS();

    var $page, $canvas, $handler, $confirm;
    var $photo;

    // photo
    var ctx;
    // var canvas;
    var transform;
    var mc;

    $canvas = $('.face-canvas');
    $photo = $('.profile-img input');
    $confirm = $('#confirm_profile');
    $handler = $('.photo_handler');
    $submit = $('#submit');
    // console.log($handler);
    var $profilepopup = $('.profile-edit-popup');
    var $confirmfaceimg = $('.confirm-face-img');

    $photo.on('change', function() {
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

            var mpImg = new MegaPixImage(file);

            mpImg.render(fullScreenImg, {
                maxWidth: 960,
                maxHeight: 960,
                orientation: imgExif.Orientation
            });
            fullScreenImg.onload = function() {
                // callback(fullScreenImg)
                // alert(2);
                var canvas = $canvas[0];
                var base64 = imageCompress(fullScreenImg, 1500);
                // console.log(base64);
                var image = new Image();
                image.onload = function() {
                    initImage(image, faceCallback, canvas, $confirm, $handler)
                };
                image.src = base64;
                img = base64;
                $photo.val('');
                $profilepopup.show();
            };
        };


        reader.readAsBinaryString(file);
    });

    $(".cancel").on('click', function() {
        $(".popup").hide();
    });

    $submit.on('click', function() {
        var base64 = img;
        var name = $("#name").val();
        var tel = $("#tel").val();
        var id = openid;
        if (!img) {
            alert("请上传图片");
            return false;
        }
        if (name == '') {
            alert("请填写姓名");
            return false;
        }

        if (tel == '') {
            alert("请填写电话");
            return false;
        }

        $.ajax({
            url: api.register,
            type: 'POST',
            data: {
                openid: openid,
                name: name,
                tel: tel,
                img: base64,
                exist: exist
            },
            beforeSend: function() {
                $(".top-box").show();
            },
            success: function(e) {
                $(".top-box").hide();
                if(e.code==200){
                    console.log('注册成功');
                    $("#name").val('');
                    $("#tel").val('');
                    img=null;
                    base64=null;
                    $photo.val('');
                    $confirmfaceimg.attr("src",'');
                    exist=true;
                    $("#check").show();
                    alert("注册成功");
                }else{
                    alert("请上传正确的人脸");
                }
            },
            error: function() {
                $(".top-box").hide();
                alert('错误的网路环境！请联系管理人员！');
            }
        });
    })

    function faceCallback(imageUrl) {
        $confirmfaceimg.attr("src", imageUrl);
        $confirmfaceimg.show();
        $profilepopup.hide();
    }

    function dishCallback(imageUrl) {
        $confirmdishimg.attr("src", imageUrl);
        $confirmdishimg.show();
        $dishpopup.hide();
    }

    function initImage(image, callback, canvas, $confirm, $handler) {
        var imgWidth = image.width;
        var imgHeight = image.height;
        var canvasRatio = 120 / 180;
        var imageRatio = imgWidth / imgHeight;

        var offsetX = 0,
            offsetY = 0;
        var height = imgHeight,
            width = imgWidth;

        if (imageRatio > canvasRatio) {
            height = 180;
            width = height * imageRatio;
            offsetX = -(120 - imgWidth / 2);
        } else {
            width = 120;
            height = width / imageRatio;
            offsetY = -(180 - imgHeight / 2);
        }

        destoryHammer();

        bindGesture({
            offsetX: offsetX,
            offsetY: offsetY,
            width: width,
            height: height,
            image: image
        }, canvas, $handler);

        // $confirm.off('tap').one('tap', function(){
        $confirm.on('click', function() {
            var imageUrl = snapShot(image, transform, canvas, 0, 0, canvas.width, canvas.height);
            callback && callback(imageUrl);
        });

    }

    function redrawCanvas(img, canvas) {
        var ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.save();
        var width = canvas.width;
        var height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(
            antialiasing(img, transform, canvas, IS_IOS ? 2 : 1),
            0,
            0,
            width,
            height
        );
        ctx.restore();
    }

    function destoryHammer() {
        if (mc) {
            mc.destroy()
        }
    }

    function bindGesture(config, canvas, $handler) {

        var reqAnimationFrame = (function() {
            return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        })();

        mc = new Hammer.Manager($handler[0]);

        var START_X = 0;
        var START_Y = 0;

        var ticking = false;

        mc.add(new Hammer.Pan({
            threshold: 0,
            pointers: 0
        }));

        mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));
        mc.add(new Hammer.Rotate({
            threshold: 0
        })).recognizeWith(mc.get('pan'));
        mc.add(new Hammer.Pinch({
            threshold: 0
        })).recognizeWith([mc.get('pan'), mc.get('rotate')]);

        mc.add(new Hammer.Tap());

        mc.on("panstart panmove", onPan);
        mc.on("panend", endPan);
        mc.on("rotatestart rotatemove", onRotate);
        mc.on("pinchstart pinchmove", onPinch);


        function updateElementTransform() {
            ticking = false;
            redrawCanvas(config.image, canvas);
        }

        function resetElement() {
            transform = {
                translate: {
                    x: START_X,
                    y: START_Y
                },
                scale: 2,
                angle: 0,
                width: config.width,
                height: config.height,
                rx: config.offsetX,
                ry: config.offsetY,
                rz: 0
            };
            requestElementUpdate();
        }

        function requestElementUpdate() {
            if (!ticking) {
                reqAnimationFrame(updateElementTransform);
                ticking = true;
            }
        }

        function onPan(ev) {
            transform.translate = {
                x: START_X + ev.deltaX,
                y: START_Y + ev.deltaY
            };
            requestElementUpdate();
        }

        function endPan() {
            START_X = transform.translate.x;
            START_Y = transform.translate.y;
        }

        var initAngle = 0;
        var debounce;

        function onRotate(ev) {
            if (ev.type == 'rotatestart') {
                initAngle = transform.angle || 0;
                debounce = ev.rotation;
                return;
            }
            transform.rz = 1;
            transform.angle = initAngle + ev.rotation - debounce
            requestElementUpdate()
        }

        var initScale = 1;

        function onPinch(ev) {
            if (ev.type == 'pinchstart') {
                initScale = transform.scale || 1;
            }
            transform.scale = initScale * ev.scale;
            requestElementUpdate()
        }

        resetElement();

    }
});