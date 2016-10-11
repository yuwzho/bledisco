var spawn = require('child_process').spawn;

function run(name, cmds, callback) {
	var ps = spawn(name),
		result = "",
		err = "";

	cmds = cmds || [{
		operation: "exit"
	}];
	var promise = Promise.resolve();
	for (var i = 0; i < cmds.length; i++) {
		var cmd = cmds[i];
		promise = promise.then(() => {
			return setTimeout(() => {
				ps.stdin.write(cmd.operation + "\n");
			}, cmd.timeout || 0);
		});
	}

	// get all stdout and stderr output
	ps.stdout.on("data", (data) => {
		result += data;
	});
	ps.stderr.on("data", (data) => {
		err += data;
	});

	ps.on("error", (error) => {
		if (!callback) {
			return;
		}
		callback(result, error);
	});
	// callback when finish child process
	ps.on("close", (code) => {
		if (!callback) {
			return;
		}
		if (err === "") {
			callback(result);
		} else {
			callback(result, err);
		}
	});
}

module.exports = run;