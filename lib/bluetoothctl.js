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
    cli(name, [{
        operation: "power on"
    }, {
        operation: "scan on"
    }, {
        operation: "scan off",
        timeout: timeout
    }, {
        operation: "exit",
        timeout: 500
    }], (stdout, stderr) => {
        callback(stderr)
    });
}

function getDevices(callback) {
    cli(name, [{
        operation: "devices"
    }, {
        operation: "exit",
        timeout: 500
    }], callback);
}

function infoDevice(mac, callback) {
    cli(name, [{
        operation: "info " + mac
    }, {
        operation: "exit",
        timeout: 500
    }], callback);
}

function connectDevice(mac, callback) {
    cli(name, [{
        operation: "power on"
    }, {
        operation: "connect " + mac
    }, {
        operation: "disconnect " + mac,
        timeout: 1500
    }, {
        operation: "exit",
        timeout: 500
    }], callback);
}

module.exports = {
    init: init,
    scan: scanDevice,
    devices: getDevices,
    info: infoDevice,
    connect: connectDevice
};