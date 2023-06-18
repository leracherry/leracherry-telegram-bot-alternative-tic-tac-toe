const cron = require('node-cron');
const PasswordRecovering = require('../models/PasswordRecovering');

cron.schedule('* * * * *', async () => {
  const passwords = await PasswordRecovering.find();
  const now = Date.now();
  const minutes = process.env.EXPIRES_MINUTES || '10';
  const ids = [];
  for (let i = 0; i < passwords.length; i++) {
    if (now - passwords[i].expiresAt > 1000 * 60 * Number(minutes)) {
      ids.push(passwords[i]._id);
    }
  }

  await PasswordRecovering.deleteMany({
    _id: { $in: ids },
  });
});
