var bluetoothctl = require("./bluetoothctl.js");

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
        bluetoothctl.run(["info " + deviceName.mac], (deviceInfo, err) => { 
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
    bluetoothctl.run(["devices"], (devices, err) => {
        if(err) {
            console.error(err);
            return;
        }
        eachLine(devices, filter);
    });
}

// turn on the scan and scan the BLE devices
function scanDevice(timeout, callback) {
    bluetoothctl.interact((ps) => {
        ps.stdin.write("power on\n");
        ps.stdin.write("scan on\n");
        setTimeout(function() {
            ps.stdin.write("scan off\n");
            ps.stdin.write("exit\n");
        }, timeout);
    }, (stdout, stderr) => {
        callback(stderr)
    });
}

(function(timeout) {
    if(!bluetoothctl.init()){ return; }
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
