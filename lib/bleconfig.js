const samplePath = "/usr/share/azureiotgatewaysdk/samples/ble_gateway_hl/";
const sampleBinary = "ble_gateway_hl";
const sampleConfig = "ble_gateway.json"

function createConfig(isLocal, callback) {
	console.log("deploy start");
	setTimeout(function() {
		console.log("deploy finish");
		callback(sampleConfig);
	}, 5000);
}

module.exports = {
	create: createConfig,
	samplePath: samplePath,
	sampleBinary: sampleBinary,
	sampleConfig: sampleConfig
};