# bledisco - bluetooth discovery

## What will be implemented
### getMac.js
Use a simple command to discovery the scannable bluetooth device, and show the device's `mac address`, `type`, `name` information.
Type the following command to start to scan bluetooth device, it will exit automatically after 10s.
Only Sensortag we need discovery, strictly pair three parameters **TBD**.
``` sh
> sensortagdisco scan
```

<a id="output-sample"></a>The output should like the following
``` sh
Mac Address                Device Type        Device Name        Description
AA:BB:CC:DD:EE:FF          SensorTag          SensorTag          SensorTag
```

### testConnect.js
> TBD

## How to implement
### getMac.js
This script should contain two method:

1. **discovery bluetooth device** - this method can be implemented in the following two ways: 
    - *Using child process to invoke the bluetoothctl shell* - using a command to parsing the output of bluetoothctl's output and aggregate them

2. **show the device information** - this method should be a callback method for the first discovery method, once a device discovered, it should print the information as the [output sample](#output-sample) shows.
