var bluetoothctl = require("./bluetoothctl.js");
var util = require("./util.js");

(function(mac) {
    // check whether the mac address is the correct one
    if (!valid(mac)) {
        usage();
        return;
    }

    // Step1. init the bluetoothctl
    var promise = new Promise((resolve, reject) => {
        bluetoothctl.init((stdout, error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

    // Step2. connect the device
    promise.then(() => {
        connect(mac, util.errorHandler, () => {
            new Promise((resolve, reject) => {
                // if failed, scan again
                bluetoothctl.scan(3000, (stderr) => {
                    if (stderr) {
                        reject(stderr);
                    } else {
                        resolve();
                    }
                });
            }).then(() => {
                connect(mac, util.errorHandler, () => {
                    util.errorHandler(mac + " cannot be connected now.")
                })
            }).catch(util.errorHandler);
        });
    }).catch(util.errorHandler);
})(process.argv[2]);

function connect(mac, errorCallback, failCallback) {
    function isConnected(message) {
        return message.indexOf("Connection successful") >= 0;
    }

    bluetoothctl.connect(mac, (stdout, error) => {
        if (error) {
            errorCallback(error);
        } else if (isConnected(stdout)) {
            console.log(mac + " can be successfully connected.");
        } else {
            failCallback();
        }
    });
}

function valid(mac) {
    return /^([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2}$/.test(mac);
}

function usage() {
    console.log("usage: node testconnect.js <mac address>")
}
