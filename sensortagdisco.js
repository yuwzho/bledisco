var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
var util = require('util');


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
				throw new Error("bluetoothclt version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
			}
		});
	}catch(err){
		console.error(err.message);
		return;
	}
	
	// using bluetoothclt to discovery the device
	// var bluetoothclt = spawn("bluetoothclt");
}

(function() {
	startScan(10000, function(){

	});
})()