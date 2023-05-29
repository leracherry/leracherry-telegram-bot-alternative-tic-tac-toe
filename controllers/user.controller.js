const User = require('../models/User');
const bcrypt = require('bcryptjs');
class UserController {
  async getProfile(req, res) {
    try {
      const { userId } = req.user;
      const user = await User.findOne(
        { id: userId },
        {
          password: 0,
        },
      );
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      return res.status(200).json(user);
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async getUsersList(req, res) {
    try {
      const {
        page = '0',
        perPage = '10',
        sortBy = 'createdAt',
        sort = 'DESC',
        search = '',
        dateFrom = new Date(0),
        dateTo = new Date(),
      } = req.query;

      const createdAt = { $gte: dateFrom, $lte: dateTo };

      if (dateFrom < dateTo) {
        createdAt.$gte = dateFrom;
        createdAt.$lte = dateTo;
      } else {
        createdAt.$gte = new Date(0);
        createdAt.$lte = new Date();
      }

      const sortDir = sort === 'DESC' ? -1 : 1;

      const $match = {
        createdAt,
        $or: [
          { id: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { gameType: { $regex: search, $options: 'i' } },
        ],
      };

      const users = await User.aggregate([
        {
          $match,
        },
        { $sort: { [sortBy]: sortDir } },
        { $skip: Number(page) * Number(perPage) },
        { $limit: Number(perPage) },
        {
          $project: {
            password: 0,
          },
        },
      ]);

      const count = await User.aggregate([
        {
          $match,
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]).exec();
      const numberOfUsers = count[0]?.count ?? 0;
      return res.status(200).json({
        users,
        count: numberOfUsers,
      });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await User.findOne({ id: req.user.userId });
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Passwords are not compare' });
      }

      user.password = await bcrypt.hash(newPassword, 12);

      await user.save();

      return res.status(200).json({ message: 'Password changed' });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async deleteMany(req, res) {
    try {
      const { ids } = req.query;
      const users = await User.find({ id: { $in: ids.split(',') } });
      const newIds = users
        .filter((user) => user.role !== 'admin')
        .map((el) => el._id);
      const result = await User.deleteMany({
        _id: { $in: newIds },
      }).exec();

      return res.status(200).json({ deletedCount: result.deletedCount });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async changeStatus(req, res) {
    try {
      const { status, telegramId } = req.body;
      const user = await User.findOne({ id: telegramId });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      user.status = status;

      await user.save();
      return res.status(200).json({ updatedCount: 1 });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }
}

module.exports = new UserController();
