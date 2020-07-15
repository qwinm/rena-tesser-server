const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {

  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));

    if (!decoded.isAdmin) return res.status(401).send('Require admin permission');/////////
    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}
