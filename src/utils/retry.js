async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  let attempt = 0;
  while (true) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= retries) throw err;
      const wait = delay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, wait));
      attempt++;
    }
  }
}
module.exports = { retryWithBackoff };
