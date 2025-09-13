const axios = require('axios');
const base = process.env.MFAPI_BASE || 'https://api.mfapi.in';

async function fetchLatestNAV(schemeCode) {
  const url = `${base}/mf/${schemeCode}/latest`;
  const res = await axios.get(url, { timeout: 10000 });
  // adapt to different response shapes
  const data = res.data && (res.data.data || res.data);
  // many mfapi endpoints return data = { fundName, data: { nav, date } } or data.data = { nav, date }
  const navEntry = data.data || data;
  // If it's an array, pick first
  if (Array.isArray(navEntry)) {
    return { nav: Number(navEntry[0].nav), date: navEntry[0].date };
  }
  return { nav: Number(navEntry.nav), date: navEntry.date };
}

async function fetchNAVForDate(schemeCode, dateStr) {
  // expects dateStr like "12-09-2025"
  const url = `${base}/mf/${schemeCode}`;
  const res = await axios.get(url, { timeout: 15000 });
  const data = res.data && (res.data.data || res.data);
  // data.data often is an array of {date, nav}
  const history = data.data || data;
  if (Array.isArray(history)) {
    const found = history.find(h => h.date === dateStr);
    if (found) return Number(found.nav);
    // fallback to latest
    const first = history[0];
    if (first) return Number(first.nav);
  }
  // fallback to fetchLatestNAV
  const latest = await fetchLatestNAV(schemeCode);
  return latest.nav;
}

module.exports = { fetchLatestNAV, fetchNAVForDate };
