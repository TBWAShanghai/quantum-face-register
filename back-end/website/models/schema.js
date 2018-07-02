'use strict';

const mongoose = require('mongoose');

const {getNow}=require('../../utils/utils.js');

const Schema = mongoose.Schema;

const localtime = function() {
	return new Date().toLocaleString()
}

const localDate=function(){
	return Date.now() + 8 * 3600 * 1000
}

// Schema
const schema = new Schema({
	openid: {
		type: String
	},
	name: {
		type: String
	},
	tel: {
		type: String
	},
	img: {
		type: String
	},
	createTime: {
		type: String,
		default: getNow
	},
	updateTime: {
		type: String,
		default: getNow
	}
});

module.exports = schema;