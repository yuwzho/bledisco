var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
const bluetoothctlMiniCompatibleVerion = 5.37;

function init(callback) {
    exec("rfkill unblock bluetooth", (error, stdout, stderr) => {
        if(error) {
            callback(stdout, error);
        }else if(stderr) {
            callback(stdout, stderr);
        }
    });
    exec("bluetoothctl --version", (error, stdout, stderr) => {
        if(error) {
            callback(stdout, error);
        }else if(stderr) {
            callback(stdout, stderr);
        }else if(parseFloat(stdout) < bluetoothctlMiniCompatibleVerion) {
            callback(stdout, "bluetoothctl version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
        }else {
            callback(stdout);
        }
    });
}

function interact(action, callback) {
	if(!action && !callback) { return; }
	if(!action) {
		callback(); 
		return;
	}

	var ps = spawn("bluetoothctl"),
        result = "", err = "";
	try{
		action(ps);
	}catch(e) {
		console.error("Error occurs when incteracting with bluetoothctl: " + e.message);
	}

    // get all stdout and stderr output
    ps.stdout.on("data", (data) => {
        result += data;
    });
    ps.stderr.on("data", (data) => {
        err += data;
    });

	ps.on("error", (error) => {
		if(!callback) { return; }
		callback(result, error);
	});
    // callback when finish child process
    ps.on("close", (code) => {
    	if(!callback) { return; }
        if(err === "") {
            callback(result);
        }else{
            callback(result, err);
        }        
    });
}

function run(interacts, callback) {
	interact((ps) => {
		interacts = interacts || [];
	    for (var i = 0; i < interacts.length; i++) {
	        ps.stdin.write(interacts[i] + "\n");
	    }
	    setTimeout(function() {
        	ps.stdin.write("exit\n");
    	}, 500);
	}, callback);
}

module.exports = {
    init: init,
	run: run,
	interact: interact
};