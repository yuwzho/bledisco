var util = require("./lib/util.js");
var bleConfig = require("./lib/bleconfig.js");

function run(configPath) {
	console.log("run start");
	setTimeout(function() {
		console.log("run finish");
	}, 10000);
}

(function() {
	// Step1. deploy device
	var promise = new Promise((resolve, reject) => {
		bleConfig.create(true, (stdout, error) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
	// Step2. run sample
	promise.then(run).catch(util.errorHandler);
})();