var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

const bluetoothctlMiniCompatibleVerion = 5.37;

function run(cmd, interact, callback) {
    var ps = spawn(cmd),
        result = "", err = "";
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
    ps.stderr.on("data", (data) => {
        result += data;
    });
    ps.on("close", (code) => {
        if(err === "") {
            callback(result);
        }else{
            callback(result, err);
        }        
    });
}

function eachLine(content, callback) {
    var lines = ("" + content).replace(/\r\n/g, "\n").split("\n");
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
        var device = {};
        eachLine(content, (line) => {
            var deviceReg = /^Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})$/gm;
            var infoReg = /^\s+(.+)?:[ ](.+)$/gm;
            var match = infoReg.exec(line);
            if(match) {
                device[match[1]] = match[2];
                return;
            }
            match = deviceReg.exec(line);
            if(match) {
                device["Mac"] = match[1];
                return;
            }
        });
        return device;
    }

    function show(device){
        console.log(JSON.stringify(device));
    }

    var deviceName = resolveDeviceName(line);
    if(deviceName){
        run("bluetoothctl", ["info " + deviceName.mac], (deviceInfo, err) => { 
            if(err) {
                console.error(err);
                return;
            }
            var device = resolveDeviceInfo(deviceInfo);
            if(device["Alias"] === "CC2650 SensorTag" && /^0x[0]*d$/.test(device["ManufacturerData Key"].toLowerCase())) {
                show(device); 
            }
        });
    }
}

function getDevices() {
    run("bluetoothctl", ["devices"], (devices, err) => {
        if(err) {
            console.error(err);
            return;
        }
        eachLine(devices, filter);
    });
}

// turn on the scan and scan the BLE devices
function scanDevice(timeout, callback) {
    var err = "";
    var bluetoothctl = spawn("bluetoothctl");
    bluetoothctl.stdin.write("power on\n");
    bluetoothctl.stdin.write("scan on\n");
    setTimeout(function() {
        bluetoothctl.stdin.write("scan off\n");
        bluetoothctl.stdin.write("exit\n");
    }, timeout);
    bluetoothctl.stderr.on("data", (data) => {
        err += data;
    });
    bluetoothctl.on("close", (code) => {
        if(error !== ""){
            callback(err);
        }else{
            callback();
        }
    });
}

// unblock the bluetooth and check the bluetoothctl version
function initEnv() {
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

(function(timeout) {
    if(!initEnv()){ return; }
    scanDevice(timeout || 5000, (error) => {
        if(error) { 
            console.error(error);
            return;
        }
        setTimeout(function() {
            getDevices();
        }, 1000);
    });
})()
