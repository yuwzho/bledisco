var bluetoothctl = require("./bluetoothctl.js");

function errorHandler(err) {
    console.error(err.message);
    process.exit();
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
        if (match) {
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
            if (match) {
                device[match[1]] = device[match[1]] || match[2];
                return;
            }
            match = deviceReg.exec(line);
            if (match) {
                device["Mac"] = match[1];
                return;
            }
        });
        return device;
    }

    function isSensorTagBLE(device) {
        // alias should case sensetive equal to CC2650 SensorTag, and ManufacturerData Key should be 0x0d
        return device["Alias"].indexOf("SensorTag") >= 0 && /^0x[0]*d$/.test(device["ManufacturerData Key"].toLowerCase()) && device["UUID"].indexOf("0000-1000-8000-00805f9b34fb") >= 0;
    }

    var deviceName = resolveDeviceName(line);
    if (deviceName) {
        bluetoothctl.run(["info " + deviceName.mac], (deviceInfo, err) => {
            if (err) {
                errorHandler(err);
                return;
            }
            var device = resolveDeviceInfo(deviceInfo);
            if (isSensorTagBLE(device)) {
                show(device);
            }
        });
    }
}

function show(device) {
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
        rpad(device["Paired"], 12)
    );
}

function getDevices() {
    bluetoothctl.run(["devices"], (devices, err) => {
        if (err) {
            errorHandler(err);
            return;
        }

        // show title line
        // add all information into the title part, let show() to choose which to show up.
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
            "ManufacturerData Key": "ManufacturerData Key",
            "ManufacturerData Value": "ManufacturerData Value"
        });
        eachLine(devices, filter);
    });
}

(function(timeout) {
    // Step1. init the bluetoothctl environment
    var initPromise = new Promise((resolve, reject) => {
        bluetoothctl.init((stdout, error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
    initPromise.catch(errorHandler);
    // Step2. Scan 5 seconds to look for BLE devices
    var scanPromise = initPromise.then(() => {
        return new Promise((resolve, reject) => {
            bluetoothctl.scan(timeout || 5000, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            })
        });
    });

    // Step3. Get BLE devices information and show it out
    scanPromise.then(() => {
        getDevices();
    }).catch(errorHandler);
})()