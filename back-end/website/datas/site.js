const mongoose = require('mongoose');
const db = require("../db.js");
const schema = require('../models/schema.js');
const Config = require('../../config.json');
const fs=require('fs');

const model = mongoose.model('User', schema);

module.exports.register = function(req, res) {
	return new Promise(function(resolve, reject) {
		var base64Data = req.body.img.replace(/^data:image\/jpeg;base64,/, "");
		var binaryData = new Buffer(base64Data, 'base64').toString('binary');
		var img='./register/'+req.body.openid+'.jpg';
		fs.writeFile(img, binaryData, 'binary', function(err) {
			if (err) {
				console.log(err);
			}
		});
		//存储数据到mongoogdb
		let json = {
			openid: req.body.openid,
			name: req.body.name,
			tel: req.body.tel,
			img: '/register/'+req.body.openid+'.jpg'
		}
		model.create(json, function(error) {
			resolve(error);
		});
	});
}