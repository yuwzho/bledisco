var exec = require("child_process").exec;
var cli = require("./interactcli.js");

const name = "bluetoothctl";
const bluetoothctlMiniCompatibleVerion = 5.37;

function init(callback) {
    exec("rfkill unblock bluetooth", (error, stdout, stderr) => {
        if (error) {
            callback(stdout, error);
        } else if (stderr) {
            callback(stdout, stderr);
        }
    });
    exec("bluetoothctl --version", (error, stdout, stderr) => {
        if (error) {
            callback(stdout, error);
        } else if (stderr) {
            callback(stdout, stderr);
        } else if (parseFloat(stdout) < bluetoothctlMiniCompatibleVerion) {
            callback(stdout, "bluetoothctl version should be greater than " + bluetoothctlMiniCompatibleVerion + ", current version is " + stdout);
        } else {
            callback(stdout);
        }
    });
}

// turn on the scan and scan the BLE devices
function scanDevice(timeout, callback) {
    cli.run(name, [{
        operation: "power on"
    }, {
        operation: "scan on"
    }, {
        operation: "scan off",
        timeout: timeout
    }, {
        operation: "exit"
    }], (stdout, stderr) => {
        callback(stderr)
    });
}

function getDevices(callback) {
    cli.run(name, [{
        operation: "devices"
    }, {
        operation: "exit"
    }], callback);
}

function infoDevice(mac, callback) {
    cli.run(name, [{
        operation: "devices"
    }, {
        operation: "exit"
    }], callback);
}

module.exports = {
    init: init,
    scan: scanDevice,
    devices: getDevices,
    info: infoDevice
};