require('dotenv').config();

const { sendTips } = require('../backend/scripts/sendMarketingEmails');

module.exports = async (req, res) => {
  try {
    await sendTips();
    res.status(200).json({
      success: true,
      message: 'Marketing tips sent successfully',
    });
  } catch (err) {
    console.error('❌ Failed to send tips:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to send marketing tips',
    });
  }
};
