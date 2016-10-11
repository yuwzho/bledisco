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
        bluetoothctl.run(["connect " + mac, "disconnect " + mac], (stdout, error) => {
        	if(error) {
        		error(error);
        		return;
        	}

        	if(stdout.indexOf("Connection successful") >= 0) {
        		console.log(mac + " can be successfully connected.");
        	}else {
        		error(mac + " cannot be connected now.");
        	}
        });
    }).catch(error);

    function error(err) {
    	console.error(err.message);
    	process.exit();
    }

    function valid(mac) {
    	return /^([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2}$/.test(mac);
    }

    function usage() {
    	console.log("usage: node testconnect.js <mac address>")
    }
})(process.argv[2]);