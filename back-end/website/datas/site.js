const mongoose = require('mongoose');
const db = require("../db.js");
const schema = require('../models/schema.js');
const Config = require('../../config.json');
const fs = require('fs');

const model = mongoose.model('User', schema);
const {
	requestPost
} = require('../../utils/utils.js');

module.exports.register = function(req, res) {
	return new Promise(function(resolve, reject) {
		var exist = req.body.exist;
		var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
		var binaryData = new Buffer(base64Data, 'base64').toString('binary');

		let pic = {
			openid: req.body.openid,
			name: req.body.name,
			tel: req.body.tel,
			img: base64Data,
			exist: exist
		}

		let url = Config.apiFace + '/tencent/newperson';

		requestPost(url, JSON.stringify(pic)).then(function(data) {
			let result=JSON.parse(data);
			if (result.code == 0) {
				var img = './register/' + req.body.openid + '.jpg';
				fs.writeFile(img, binaryData, 'binary', function(err) {
					if (err) {
						console.log(err);
					}
				});
				if (exist == 'false') {
					//存储数据到mongoogdb
					let json = {
						openid: req.body.openid,
						name: req.body.name,
						tel: req.body.tel,
						img: '/register/' + req.body.openid + '.jpg'
					}
					model.create(json, function(error) {
						resolve(error);
					});
				} else {
					//更新
					var conditions = {
						openid: req.body.openid
					};

					var update = {
						$set: {
							name: req.body.name,
							tel: req.body.tel,
							img: '/register/' + req.body.openid + '.jpg'
						}
					};
					model.update(conditions, update, function(error) {
						resolve(error);
					});
				}
			}else{
				resolve(result);
			}
		})


	});
}

module.exports.check = function(req, res) {
	return new Promise(function(resolve, reject) {
		//查找数据
		let json = {
			openid: req.body.openid
		}
		model.findOne(json, function(error, result) {
			if (error) {
				console.log(error);
				resolve(error);
			} else {
				resolve(result);
			}
		});
	});
}