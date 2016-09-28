var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;
var readline = require('readline');


const bluetoothctlMiniCompatibleVerion = 5.37;

function getDevices() {
    // using bluetoothctl to discovery the device
    var bluetoothctl = spawn("bluetoothctl");
    var result = '';
    bluetoothctl.stdout.on('data', function (data) {
        // console.log('stdout: ' + data);
        result += data;
    });
    bluetoothctl.on('close', function (code) {
        console.log('---------------------\n' + result + '\n###############\n');
    })

    setTimeout(function(){
        console.log('Sending stdin to terminal');
        bluetoothctl.stdin.write('power on\n');
    }, 1000);

    setTimeout(function(){
        bluetoothctl.stdin.write('scan on\n');
    }, 1000);

    setTimeout(function(){
        // [bluetoothctl] scan off
        bluetoothctl.stdin.write('scan off\n');
        console.log('Ending terminal session');
    }, timeout || 5000);

    setTimeout(function(){
        bluetoothctl.stdin.write('exit\n');
    }, 5000);
}

function getDeviceInfo() {
// using bluetoothctl to discovery the device
    var bluetoothctl = spawn("bluetoothctl");
var result = '';
    bluetoothctl.stdout.on('data', function (data) {
        // console.log('stdout: ' + data);
        result += data;
    });
    bluetoothctl.on('close', function (code) {
        console.log('---------------------\n' + result + '\n###############\n');
    })

    setTimeout(function(){
        console.log('Sending stdin to terminal');
        bluetoothctl.stdin.write('info 50:98:1C:CD:A9:29\n');
    }, 1000);

    setTimeout(function(){
        bluetoothctl.stdin.write('exit\n');
    }, 5000);
}

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
    
    
    // create promise to get the interactive result
    function promiseCreator() {
        return new Promise(function(resolve, reject) {
            bluetoothctl.stdout.on("data", (data) => { resolve(data); } );
        });
    }
    
    // var promise = promiseCreator();

    getDevices();
    getDeviceInfo();
    // Promise.all(promise).then(function(){
    //     var interactivePromise = promiseCreator();
    //     // [bluetoothctl] devices
    //     bluetoothctl.stdin.write("devices\n");

    //     interactivePromise.then(function (data){
    //         // foreach device get information
    //         var deviceLines = splitByLine(data);
    //         deviceLines.forEach(function(deviceLine) {
    //         // console.log(deviceLine);
    //             var deviceBrief = resolveDeviceLine(deviceLine);
    //             if(deviceBrief && deviceBrief.name === "CC2650 SensorTag") {
    //                 bluetoothctl.stdin.write("info " + deviceBrief.mac);
    //             }
    //         });
    //     }).then(function (data) {
    //         callback(data);
    //     }).then(function(data){
    //         // [bluetoothctl] exit
    //         bluetoothctl.stdin.write("exit\n");
    //     }); 
    // });
}

var deviceNameReg = /^Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+)$/g;
function resolveDeviceLine(line) {
    var match = deviceNameReg.exec(line);
    if(match) {
        return {
            mac: match[1],
            name: match[3]
        };
    }
}

function splitByLine(data) {
    var content = "" + data;
    return content.replace(/\r\n/g, "\n").split("\n+");
}

var deviceMacReg = /^Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})$/g;
var deviceGAP = /Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]([^\:]+?\:)[ ]([0-9A-Fa-f\-]+)$/g;
var deviceMan = /Device[ ](([0-9A-Fa-f]{2}\:){5}[0-9A-Fa-f]{2})[ ]ManufacturerData[ ]Key:[ ](0x[0-9A-Fa-f]+)$/g;
var mapping = {};
function onDiscovery(bleObj) {
    // this is not a valid bluetoothctl device discovery line
    var infoLines = splitByLine(data);
    if(infoLines || infoLines.length === 0) { return; }
    // first line must be mac line: Device 24:71:89:C0:C1:06
    var match = deviceMacReg.exec(infoLines[0]);
    if(!match) { return; }
    infoLines.forEach(function(line){
        console.log(line);
    });

    // var match = deviceNameReg.exec(line);
    // if(match) {  // <== Device name
    //     var name = match[3];
    //     if(name === "CC2650 SensorTag") {
    //         return {
    //             mac: match[1],
    //             name: name
    //         };
    //     }else { return; }
    // }

    // // manufacturer line
    // // Device 24:71:89:C0:C1:06 ManufacturerData Key: 0x000d
    // match = deviceMan.exec(line);
    // if(match) {
    //     var manufacturerData = match[3];
    //     if(manufacturerData.toLower() === "0x000d") {
    //         return {
    //             mac: match[1],
    //             manufacturer: manufacturerData
    //         };
    //     }else {
    //         return;
    //     }
    // }
}

(function() {
    startScan(5000, onDiscovery);
})()
