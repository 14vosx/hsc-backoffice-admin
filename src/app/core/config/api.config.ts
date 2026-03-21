const hostname = globalThis.location.hostname;

const isLocalhost =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '0.0.0.0';

export const API_BASE_URL = isLocalhost
  ? ''
  : 'https://auth-api.haxixesmokeclub.com';