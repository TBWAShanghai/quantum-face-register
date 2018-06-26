const moment = require('moment');

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

	static getNow(){
		return moment().toISOString(true)
	}
}

module.exports = Utils;