const cron = require('node-cron');
const Portfolio = require('../models/Portfolio');
const FundLatestNav = require('../models/FundLatestNav');
const FundNavHistory = require('../models/FundNavHistory');
const { fetchLatestNAV } = require('../utils/mfapi');
const { retryWithBackoff } = require('../utils/retry');

function scheduleNavUpdater() {
  const cronExp = process.env.CRON_SCHEDULE || '0 0 * * *';

  cron.schedule(cronExp, async () => {
    console.log('Starting NAV updater (cron)...');

    try {
      const codes = await Portfolio.distinct('schemeCode');
      let successCount = 0, failCount = 0;

      for (const code of codes) {
        try {
          const latest = await retryWithBackoff(() => fetchLatestNAV(code), 3, 1000);
          if (!latest || typeof latest.nav !== 'number') {
            console.warn('No NAV for', code);
            failCount++;
            continue;
          }

          // Update latest snapshot
          await FundLatestNav.updateOne(
            { schemeCode: code },
            { $set: { nav: latest.nav, date: latest.date, updatedAt: new Date() } },
            { upsert: true }
          );

          // Upsert into history
          await FundNavHistory.updateOne(
            { schemeCode: code, date: latest.date },
            { $set: { nav: latest.nav } },
            { upsert: true }
          );

          console.log(`Updated NAV for ${code} -> ${latest.nav} (${latest.date})`);
          successCount++;
        } catch (e) {
          console.error('Failed update for', code, e && e.message ? e.message : e);
          failCount++;
        }
      }

      console.log(`NAV updater finished. Success: ${successCount}, Failures: ${failCount}`);
    } catch (err) {
      console.error('NAV updater error', err);
    }
  }, { scheduled: true, timezone: 'Asia/Kolkata' });

  return true;
}

module.exports = scheduleNavUpdater;
