var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
var rl = require('readline');


const bluetoothctlMiniCompatibleVerion = 5.37;
// start to scan the bluetooth deive, once detect a device, call callback method to handle the device
// @param timeout after timeout milliseconds, terminate the function itself
// @param callback function to handle once a device is found 
function startScan(timeout, callback) {
    // unblock the bluetooth
    exec("rfkill unblock bluetooth", {encoding: 'utf8'});
    // check the bluetoothctl version, should be greater than bluetoothctlMiniCompatibleVerion
    try{
        exec("bluetoothctl --version", (error, stdout, stderr) => {
            if(error) {
                throw error;
            }
            if(stderr) {
                throw new Error(stderr);
            }
            if(parseFloat(stdout) < bluetoothctlMiniCompatibleVerion) {
                throw new Error("bluetoothctl version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
            }
        });
    }catch(err){
        console.error(err.message);
        return;
    }
    
    // using bluetoothctl to discovery the device
    var bluetoothctl = spawn("bluetoothctl");
    // [bluetoothctl] power on
    bluetoothctl.stdin.write("power on\n");
    // [bluetoothctl] scan on
    bluetoothctl.stdin.write("scan on\n");
    bluetoothctl.stdout.on("data", (data) => {
    	callback(data);
    });
    bluetoothctl.stderr.on("data", (data) => {
    	console.error(`${data}`);
    });
    setTimeout(function(){
    	// [bluetoothctl] scan off
    	bluetoothctl.stdin.write("scan off\n");
    	// [bluetoothctl] exit
    	bluetoothctl.stdin.write("exit\n");
    }, timeout || 10000);
}

function onDiscovery(stream) {
	var rl = readline.createInterface({
	    input: stream
	});

	rl.on('line', function(line){
		console.log(line);
	});
}

(function() {

    startScan(10000, onDiscovery);
})()
