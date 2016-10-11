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

    var deviceName = resolveDeviceName(line);
    if(deviceName){
        bluetoothctl.run(["info " + deviceName.mac], (deviceInfo, err) => { 
            if(err) {
                console.error(err);
                return;
            }
            var device = resolveDeviceInfo(deviceInfo);
            // alias should case sensetive equal to CC2650 SensorTag, and ManufacturerData Key should be 0x0d
            if(device["Alias"] === "CC2650 SensorTag" && /^0x[0]*d$/.test(device["ManufacturerData Key"].toLowerCase())) {
                show(device); 
            }
        });
    }
}

function show(device){
    function rpad(str, size) {
      if (str.length >= size) {
        return str;
      }
      return str + '                                                                                '.slice(0, size - str.length);
    }
    console.log(
        rpad(device["Mac"], 24),
        rpad(device["Name"], 24),
        rpad(device["Connected"], 16),
        rpad(device["Paired"], 12),
        rpad(device["UUID"], 44)
    );
}

function getDevices() {
    bluetoothctl.run(["devices"], (devices, err) => {
        if(err) {
            console.error(err);
            return;
        }

        // show title line first
        show({
            "Mac": "Mac Address",
            "Name": "Device Name",
            "Alias": "Device Alias",
            "Blocked": "Blocked",
            "Connected": "Connected",
            "LegacyPairing": "LegacyPairing",
            "UUID": "UUID",
            "Paired": "Paired",
            "Trusted": "Trusted",
            "ManufacturerData Key":"ManufacturerData Key",
            "ManufacturerData Value": "ManufacturerData Value"
        });
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
