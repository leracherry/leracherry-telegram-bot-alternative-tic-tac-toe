const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No authorize' });
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (req.user.role !== 'admin') {
      return res.status(200).json({ error: 'Not enought rights' });
    } else {
      next();
    }
  } catch (e) {
    console.log(e.message);
    return res.status(401).json({ error: 'Something went wrong' });
  }
};
