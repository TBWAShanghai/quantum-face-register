// require('events').EventEmitter.defaultMaxListeners = 100;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const Config = require('./config.json');
const port = process.env.PORT || Config.apiPort;

app.use(bodyParser.json({
	limit: '50mb'
}));

app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: true
}));

const Site = require('./website/datas/site.js');

// API路由配置 // ==========================================================
var router = express.Router();

router.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	next();
});

router.get('/', function(req, res) {
	res.json({
		message: 'hi! welcome to our api!'
	});
});

router.post('/check', function(req, res) {
	Site.check(req, res).then((result) => {
		res.json({
			code: 200,
			msg: "check return",
			data: result
		});
	});
});

router.post('/register', function(req, res) {
	Site.register(req, res).then((error) => {
		if (error) {
			res.json({
				code: 500,
				msg: "save error",
				error: error
			});
		} else {
			res.json({
				code: 200,
				msg: "save ok",
				data: error
			});
		}
	});
});

app.use('/', router);

// 启动server // =========================================================
//开始监听端口
app.listen(port);
console.log('Magichappens on port ' + port);