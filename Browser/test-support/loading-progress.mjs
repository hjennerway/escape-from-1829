// A large background load may exceed a fixed wall-clock allowance while still
// making progress. Keep separate stall and total limits so neither a deadlock
// nor endless small advances can leave a browser test running indefinitely.
export async function waitForLoadingProgress(check, {
  progress, describe = () => '', label = 'Loading',
  idleTimeout = 60000, totalTimeout = 180000, pollInterval = 20,
  now = () => performance.now(), sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
}) {
  const started = now();
  let lastProgress = progress(), lastAdvance = started;
  while (!check()) {
    const time = now(), current = progress();
    if (current !== lastProgress) { lastProgress = current; lastAdvance = time; }
    if (time - started >= totalTimeout || time - lastAdvance >= idleTimeout) {
      const reason = time - started >= totalTimeout ? 'total deadline exceeded' : 'no progress';
      throw new Error(`${label}: ${reason} after ${Math.round(time - started)}ms; ${describe()}`);
    }
    await sleep(pollInterval);
  }
}
