// api/send-tips.js

require('dotenv').config();

console.log('✅ Loaded /api/send-tips endpoint');

const { sendTips } = require('../backend/scripts/sendMarketingEmails');

module.exports = async (req, res) => {
  console.log('📨 /api/send-tips invoked');

  try {
    await sendTips();

    console.log('✅ sendTips() executed successfully');

    res.status(200).json({
      success: true,
      message: 'Marketing tips sent successfully',
    });
  } catch (err) {
    const message = err?.message || 'Unknown error in sendTips()';
    console.error('❌ sendTips() failed:', message);
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};
