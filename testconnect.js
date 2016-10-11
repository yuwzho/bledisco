var bluetoothctl = require("./bluetoothctl.js");
(function(mac){
	// check whether the mac address is the correct one
	if(!valid(mac)){
		usage();
		return;
	}

	// Step1. init the bluetoothctl
	var promise = new Promise((resolve, reject) => {
        bluetoothctl.init((stdout, error) => {
            if(error) {
                reject(error);
            }else{
                resolve();
            }
        });
    });
    // Step2. connect to 
    promise.then(() => {
        bluetoothctl.interact((ps) => {
        	// ["connect " + mac, "disconnect " + mac]
	        ps.stdin.write("power on\n");
	        ps.stdin.write("connect " + mac + "\n");
	        setTimeout(() => {
	            ps.stdin.write("disconnect " + mac + "\n");
	            ps.stdin.write("exit\n");
	        }, 1500);
        }, (stdout, error) => {
        	if(error) {
        		errorHandler(error);
        		return;
        	}

        	if(stdout.indexOf("Connection successful") >= 0) {
        		console.log(mac + " can be successfully connected.");
        	}else {
        		errorHandler(mac + " cannot be connected now.");
        	}
        });
    }).catch(errorHandler);

    function errorHandler(err) {
    	console.error(err.message || err);
    	process.exit();
    }

    function valid(mac) {
    	return /^([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2}$/.test(mac);
    }

    function usage() {
    	console.log("usage: node testconnect.js <mac address>")
    }
})(process.argv[2]);