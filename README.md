人脸签到（trakcing.js+three.js+anime.js）

1. 微信注册： https://wechat.mynecis.cn/face/register

2. 手机浏览器打开人脸识别（iphone需要ios11）：
https://wechat.mynecis.cn/face/showmobile/

3. 电脑打开：https://wechat.mynecis.cn/face/screen/

# 项目说明

##目录结构

```
	├── .gitignore 							//git忽略文件
	├── README.md 							//项目说明
	├── back-end/ 							//后端文件
	| ├── app.js 							//项目启动文件
	| ├── config.json 						//项目配置文件
	| ├── package-lock.json 					//node依赖配置
	| ├── package.json 						//node配置
	| ├── node_modules/ 						//node包
	| ├── utils 							//工具文件
	| |	└── utils.js						//工具文件
	| |── website/
	| |	├── db.js 						//连接数据库
	| |	├── models/
	| |	| └── schema.js 					//schema
	| |	└── datas/						//获取数据
	| |	  └──site.js 						//api function
	| └── rigister 						    //注册图片
	└── front-end/							//前端文件
	  ├── register/							//注册
	  |	├── images/ 						//图片
	  |	├── index.html						//主文件
	  |	├── styles 							//样式
	  |	└── scripts/						//脚本文件
	  ├── screen/							//大屏
	  |	├── images/ 						//图片
	  |	├── index.html						//主文件
	  |	├── styles 							//样式
  	  |	├── libs/							//库文件
	  |	└── scripts/						//脚本文件
	  ├── showmobile/						//人脸识别手机
	  |	├── index.html						//主文件
	  |	├── styles 							//样式
	  |	└── scripts/						//脚本文件
  	  └── show/						        //人脸识别pc
	  	├── index.html						//主文件
	  	├── styles 							//样式
	  	└── scripts/						//脚本文件

```
