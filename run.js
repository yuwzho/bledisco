var spawn = require("child_process").spawn;
var fs = require("fs");
var util = require("./lib/util.js");
var bleConfig = require("./lib/bleconfig.js");

function run(configPath) {
	// change to directory
	process.chdir(bleConfig.samplePath);
	// run sample
	var ps = spawn("./" + bleConfig.sampleBinary, [configPath]);
	// re-direct the Ctrl-C to this process
	process.on("SIGINT", ps.kill);
	ps.stdout.on("data", (data) => {
		console.log(`${data}`);
	});
	ps.stderr.on("data", (data) => {
		util.errorHandler(`${data}`)
	});
	ps.on("error", (data) => {
		util.errorHandler(`${data}`)
	});
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
				bleConfig.create({}, (stdout, error) => {
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