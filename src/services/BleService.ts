// Web Bluetooth Low Energy (BLE) Integration Service for NutriPilot 2.0
// Standard GATT Specifications:
// Heart Rate Service: 0x180D (0000180d-0000-1000-8000-00805f9b34fb)
// Heart Rate Measurement: 0x2A37 (00002a37-0000-1000-8000-00805f9b34fb)
// Battery Service: 0x180F
// Battery Level: 0x2A19

export interface BleConnectionCallbacks {
  onHeartRateUpdate?: (bpm: number) => void;
  onBatteryUpdate?: (percentage: number) => void;
  onStepUpdate?: (stepsDelta: number) => void;
  onDisconnected?: () => void;
  onError?: (errorMsg: string) => void;
  onStatusChange?: (status: 'searching' | 'connecting' | 'connected' | 'disconnected') => void;
}

export class BleWearableService {
  private static activeDevice: any = null;
  private static activeServer: any = null;
  private static hrCharacteristic: any = null;
  private static rscCharacteristic: any = null;

  /**
   * Checks if the user's browser environment supports the Web Bluetooth API
   */
  public static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Prompts the browser's native Bluetooth dialog, scans for nearby devices,
   * connects to GATT server, and subscribes to Heart Rate & Battery notifications.
   */
  public static async scanAndConnect(callbacks: BleConnectionCallbacks): Promise<{
    deviceName: string;
    deviceId: string;
    hasHeartRateService: boolean;
    batteryLevel?: number;
  }> {
    if (!this.isSupported()) {
      const msg = 'Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera on Windows, Android, or macOS with Bluetooth enabled.';
      callbacks.onError?.(msg);
      throw new Error(msg);
    }

    try {
      callbacks.onStatusChange?.('searching');

      // Request device with Heart Rate, Battery, and Cadence optional services
      const navBle: any = (navigator as any).bluetooth;

      // Note: We use acceptAllDevices: true with optionalServices so users can select any smartwatch,
      // smart band (Apple Watch, Garmin, Fitbit, Mi Band, Polar, Samsung, or Generic BLE HRM/Pedometer).
      const device = await navBle.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate',
          0x180d,
          'battery_service',
          0x180f,
          'running_speed_and_cadence',
          0x1814,
          'generic_access',
          0x1800
        ]
      });

      this.activeDevice = device;
      const deviceName = device.name || 'Bluetooth Wearable Device';
      const deviceId = device.id;

      callbacks.onStatusChange?.('connecting');

      // Listen for unexpected disconnections
      device.addEventListener('gattserverdisconnected', () => {
        this.activeServer = null;
        this.hrCharacteristic = null;
        callbacks.onStatusChange?.('disconnected');
        callbacks.onDisconnected?.();
      });

      // Connect to the GATT Server on the device
      const server = await device.gatt.connect();
      this.activeServer = server;

      let hasHeartRateService = false;
      let initialBattery: number | undefined = undefined;

      // Attempt to discover Heart Rate Service (0x180D)
      try {
        const hrService = await server.getPrimaryService('heart_rate').catch(async () => {
          return await server.getPrimaryService(0x180d);
        });

        if (hrService) {
          const hrChar = await hrService.getCharacteristic('heart_rate_measurement').catch(async () => {
            return await hrService.getCharacteristic(0x2a37);
          });

          if (hrChar) {
            this.hrCharacteristic = hrChar;
            await hrChar.startNotifications();
            hrChar.addEventListener('characteristicvaluechanged', (event: any) => {
              const value = event.target.value as DataView;
              const bpm = this.parseHeartRate(value);
              callbacks.onHeartRateUpdate?.(bpm);
            });
            hasHeartRateService = true;
          }
        }
      } catch (hrErr) {
        console.warn('Heart rate service not accessible or not exposed by this device:', hrErr);
      }

      // Attempt to read Battery Service (0x180F)
      try {
        const batteryService = await server.getPrimaryService('battery_service').catch(async () => {
          return await server.getPrimaryService(0x180f);
        });

        if (batteryService) {
          const batteryChar = await batteryService.getCharacteristic('battery_level').catch(async () => {
            return await batteryService.getCharacteristic(0x2a19);
          });

          if (batteryChar) {
            const batteryData = await batteryChar.readValue();
            initialBattery = batteryData.getUint8(0);
            if (initialBattery !== undefined) {
              callbacks.onBatteryUpdate?.(initialBattery);
            }

            // Also listen to battery level changes if supported
            if (batteryChar.properties.notify) {
              await batteryChar.startNotifications();
              batteryChar.addEventListener('characteristicvaluechanged', (e: any) => {
                const val = e.target.value.getUint8(0);
                callbacks.onBatteryUpdate?.(val);
              });
            }
          }
        }
      } catch (batErr) {
        console.warn('Battery service not available on device:', batErr);
      }

      // Attempt to discover Running Speed & Cadence (RSC 0x1814) for steps
      try {
        const rscService = await server.getPrimaryService('running_speed_and_cadence').catch(async () => {
          return await server.getPrimaryService(0x1814);
        });

        if (rscService) {
          const rscChar = await rscService.getCharacteristic(0x2a53);
          if (rscChar) {
            this.rscCharacteristic = rscChar;
            await rscChar.startNotifications();
            rscChar.addEventListener('characteristicvaluechanged', (e: any) => {
              const val = e.target.value as DataView;
              const instantaneousCadence = val.getUint8(3);
              if (instantaneousCadence > 0) {
                callbacks.onStepUpdate?.(1);
              }
            });
          }
        }
      } catch (rscErr) {
        // Not all watches expose standard RSC profile; steps can also come from pedometer
      }

      callbacks.onStatusChange?.('connected');

      return {
        deviceName,
        deviceId,
        hasHeartRateService,
        batteryLevel: initialBattery
      };
    } catch (err: any) {
      this.activeDevice = null;
      this.activeServer = null;
      callbacks.onStatusChange?.('disconnected');

      let userMsg = err.message || 'Bluetooth connection failed.';
      if (err.name === 'NotFoundError') {
        userMsg = 'Bluetooth device search was cancelled or no device was selected.';
      } else if (err.name === 'SecurityError') {
        userMsg = 'Bluetooth access was denied by browser security settings.';
      } else if (err.name === 'NetworkError') {
        userMsg = 'Could not establish connection to Bluetooth GATT server. Ensure the watch is in pairing/discoverable range.';
      }

      callbacks.onError?.(userMsg);
      throw new Error(userMsg);
    }
  }

  /**
   * Parses standard Bluetooth SIG Heart Rate Measurement characteristic (0x2A37)
   */
  private static parseHeartRate(dataView: DataView): number {
    const flags = dataView.getUint8(0);
    const is16Bit = (flags & 0x01) !== 0;
    let bpm: number;

    if (is16Bit) {
      // 16-bit Heart Rate value (little-endian)
      bpm = dataView.getUint16(1, true);
    } else {
      // 8-bit Heart Rate value
      bpm = dataView.getUint8(1);
    }

    return bpm;
  }

  /**
   * Gracefully disconnects the current active Web Bluetooth device
   */
  public static disconnect(): void {
    try {
      if (this.activeDevice && this.activeDevice.gatt && this.activeDevice.gatt.connected) {
        this.activeDevice.gatt.disconnect();
      }
    } catch (err) {
      console.warn('Error during BLE disconnect:', err);
    } finally {
      this.activeDevice = null;
      this.activeServer = null;
      this.hrCharacteristic = null;
      this.rscCharacteristic = null;
    }
  }

  /**
   * Returns whether a device is currently connected
   */
  public static isConnected(): boolean {
    return Boolean(this.activeDevice?.gatt?.connected);
  }
}
