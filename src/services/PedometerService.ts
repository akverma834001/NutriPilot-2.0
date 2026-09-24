// Real-time Pedometer & Motion Sensor Service for NutriPilot 2.0
// Uses window.DeviceMotionEvent (Accelerometer) to detect actual human steps

export interface PedometerCallbacks {
  onStep: (totalSteps: number, stepDelta: number) => void;
  onMotionState?: (isMoving: boolean, currentMagnitude: number) => void;
  onError?: (errorMsg: string) => void;
  onPermissionStatus?: (granted: boolean) => void;
}

export class PedometerService {
  private static isListening: boolean = false;
  private static totalSteps: number = 0;
  private static lastStepTimestamp: number = 0;
  private static lastMagnitude: number = 9.8;
  private static isPeak: boolean = false;
  private static callbacks: PedometerCallbacks | null = null;
  private static boundMotionHandler: any = null;

  // Thresholds for step detection
  // Standard gravity is ~9.8 m/s^2. A footfall creates a spike > 11.5 m/s^2
  private static readonly PEAK_THRESHOLD = 11.6;
  private static readonly VALLEY_THRESHOLD = 8.6;
  private static readonly MIN_STEP_INTERVAL_MS = 280; // Max ~3.5 steps/sec (running cadence)

  /**
   * Checks if device motion is supported in the current browser/device
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  }

  /**
   * Requests motion sensor permission (required by iOS 13+ and modern browsers)
   */
  public static async requestPermission(): Promise<boolean> {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        return false;
      }
    }
    // Android / desktop browsers grant automatically if supported
    return true;
  }

  /**
   * Starts real step detection using the device's accelerometer
   */
  public static async startTracking(
    initialSteps: number,
    callbacks: PedometerCallbacks
  ): Promise<boolean> {
    this.totalSteps = initialSteps;
    this.callbacks = callbacks;

    if (!this.isSupported()) {
      callbacks.onError?.('Device accelerometer motion sensors are not available on this device.');
      return false;
    }

    const permissionGranted = await this.requestPermission();
    callbacks.onPermissionStatus?.(permissionGranted);

    if (!permissionGranted) {
      callbacks.onError?.('Motion sensor permission was denied.');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    this.boundMotionHandler = (event: DeviceMotionEvent) => this.handleDeviceMotion(event);
    window.addEventListener('devicemotion', this.boundMotionHandler, { passive: true });
    this.isListening = true;

    return true;
  }

  /**
   * Processes accelerometer vectors to detect step peaks and valleys
   */
  private static handleDeviceMotion(event: DeviceMotionEvent) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 9.8;

    // Vector magnitude = sqrt(x^2 + y^2 + z^2)
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    this.callbacks?.onMotionState?.(magnitude > 10.5 || magnitude < 9.0, Math.round(magnitude * 10) / 10);

    // Peak detection with valley reset
    if (magnitude > this.PEAK_THRESHOLD && !this.isPeak) {
      if (now - this.lastStepTimestamp > this.MIN_STEP_INTERVAL_MS) {
        this.isPeak = true;
      }
    } else if (magnitude < this.VALLEY_THRESHOLD && this.isPeak) {
      // Step confirmed on valley descent!
      this.isPeak = false;
      this.totalSteps += 1;
      this.lastStepTimestamp = now;
      this.callbacks?.onStep(this.totalSteps, 1);
    }

    this.lastMagnitude = magnitude;
  }

  /**
   * Stops accelerometer tracking
   */
  public static stopTracking() {
    if (this.isListening && this.boundMotionHandler) {
      window.removeEventListener('devicemotion', this.boundMotionHandler);
      this.boundMotionHandler = null;
    }
    this.isListening = false;
  }

  /**
   * Manually adds steps (useful for simulated walking, testing on desktops, or syncing external pedometer)
   */
  public static simulateSteps(count: number = 10) {
    this.totalSteps += count;
    this.callbacks?.onStep(this.totalSteps, count);
    return this.totalSteps;
  }

  public static getSteps(): number {
    return this.totalSteps;
  }

  public static isTrackingActive(): boolean {
    return this.isListening;
  }
}
