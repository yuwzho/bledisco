var path = require("path");
var fs = require("fs");
var util = require("./util.js");

const samplePath = "/usr/share/azureiotgatewaysdk/samples/ble_gateway_hl/";
const sampleBinary = "ble_gateway_hl";
const sampleConfig = "ble_gateway.json";
const configFile = "config.json";

function createConfig(isLocal, callback) {
	// TODO: should copy the raw file here
	var sampleFile = sampleConfig;
	try {
		var sample = JSON.parse(fs.readFileSync(sampleFile, "utf8"));
		var config = JSON.parse(fs.readFileSync(configFile, "utf8"));
	} catch (err) {
		util.errorHandler(err);
		return;
	}
	sample.modules.updateModule("IoTHub", (obj) => {
		obj.args.IoTHubName = config.IoTHubName;
		obj.args.IoTHubSuffix = config.IoTHubSuffix;
	});

	var sensortag = sample.modules.findModule("SensorTag");
	sample.modules.removeModules("SensorTag");
	sample.modules.updateModule("mapping", (obj) => {
		obj.args = [];
	});
	for (var i = 0; i < config.devices.length; i++) {
		var device = config.devices[i];
		sample.modules.updateModule("mapping", (obj) => {
			obj.args.push({
				macAddress: device.BLEMacAddress,
				deviceId: device.IoTDeviceId,
				deviceKey: device.IoTDeviceKey
			}
			);
		});

		var sensortagModule = sensortag.clone();
		// TODO: need cange the controller_index?
		sensortagModule.args.device_mac_address = device.BLEMacAddress;
		sample.modules.addModule(sensortagModule);
	}


	try {
		fs.writeFileSync(sampleFile, JSON.stringify(sample, null, 4));
	} catch (error) {
		util.errorHandler(error);
	}
}

Array.prototype.findModule = function (moduleName) {
	return this.find((item) => {
		return item["module name"] === moduleName;
	});
}

Array.prototype.updateModule = function (moduleName, callback) {
	for (var i = 0; i < this.length; i++) {
		var item = this[i];
		if (item["module name"] === moduleName) {
			if (callback) {
				callback(item);
			} return item;
		}
	}
}

Array.prototype.addModule = function (item) {
	this.splice(this.length, 0, item);
}

Array.prototype.removeModules = function (moduleName) {
	for (var i = this.length - 1; i >= 0; i--) {
		if (this[i]["module name"] === moduleName) {
			this.splice(i, 1);
		}
	}
}

Object.prototype.clone = function () {
	return JSON.parse(JSON.stringify(this));
}

module.exports = {
	create: createConfig,
	samplePath: samplePath,
	sampleBinary: sampleBinary,
	sampleConfig: sampleConfig
};