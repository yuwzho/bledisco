---
Author: yuwzho
Date: 2016/10/12
---

> Already merged into repo: [iot-hub-c-intel-nuc-gateway-getting-started](https://github.com/Azure-Samples/iot-hub-c-intel-nuc-gateway-getting-started). 

# bledisco - bluetooth device discovery

## What will be implemented
This lib implements two functions:

* **`sensortagdisco`** - Discovery SensorTag device. The SensorTag should be detectable.
    
    **Usage**: 
    ``` bash
    node sensortagdisco.js
    ```

    <a id="disco-output-sample"></a>**Output**:
    It will use 5 seconds to discovery bluetooth device arround, and show information for all detected sensortag device.
    ``` bash
    Mac Address                Device Name        		Paired        	Connected
    AA:BB:CC:DD:EE:FF          CC2650 SensorTag         No 		        No
    ```

* **`testconnect(mac_address)`** - Connect and disconnect to the device. Test the connectivity of this device.

    **Ussage**:
    ``` bash
    node testconnect.js <mac address>
    ```

    <a id="connect-output-sample"></a>**Output**:
    It will try to connect the mac address, if the first time fails, it will try to scan bluetooth devices, then try to connect the devices again.
    ``` bash
    AA:BB:CC:DD:EE:FF can be successfully connected.
    ```
    or
    ``` bash
    AA:BB:CC:DD:EE:FF cannot be connected now.
    ```

## How to implement

### `sensortagdisco.js`
It should contains the following steps:

1. Init BLE environment - Unblock bluetooth and check bluetootchctl version
2. Scan on the BLE device - Use the bluetootchctl process on linux to scan BLE device
3. Find all devices - Use bluetootchctl to list all avaliable bluetootch devices
4. Get information for each device - There is a filter to determine whether the device is a sensortag device, if so, show this device as [sample output](#disco-output-sample) shows.

### `testconnect.js`

It will contain the following steps and show output as [sample output](#connect-output-sample).

1. Init BLE environment - Unblock bluetooth and check bluetootchctl version
2. Connect and disconnect the device - Use bluetoothctl to connect and disconnect the mac address
3. Scan on the BLE device if connect failed, and then re-test connect - Use the bluetootchctl process on linux to scan BLE device and then retry step2. 
