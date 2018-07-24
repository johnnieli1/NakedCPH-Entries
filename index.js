var cheerio = require('cheerio');
var fs = require('fs');

/* Modify lines below */
var catchall = "dontfuckwithme.com"; // For the accounts (if you win)
var password = 'Johnnielilol1'; // For the accounts (if you win)
var retryDelay = 10000; // How many miliseconds before retrying if error
var tasks = 200; //Change this to the amount of accounts you would like entered
/* End */

var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
var tasksComplete = 0;

console.log('\x1b[1;35m', 'NakedCPH Entry Bot.\n Made for Carlton Notify')

var proxies;
fs.readFile('proxies.txt', 'utf8', function (err, data) {
	proxies = data.split('\n');
	initProxies();
});

function initProxies() {
	for (var i = 0; i < tasks; i++) {
		if (proxies.length >= 1) {
			var proxy = getRandomProxy();
			performTask(i, proxy)
		}
	}
}

function performTask(taskNum, proxy) {
	var jar = require('request').jar()
	var request = require('request').defaults({
		jar: jar
	});

	request({
		url: 'https://www.nakedcph.com/auth/view?op=register',
		method: 'GET',
		headers: {
			'User-Agent': userAgent,
		},
		proxy: proxy,
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				performTask(taskNum, proxy);
			}, retryDelay)
			return;
		}
		if (response.statusCode == 200) {
			$ = cheerio.load(body);
			var csrfToken = $('input[name="_AntiCsrfToken"]').attr('value');
			console.log('\x1b[1;33m', "[" + taskNum + "] - Got Registration Page");
			createAccount(taskNum, proxy, request, csrfToken)
		} else {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				performTask(taskNum, proxy);
			}, retryDelay)
			return;
		}
	});
}

function createAccount(taskNum, proxy, request, csrfToken) {
	var faker = require('faker');
	var firstName = faker.fake("{{name.firstName}}");
	var lastName = faker.fake("{{name.lastName}}");
	var rand = Math.floor(Math.random() * 90000) + 10000; // For Email
	var email = firstName.toLowerCase() + rand + "@" + catchall;

	request({
		url: 'https://www.nakedcph.com/auth/submit',
		method: 'POST',
		headers: {
			'x-requested-with': 'XMLHttpRequest',
			'User-Agent': userAgent,
			'x-anticsrftoken': csrfToken
		},
		proxy: proxy,
		formData: {
			'_AntiCsrfToken': csrfToken,
			'firstName': firstName,
			'email': email,
			'password': password,
			'action': 'register'
		},
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				createAccount(taskNum, proxy2, request, csrfToken)
			}, retryDelay)
			return;
		}
		$ = cheerio.load(body);
		if (response.statusCode == 200) {
			console.log('\x1b[1;33m', "[" + taskNum + "] - Account Created");
			console.log('\x1b[1;35m', "[" + taskNum + "] - Email: " + email)
			console.log('\x1b[1;35m', "[" + taskNum + "] - Password: yeayea u already know")
			getRaffleToken(taskNum, proxy, request, email, firstName, lastName);
		} else {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				createAccount(taskNum, proxy2, request, csrfToken)
			}, retryDelay)
			return;
		}
	});
}

function getRaffleToken(taskNum, proxy, request, email, firstName, lastName) {
	var request = require('request');
	request({
		url: 'https://nakedcph.typeform.com/app/form/result/token/PABKmQ/default',
		method: 'get',
		headers: {
			'User-Agent': userAgent,
		},
		proxy: proxy,
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				getRaffleToken(taskNum, proxy2, request, email, firstName, lastName)
			}, retryDelay)
			return;
		}
		if (response.statusCode == 200) {
			console.log('\x1b[1;33m', "Entry Token: " + body);
			submitRaffle(taskNum, proxy, request, email, firstName, lastName, body)
		} else {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				getRaffleToken(taskNum, proxy2, request, email, firstName, lastName)
			}, retryDelay)
			return;
		}
	});
}

function submitRaffle(taskNum, proxy, request, email, firstName, lastName, raffleToken) {
	request({
		url: 'https://nakedcph.typeform.com/app/form/submit/PABKmQ',
		method: 'POST',
		headers: {
			'x-requested-with': 'XMLHttpRequest',
			'User-Agent': userAgent,
		},
		proxy: proxy,
		formData: {
			'form[language]': 'en',
			'form[textfield:FhF0pPr4gdHO]': firstName,
			'form[textfield:HjWDPHuvQXDW]': lastName,
			'form[email:xS8rv0ZpuFDg]': email,
			'form[dropdown:PzvBvJMvRXrd]': 'United Kingdom',
			'form[landed_at]': (Date.now() / 1000).toFixed(),
			'form[token]': raffleToken

		},
	}, function (error, response, body) {
		if (error) {
			var proxy2 = getRandomProxy();

			setTimeout(function () {
				submitRaffle(taskNum, proxy2, request, email, firstName, lastName, raffleToken)
			}, retryDelay)
			return;
		}
		$ = cheerio.load(body);
		if (response.statusCode == 200) {
			if (JSON.parse(body).message == "success") {
				console.log('\x1b[1;32m', "[" + taskNum + "] - Raffle entry submitted");
				tasksComplete++;
				console.log('\x1b[1;32m', "[" + taskNum + "] - " + tasksComplete + " Entries submitted.")
			}
		} else {
			var proxy2 = getRandomProxy();
			setTimeout(function () {
				submitRaffle(taskNum, proxy2, request, email, firstName, lastName, raffleToken)
			}, retryDelay)
			return;
		}
	});
}

function getRandomProxy() {
	if (proxies[0] != '') {
		var proxy = proxies[Math.floor(Math.random() * proxies.length)].split(':');
		var proxyAuth = proxy[2] + ":" + proxy[3];
		var proxyHost = proxy[0] + ":" + proxy[1];
		if (proxy.length == 2) {
			proxy = "http://" + proxyHost;
			return (proxy);
		} else {
			proxy = "http://" + proxyAuth.trimLeft().trimRight().toString() + "@" + proxyHost;
			return (proxy);
		}
	} else {
		return '';
	}
}
