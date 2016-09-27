var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
var readline = require('readline');


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

    bluetoothctl.stderr.on("data", (data) => {
        console.error(`${data}`);
    });

    // [bluetoothctl] power on
    bluetoothctl.stdin.write("power on\n");
    // [bluetoothctl] scan on
    bluetoothctl.stdin.write("scan on\n");

    setTimeout(function(){
        // [bluetoothctl] scan off
        bluetoothctl.stdin.write("scan off\n");
        
    }, timeout || 5000);

    // detect the output line
    var deviceFound = false;
    readline.createInterface({
        input : bluetoothctl.stdout,
        terminal : false
    }).on('line', function(line) {
        line = line.trim();
        var macAddress = getSensorTagMac(line);
        if(macAddress){
            bluetoothctl.stdin.write("info " + macAddress + "\n");
            return;
        }
    });
    // [bluetoothctl] devices
    bluetoothctl.stdin.write("devices");

    // [bluetoothctl] exit
    bluetoothctl.stdin.write("exit\n");
}

var deviceNameReg = /^Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+)$/g;
function getSensorTagMac(line) {
    var match = deviceNameReg.exec(line);
    if(match && match[3] === "CC2650 SensorTag") {
        return match[1];
    }
}

var deviceNameReg = /Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+)$/g;
var deviceGAP = /Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+?\:)[ ]([0-9A-Fa-f\-]+)$/g;
var deviceMan = /Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]ManufacturerData[ ]Key:[ ](0x[0-9A-Fa-f]+)$/g;
function resolveBluetoothctlLine(line) {
    // this is not a valid bluetoothctl device discovery line
    if((line.indexOf("NEW") < 0 && line.indexOf("CHG") < 0)) { return; }
    // name line
    // e.g. Device 24:71:89:C0:C1:06 CC2650 SensorTag
    var match = deviceNameReg.exec(line);
    if(match) {  // <== Device name
        var name = match[3];
        if(name === "CC2650 SensorTag") {
            return {
                mac: match[1],
                name: name
            };
        }else { return; }
    }

    // manufacturer line
    // Device 24:71:89:C0:C1:06 ManufacturerData Key: 0x000d
    match = deviceMan.exec(line);
    if(match) {
        var manufacturerData = match[3];
        if(manufacturerData.toLower() === "0x000d") {
            return {
                mac: match[1],
                manufacturer: manufacturerData
            };
        }else {
            return;
        }
    }
}

function showDevice(device) {
    console.log(device.mac + "       " + device.name + "         " + device.manufacturer);
}

var mapping = {};
function onDiscovery(bleObj) {
    var mac = bleObj.mac;
    var storeObj = mapping[mac] || { mac: mac };
    if(bleObj.name) { storeObj.name = bleObj.name; }
    if(bleObj.manufacturer) { storeObj.manufacturer = bleObj.manufacturer; }
    mapping[mac] = storeObj;
    if(storeObj.name && storeObj.manufacturer) {
        showDevice(storeObj);
    }
}

(function() {

    startScan(5000, onDiscovery);
})()
