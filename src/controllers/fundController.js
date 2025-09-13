const FundLatestNav = require('../models/FundLatestNav');
const FundNavHistory = require('../models/FundNavHistory');


// GET /api/funds
// List all latest NAVs

exports.list = async (req, res) => {
  try {
    const funds = await FundLatestNav.find().sort({ schemeCode: 1 });
    res.json({ success: true, data: funds });
  } catch (err) {
    console.error('Fund list error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// GET /api/funds/:schemeCode/nav
// Get latest NAV of one scheme
// =======================
exports.nav = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const fund = await FundLatestNav.findOne({ schemeCode });

    if (!fund) {
      return res.status(404).json({ success: false, message: 'Fund not found' });
    }

    res.json({ success: true, data: fund });
  } catch (err) {
    console.error('Fund nav error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// =======================
// GET /api/funds/history/:schemeCode
// Get NAV history of one scheme
// =======================
exports.history = async (req, res) => {
  try {
    const { schemeCode } = req.params;
    const history = await FundNavHistory.find({ schemeCode }).sort({ date: -1 }).limit(30);

    if (!history || history.length === 0) {
      return res.status(404).json({ success: false, message: 'No history found' });
    }

    res.json({ success: true, data: history });
  } catch (err) {
    console.error('Fund history error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
