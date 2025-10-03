const express = require('express');
const router = express.Router();
const SiteStats = require('../models/SiteStats');

async function getStatsDocument() {
  const existing = await SiteStats.findOne();
  if (existing) {
    return existing;
  }
  return SiteStats.create({});
}

router.get('/views', async (req, res) => {
  try {
    const stats = await getStatsDocument();
    res.json({ totalViews: stats.totalViews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/views', async (req, res) => {
  try {
    const stats = await SiteStats.findOneAndUpdate(
      {},
      { $inc: { totalViews: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ totalViews: stats.totalViews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
