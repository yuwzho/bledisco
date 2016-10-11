var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

// init bluetoothctl environment
const bluetoothctlMiniCompatibleVerion = 5.37;
function init() {
	var wellEnv = true;
    // unblock the bluetooth
    try{
    	ensureExec("rfkill unblock bluetooth");
    	ensureExec("bluetoothctl --version", (stdout) => {
    		if(parseFloat(stdout) < bluetoothctlMiniCompatibleVerion) {
            	throw("bluetoothctl version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
        	}
    	});
    }catch(err){
    	console.error(err);
    	return false;
    }
    return true;
}

function ensureExec(cmd, callback) {
	if(!cmd) { return; }
	exec(cmd, (error, stdout, stderr) => {
		if(error) {
			throw error;
		}
		if(stderr) {
			throw (stderr);
		}

		if(stdout && callback) {
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
    action(ps);

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
	    setTimeout(function() {
        	ps.stdin.write("exit\n");
    	}, 500);
	}, callback);
}

module.exports = {
	run: run,
	interact: interact,
	init: init
};