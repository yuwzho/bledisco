var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
var readline = require('readline');

const bluetoothctlMiniCompatibleVerion = 5.37;

function run(cmd, interact, callback) {
    var ps = spawn(cmd),
        result = "";
    interact = interact || [];
    for (var i = 0; i < interact.length; i++) {
        ps.stdin.write(interact[i] + "\n")
    }
    setTimeout(function() {
        ps.stdin.write("exit\n");
    }, 500);
    ps.stdout.on("data", (data) => {
        result += data;
    });
    ps.on("close", (code) => {
        callback(result);        
    });
}

function eachLine(content, callback) {
    var lines = ("" + content).replace(/\r\n/g, "\n").split("\n+");
    for (var i = 0; i < lines.length; i++) {
        callback(lines[i]);
    }
}

function filter(line) {
    function resolveDeviceName(line) {
        var reg = /^Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+)$/gm;
        var match = reg.exec(line);
        if(match) {
            return {
                mac: match[1],
                name: match[3]
            };
        }
    }

    function resolveDeviceInfo(content) {
        return content;
    }

    function show(device){
        console.log("=========\n");
        console.log(device);
        console.log("#########\n");
    }

    var deviceName = resolveDeviceName(line);
    if(deviceName){
        run("bluetoothctl", ["info " + deviceName.mac], (deviceInfo) => { 
            // if.....filter
            var device = resolveDeviceInfo(deviceInfo);
            show(device); 
        });
    }
}

function getDevices() {
    run("bluetoothctl", ["devices"], (devices) => {
        eachLine(devices, filter);
    });
}

// turn on the scan and scan the BLE devices
function scanDevice(timeout) {
    try{
        var bluetoothctl = spawn("bluetoothctl");
        bluetoothctl.stdin.write("power on\n");
        bluetoothctl.stdin.write("scan on\n");
        setTimeout(function() {
            bluetoothctl.stdin.write("scan off\n");
            bluetoothctl.stdin.write("exit\n");
        }, timeout);
    }catch(err) {
        console.log(err);
        return false;
    }
    return true;
}

// unblock the bluetooth and check the bluetoothctl version
function initEnv() {
    // unblock the bluetooth
    exec("rfkill unblock bluetooth", {encoding: 'utf8'});
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

(function(timeout) {
    if(!initEnv()){ return; }
    if(!scanDevice(timeout || 5000)) { return; }
    getDevices();
})()
