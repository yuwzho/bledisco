# bledisco - bluetooth device discovery

## What will be implemented
This lib implements two functions:

* **`sensortagdisco`** - Discovery SensorTag device. The SensorTag should be detectable.
    
    **Usage**: 
    ``` bash
    node sensortagdisco
    ```

    **Output**:
    It will use 10 seconds to discovery bluetooth device arround, and show information for all detected sensortag device.
    ``` bash
    Mac Address         Device Description       Device Type
    AA:BB:CC:DD:EE:FF	sensortag 				 UUID
    ```

* **`testconnect(mac_address)`** - Connect and disconnect to the device. Test the connectivity of this device.

    TBD

## How to implement

### `sensortagdisco.js`
It should contains two modules:

1. Scan on the BLE device - Use the hci child process on linux to detect BLE device
2. A callback method on device discovery - It is a filter to determine whether the device is a sensortag device, if so, show this device. 

### `testconnect.js`

TBD