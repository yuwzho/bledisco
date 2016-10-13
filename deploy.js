var util = require("./lib/util.js");
var bleConfig = require("./lib/bleconfig.js");

function usage() {
	console.log("usage: node deploy.js [option]");
	console.log("option:");
	console.log(util.rpad("-l, --local", 16), "create or update" + bleConfig.sampleConfig + " at current folder");
	console.log(util.rpad("-g, --global", 16), "update " + bleConfig.samplePath + bleConfig.sampleConfig);
}

function parseArgv(argv) {
	argv = (argv + "").toLowerCase().trim();

	if (argv === "-l" || argv === "--local") {
		return true;
	} else if (argv === "-g" || argv === "--global") {
		return false;
	}
}

(function(argv) {
	var isLocal = parseArgv(argv || "-l");
	if (isLocal === undefined) {
		usage();
		return;
	}

	bleConfig.create(isLocal, (stdout, error) => {
		if (error) {
			util.errorHandler(error);
			return;
		}

		console.log("ble_gateway_hl successfully created. To run the sample, use following command:");
		console.log("'cd " + bleConfig.samplePath + "; ./" + bleConfig.sampleBinary + " " + bleConfig.sampleConfig + "'");
	});
})(process.argv[2]);