const User = require('../models/User');
const PasswordRecovering = require('../models/PasswordRecovering');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

      const user = await User.findOne({
        $or: [{ id: telegramId }, { email: telegramId }],
      });

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

  async forgotPasswordCheck(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({ error: 'Not enough rights' });
      }

      const candidatePasswordRecovering = await PasswordRecovering.findOne({
        email,
      });
      if (candidatePasswordRecovering) {
        return res
          .status(200)
          .json({ message: 'Confirmation code already sent to your email' });
      }

      const minutes = process.env.EXPIRES_MINUTES || '10';

      const min = 100000;
      const max = 999999;
      const code = (
        Math.floor(Math.random() * (max - min + 1)) + min
      ).toString();

      const token = jwt.sign(
        {
          userId: user._id,
          code,
        },
        process.env.JWT_SECRET,
      );

      const passwordRecovering = new PasswordRecovering({
        email,
        expiresAt: Date.now() + 1000 * 60 * Number(minutes),
        token,
      });

      await passwordRecovering.save();

      // Создание транспортера для отправки письма через SMTP
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true для использования SSL/TLS
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });

      // Определение опций письма
      const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: 'Confirmation code',
        text: 'This is you confirmation code for tic-tac-toi-bot admin panel',
        html: `<h1>${code}</h1>`,
      };

      // Отправка письма
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Ошибка при отправке письма:', error);
        } else {
          console.log('Письмо успешно отправлено:', info.response);
        }
      });

      return res.status(200).json({ message: 'Message sent to your email' });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async checkUser(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({ error: 'Not enough rights' });
      }

      const passwordRecovering = await PasswordRecovering.findOne({ email });
      if (!passwordRecovering) {
        return res.status(400).json({ error: 'Code expired' });
      }

      return res.status(200).send({ message: 'Ok' });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async confirmEmail(req, res) {
    try {
      const { email, code } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const passwordRecovering = await PasswordRecovering.findOne({ email });
      if (!passwordRecovering) {
        return res.status(400).json({ error: 'Code expired' });
      }

      const data = jwt.verify(passwordRecovering.token, process.env.JWT_SECRET);

      if (data.userId !== user._id && data.code !== code) {
        return res.status(400).json({ error: 'Incorrect code' });
      }

      await PasswordRecovering.deleteMany({
        _id: { $in: [passwordRecovering._id] },
      }).exec();

      const token = jwt.sign(
        {
          email,
        },
        process.env.JWT_SECRET,
      );

      return res.status(200).json({ message: 'Code confirmed success', token });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async getUserEmail(req, res) {
    try {
      const token = req.headers.passwordtoken;

      if (!token) {
        return res.status(400).json({ error: 'Code expired' });
      }
      const { email } = jwt.verify(token, process.env.JWT_SECRET);

      return res.status(200).json({ email });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async createNewPassword(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      user.password = await bcrypt.hash(password, 12);
      await user.save();

      return res
        .status(200)
        .json({ message: 'Your password changed successfully' });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }
}

module.exports = new AuthController();
