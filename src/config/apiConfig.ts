// Application API & UPI Integration Configuration
// Key provided by user: 5c54be4014a8458b87f496d078441c41.hE-dCG91N6DabWvcFaXYlMzd

export const DEFAULT_APP_KEY = '5c54be4014a8458b87f496d078441c41.hE-dCG91N6DabWvcFaXYlMzd';

export const APP_CONFIG = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_API_KEY) || DEFAULT_APP_KEY,
  upiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPI_KEY) || DEFAULT_APP_KEY,
  isConfigured: true,
  maskedKey: '5c54•••••••••••••••••••••••••••••••••••••lMzd',
  getAuthHeaders: () => ({
    'Authorization': `Bearer ${APP_CONFIG.apiKey}`,
    'X-UPI-Key': APP_CONFIG.upiKey,
    'Content-Type': 'application/json'
  }),
  formatUpiTxnRef: (prefix: string = 'NP') => {
    const timestamp = Date.now().toString().slice(-6);
    const keySnippet = APP_CONFIG.apiKey.slice(0, 6);
    return `${prefix}-UPI-${keySnippet}-${timestamp}`;
  }
};
