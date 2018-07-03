const moment = require('moment');
const http = require('http');
const urltil = require('url');

class Utils {
	static getMoment() {

		let now = moment().format('YYYY-MM-DD');
		// let today = moment(now).format('YYYY-MM-DD HH:mm:ss');
		// let yesterday = moment(today).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
		// let tomorrow = moment(today).add(1, 'days').format('YYYY-MM-DD HH:mm:ss');

		let zero = moment(now).toISOString(true);
		let today = moment(zero).toISOString(true);
		let yesterday = moment(zero).subtract(1, 'days').toISOString(true);
		let tomorrow = moment(zero).add(1, 'days').toISOString(true);
		return {
			'today': today,
			'yesterday': yesterday,
			'tomorrow': tomorrow
		}
	}

	static getNow() {
		return moment().toISOString(true)
	}

	static requestPost (url, data) {
		let self = this;
		return new Promise((resolve, reject) => {
			//解析 url 地址
			let urlData = urltil.parse(url);
			//设置 https.request  options 传入的参数对象
			let options = {
				//目标主机地址
				hostname: urlData.hostname,
				port:urlData.port,
				//目标地址
				path: urlData.path,
				//请求方法
				method: 'POST',
				//头部协议
				headers: {
					// 'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Type': 'application/json',
					// 'Content-Type': 'multipart/form-data',
					'content-length': Buffer.byteLength(data, 'utf-8')
				}
			};
			let req = http.request(options, (res) => {
					let buffer = [],
						result = '';
					//用于监听 data 事件 接收数据
					res.on('data', (data) => {
						buffer.push(data);
					});
					//用于监听 end 事件 完成数据的接收
					res.on('end', () => {
						result = Buffer.concat(buffer).toString('utf-8');
						resolve(result);
					})
				})
				//监听错误事件
				.on('error', (err) => {
					// console.log(err);
					reject(err);
				});
			//传入数据
			// console.log(data);
			req.write(data);
			req.end();
		});
	}
}

module.exports = Utils;