var express = require('express');
var fs = require('fs');
var path = require('path')
var app = express();
const cors = require('cors');
const mongoose = require("mongoose")
const config = require('config');
const admin = require('./middleware/admin');
const auth = require("./middleware/auth")
const dashboardController = require("./controllers/dashboardController")
const userController = require("./controllers/userController")
const isAuth = require("./controllers/isAuth")

app.use(express.static(__dirname));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

if (!config.get('jwtPrivateKey')) {
    console.error('FATAL ERROR: jwtPrivateKey is not defined.');
    process.exit(1);
}

///////////
const corsOptions = {
    exposedHeaders: 'x-auth-token',
};
app.use(cors(corsOptions));
////////////

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/scanDoc', { useNewUrlParser: true, useUnifiedTopology: true })/////
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());

app.post("/auth", isAuth)
app.post('/create', admin, userController.create)
app.post('/login', userController.login)
app.post('/upload', auth, dashboardController.upload)
app.get('/getFiles/:keyWord', auth, dashboardController.getFiles)

app.get('/storage/', (req, res) => {
    // console.log(req.params, 'req.params')
    fs.createReadStream(`./uploaded/${req.params.address}/${req.params.id}`).pipe(res);
});

app.delete('/remove/:file/:text', auth, dashboardController.delete)

app.get('/download/:id', dashboardController.downloadFile);

app.get('/readDocument/:file', dashboardController.readDocumentFromURL);

let PORT = process.env.PORT || 8080;

app.listen(PORT, function () {
    console.log('Server is listening on ', PORT);
});