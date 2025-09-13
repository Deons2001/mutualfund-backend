
const Portfolio = require('../models/Portfolio');
const FundLatestNav = require('../models/FundLatestNav');
const { fetchLatestNAV, fetchNAVForDate } = require('../utils/mfapi');

// =======================
// ADD portfolio
// =======================
exports.add = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { schemeCode, units, purchaseDate } = req.body;

    if (!schemeCode || !units || units <= 0) {
      return res.status(400).json({ success: false, message: 'schemeCode and positive units required' });
    }

    let purchaseNav = null;

    if (purchaseDate) {
      try {
        purchaseNav = await fetchNAVForDate(schemeCode, purchaseDate);
      } catch (e) {
        console.warn('fetchNAVForDate failed:', e.message);
      }
    }

    if (!purchaseNav) {
      const dbNav = await FundLatestNav.findOne({ schemeCode });
      if (dbNav) purchaseNav = dbNav.nav;
      else {
        const latest = await fetchLatestNAV(schemeCode);
        purchaseNav = latest.nav;
        await FundLatestNav.updateOne(
          { schemeCode },
          { $set: { nav: latest.nav, date: latest.date, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    if (!purchaseNav) {
      return res.status(400).json({ success: false, message: 'Could not fetch NAV for scheme' });
    }

    const investedValue = Number((units * purchaseNav).toFixed(4));
    const doc = await Portfolio.create({
      userId,
      schemeCode,
      units,
      purchaseDate: purchaseDate || null,
      purchaseNav,
      investedValue
    });

    res.status(201).json({
      success: true,
      message: 'Added to portfolio',
      portfolioId: doc._id
    });
  } catch (err) {
    next(err);
  }
};

// =======================
// LIST portfolio
// =======================
exports.list = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await Portfolio.find({ userId }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// =======================
// PORTFOLIO VALUE
// =======================
exports.value = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const holdings = await Portfolio.find({ userId }).lean();

    if (!holdings.length) {
      return res.json({
        success: true,
        data: {
          totalInvestment: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercent: 0,
          holdings: []
        }
      });
    }

    const schemeCodes = [...new Set(holdings.map(h => h.schemeCode))];
    const navMap = {};

    for (const code of schemeCodes) {
      const dbNav = await FundLatestNav.findOne({ schemeCode: code });
      if (dbNav) {
        navMap[code] = dbNav.nav;
      } else {
        const latest = await fetchLatestNAV(code);
        navMap[code] = latest.nav;
        await FundLatestNav.updateOne(
          { schemeCode: code },
          { $set: { nav: latest.nav, date: latest.date, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    let totalInvestment = 0;
    let currentValue = 0;
    const holdingResponses = [];

    for (const h of holdings) {
      const invested = h.investedValue ?? (h.purchaseNav ? h.units * h.purchaseNav : 0);
      const currentNav = navMap[h.schemeCode] || 0;
      const currVal = Number((h.units * currentNav).toFixed(4));

      totalInvestment += invested;
      currentValue += currVal;

      holdingResponses.push({
        schemeCode: h.schemeCode,
        units: h.units,
        purchaseNav: h.purchaseNav,
        investedValue: Number(invested.toFixed(4)),
        currentNav,
        currentValue: currVal,
        profitLoss: Number((currVal - invested).toFixed(4))
      });
    }

    const profitLoss = Number((currentValue - totalInvestment).toFixed(4));
    const profitLossPercent =
      totalInvestment > 0 ? Number(((profitLoss / totalInvestment) * 100).toFixed(4)) : 0;

    res.json({
      success: true,
      data: {
        totalInvestment: Number(totalInvestment.toFixed(4)),
        currentValue: Number(currentValue.toFixed(4)),
        profitLoss,
        profitLossPercent,
        asOn: new Date().toISOString(),
        holdings: holdingResponses
      }
    });
  } catch (err) {
    next(err);
  }
};
