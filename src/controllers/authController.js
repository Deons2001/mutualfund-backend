const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success:false, message:'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash: hash });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '24h' });
    res.json({ success:true, message:'User created', token, user: { id:user._id, name:user.name, email:user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success:false, message:'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '24h' });
    res.json({ success:true, message:'Login success', token, user: { id:user._id, name:user.name, email:user.email } });
  } catch (err) { next(err); }
};
