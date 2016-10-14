var spawn = require("child_process").spawn;
var fs = require("fs");
var util = require("./lib/util.js");
var bleConfig = require("./lib/bleconfig.js");

function run(configPath) {
	// change to directory
	process.chdir(bleConfig.samplePath);
	// run sample
	var ps = spawn(bleConfig.sampleBinary + " " + configPath);
	ps.stdout.on("data", (data) => {
		console.log("" + data);
	})
	ps.stderr.on("data", util.errorHandler);
	ps.on("error", util.errorHandler);
}

(function() {
	// Step1. check binary exist
	new Promise((resolve, reject) => {
			// check exits
			var binaryPath = bleConfig.samplePath + bleConfig.sampleBinary;
			fs.exists(binaryPath, (exists) => {
				if (!exists) {
					reject(binaryPath + " not found");
				} else {
					resolve();
				}
			});
		})
		// Step2. deploy device
		.then(() => {
			return new Promise((resolve, reject) => {
				bleConfig.create(true, (stdout, error) => {
					if (error) {
						reject(error);
					} else {
						resolve(stdout);
					}
				})
			});
		})
		// Step3. run sample
		.then(run).catch(util.errorHandler);
})();