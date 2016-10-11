var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// init bluetoothctl environment
const bluetoothctlMiniCompatibleVerion = 5.37;
function init() {
    // unblock the bluetooth
    exec("rfkill unblock bluetooth", (error, stdout, stderr) => {
        if(error) {
            console.error(error);
            return false;
        }
        if(stderr) {
            console.error(stderr);
            return false;
        }
    });

    // check the bluetoothctl version, should be greater than bluetoothctlMiniCompatibleVerion
    exec("bluetoothctl --version", (error, stdout, stderr) => {
        if(error) {
            console.error(error);
            return false;
        }
        if(stderr) {
            console.error(stderr);
            return false;
        }
        if(parseFloat(stdout) < bluetoothctlMiniCompatibleVerion) {
            console.error("bluetoothctl version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
            return false;
        }
    });
    return true;
}

function interact(action, callback) {
	if(!action && !callback) { return; }
	if(!action) {
		callback(); 
		return;
	}

	var ps = spawn("bluetoothctl"),
        result = "", err = "";
    action(ps);
    setTimeout(function() {
        ps.stdin.write("exit\n");
    }, 500);

    // get all stdout and stderr output
    ps.stdout.on("data", (data) => {
        result += data;
    });
    ps.stderr.on("data", (data) => {
        result += data;
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
	}, callback);
}

module.exports = {
	run: run,
	interact: interact,
	init: init
};