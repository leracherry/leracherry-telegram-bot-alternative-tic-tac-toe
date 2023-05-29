const Game = require('../models/Game');
const User = require('../models/User');
class GameController {
  async getListGames(req, res) {
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
          { firstPlayer: { $regex: search, $options: 'i' } },
          { secondPlayer: { $regex: search, $options: 'i' } },
          { gameType: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
          { winner: { $regex: search, $options: 'i' } },
        ],
      };

      const games = await Game.aggregate([
        {
          $match,
        },
        { $sort: { [sortBy]: sortDir } },
        { $skip: Number(page) * Number(perPage) },
        { $limit: Number(perPage) },
      ]);

      const count = await Game.aggregate([
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
      const numberOfGames = count[0]?.count ?? 0;
      return res.status(200).json({
        games,
        count: numberOfGames,
      });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }

  async deleteMany(req, res) {
    try {
      const { ids } = req.query;
      const result = await Game.deleteMany({
        _id: { $in: ids.split(',') },
      }).exec();

      return res.status(200).json({ deletedCount: result.deletedCount });
    } catch (e) {
      return res.status(400).json({ error: 'Something went wrong' });
    }
  }
}

module.exports = new GameController();
