const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ success:false, message:'No token provided' });
  const token = h.split(' ')[1];
  if (!token) return res.status(401).json({ success:false, message:'Invalid auth header' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message:'Invalid token' });
  }
};
