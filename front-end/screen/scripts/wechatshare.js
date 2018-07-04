$.ajax({
    url: '/wx/wx/getsignature' // 此处url请求地址需要替换成你自己实际项目中服务器数字签名服务地址
        ,
    type: 'post',
    data: {
        url: location.href.split('#')[0] // 将当前URL地址上传至服务器用于产生数字签名
    }
}).done(function(r) {
    // 开始配置微信JS-SDK
    wx.config({
        debug: false,
        appId: r.appId,
        timestamp: r.timestamp,
        nonceStr: r.nonceStr,
        signature: r.signature,
        jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'chooseImage'
        ]
    });

    // 调用微信API
    wx.ready(function() {
        var sdata = {
            title: '快来看吧，人脸签到！',
            desc: '快来看吧，人脸签到！',
            link: 'https://wechat.mynecis.cn/face/screen/',
            imgUrl: 'https://wechat.mynecis.cn/face/screen/images/icons8-github.png',
            success: function() {
                // alert('用户确认分享后执行的回调函数');
            },
            cancel: function() {
                // alert('用户取消分享后执行的回调函数');
            }
        };
        wx.onMenuShareTimeline(sdata);
        wx.onMenuShareAppMessage(sdata);
    });
});