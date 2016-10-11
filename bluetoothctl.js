var spawn = require('child_process').spawn;

function interact(action, callback) {
	console.log("============\r\n run bluetoothctl\r\n#######");

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
	run: run,
	interact: interact
};