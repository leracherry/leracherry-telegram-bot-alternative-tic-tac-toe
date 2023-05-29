const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
class AuthController {
  async adminRegister(req, res) {
    try {
      const { telegramId, password } = req.body;
      const user = await User.findOne({ id: telegramId });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user && user.password) {
        return res.status(400).json({ error: 'User already exist' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      user.role = 'admin';
      user.password = hashedPassword;

      await user.save();
      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
      );
      return res.status(201).json({ accessToken });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }
  async loginAdmin(req, res) {
    try {
      const { telegramId, password } = req.body;

      const user = await User.findOne({ id: telegramId });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      if (user.role !== 'admin') {
        return res.status(400).json({ error: 'Not enough rights' });
      }
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ error: 'Invalid password, please try again' });
      }

      const accessToken = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
      );
      return res.status(200).send({ accessToken });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }
}

module.exports = new AuthController();
