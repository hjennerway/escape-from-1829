import { setTimeout as delay } from 'node:timers/promises';

const retryDelays = [5000, 15000, 30000];
const retryStatuses = new Set([408, 429, 500, 502, 503, 504]);
const retryCodes = new Set([
  'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT', 'UND_ERR_SOCKET',
]);

function isTransientDownloadError(error) {
  // @electron/get's HTTPError exposes a Fetch Response; fetch network failures
  // expose the underlying socket error through cause.
  if (error?.response?.status !== undefined) return retryStatuses.has(error.response.status);
  return retryCodes.has(error?.code) || (error?.cause && isTransientDownloadError(error.cause));
}

export async function retryElectronDownload(operation, { sleep = delay, warn = console.warn } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retryDelays.length || !isTransientDownloadError(error)) throw error;
      const milliseconds = retryDelays[attempt];
      warn(`Electron download failed: ${error.message}. Retrying in ${milliseconds / 1000}s (attempt ${attempt + 2}/${retryDelays.length + 1}).`);
      await sleep(milliseconds);
    }
  }
}
