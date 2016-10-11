---
Author: yuwzho
Date: 2016/09/26
---

# bledisco - bluetooth device discovery

## What will be implemented
This lib implements two functions:

* **`sensortagdisco`** - Discovery SensorTag device. The SensorTag should be detectable.
    
    **Usage**: 
    ``` bash
    node sensortagdisco.js
    ```

    <a id="disco-output-sample"></a>**Output**:
    It will use 10 seconds to discovery bluetooth device arround, and show information for all detected sensortag device.
    ``` bash
    Mac Address                Device Name        		Paired        	Connected
    AA:BB:CC:DD:EE:FF          CC2650 SensorTag         No 		        No
    ```

* **`testconnect(mac_address)`** - Connect and disconnect to the device. Test the connectivity of this device.

    TBD

## How to implement

### `sensortagdisco.js`
It should contains two modules:

1. Scan on the BLE device - Use the hci child process on linux to detect BLE device
2. A callback method on device discovery - It is a filter to determine whether the device is a sensortag device, if so, show this device as [sample output](#output-sample) shows.

### `testconnect.js`

TBD
