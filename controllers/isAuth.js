const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res) {
    const token = req.header('x-auth-token');
    if (!token) return res.send(false);
    //////redirect Login page
    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        console.log(decoded);

        res.status(200).send(true)
    }
    catch (ex) {
        res.status(400).send(false);
    }
}