const mongoose = require('mongoose');
const db = require("../db.js");
const schema = require('../models/schema.js');
const Config = require('../../config.json');
const fs = require('fs');

const model = mongoose.model('User', schema);
const {
	requestPost
} = require('../../utils/utils.js');

module.exports.detect = function(req, res) {
	return new Promise(function(resolve, reject) {
		var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
		var binaryData = new Buffer(base64Data, 'base64').toString('binary');

		let pic = {
			img: base64Data
		}

		let url = Config.apiFace + '/tencent/detect';

		requestPost(url, JSON.stringify(pic)).then(function(data) {
			resolve(data);
		});
	});
}

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
		// console.log(url);

		requestPost(url, JSON.stringify(pic)).then(function(data) {
			let result = JSON.parse(data);
			if (result.code == 0) {
				if (result.data && result.data.ret_codes && result.data.ret_codes[0] == -1312) {
					//-1312对个体添加了相似度为99%及以上的人脸
					let error = -1312;
					resolve(error);
					return false;
				}
				if (result.data && (result.data.added > 0 || result.data.suc_face > 0)) {
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
				}

			} else {
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

module.exports.faceidentify = function(req, res) {
	return new Promise(function(resolve, reject) {
		var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
		var binaryData = new Buffer(base64Data, 'base64').toString('binary');

		let pic = {
			img: base64Data,
		}

		let url = Config.apiFace + '/tencent/identify';
		// console.log(url);

		requestPost(url, JSON.stringify(pic)).then(function(data) {
			let result = JSON.parse(data);
			if (result.code == 0) {
				if (result.data.candidates[0].confidence >= Config.confidence) {
					//识别成功
					let jsonFind = {
						openid: result.data.candidates[0].person_id,
						signed: "true"
					}

					model.findOne(jsonFind, function(error, result) {
						if (error) {
							console.log(error);
							resolve(error);
						} else {
							if (result !== null) {
								//验证过
								resolve(result);
							} else {
								//写入验证
								var img = './identify/' + jsonFind.openid + '.jpg';
								fs.writeFile(img, binaryData, 'binary', function(err) {
									if (err) {
										console.log(err);
									}
								});

								var conditions = {
									openid: jsonFind.openid
								};

								var update = {
									$set: {
										faceimg: '/identify/' + jsonFind.openid + '.jpg',
										signed: 'true',
										facebase64: req.body.img
									}
								};
								model.update(conditions, update, function(error) {
									resolve(error);
								});
							}
						}
					});
				}

			} else {
				resolve(result);
			}
		})


	});
}

module.exports.facesigned = function(req, res) {
	return new Promise(function(resolve, reject) {
		let json = {
			signed: 'true'
		}
		model.find(json, function(error, result) {
			if (error) {
				console.log(error);
				resolve(error);
			} else {
				resolve(result);
			}
		});


	});
}