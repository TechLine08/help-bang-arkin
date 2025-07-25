require('dotenv').config();

console.log('✅ /api/send-tips endpoint loaded'); // ✅ Log startup

const { sendTips } = require('../backend/scripts/sendMarketingEmails');

module.exports = async (req, res) => {
  console.log('📨 Triggered /api/send-tips');

  try {
    await sendTips(); // ⛔ This might hang or crash silently
    console.log('✅ Tips sent successfully');

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
