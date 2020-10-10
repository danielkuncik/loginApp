require('dotenv').config();

const express = require('express');
const redis = require('redis');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');
const db = require(__dirname + '/queries.js');

const session = require('express-session');

const helpers = require('./helpers.js');

console.log(process.env.NODE_ENV);
console.log(process.env.NODE_TLS_REJECT_UNAUTHORIZED);

let app = express();

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

app.set('view engine', 'hbs');
app.set('views', [__dirname + '/views']);
app.engine('hbs', hbs.express4({
    defaultView: 'default.hbs',
    partialsDir: __dirname + '/views/partials',
    layoutsDir: __dirname + '/views/layouts'
}));

let client = redis.createClient(process.env.REDIS_URL);
client.on("error",(error) => {
    throw error
});

// I need to figure out more about what these options mean
app.use(session({
    secret: 'testRedisSessionStorey',
    name: 'talkingAboutPractice',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, //// set secure:true in production environment for the physics app...bc that has https      // Note that the cookie-parser module is no longer needed (set this as )
    // store default is MemoryStore [which leaks]
   // store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
}));

const port = process.env.PORT || 3000;

const checkUserInfo = (req, res, next) => {
    req.username = 'not logged in';
    next();
};


app.get('/',[checkUserInfo, db.loadAllUsers, (req,res) => {
    res.render('home.hbs', {
        layout: 'default',
        userList: req.userList,
        username: req.username
    });
}]);

app.get('/createKey',[checkUserInfo, (req, res) => {
    res.render('createKey.hbs', {
        layout: 'default',
        username: req.username
    });
}]);


app.post('/createKey',[checkUserInfo, (req, res) => {
    const key = req.body.key;
    const value = req.body.value;
    client.set(key, value, () => {
        res.render('createKey.hbs', {
            layout: 'default',
            username: req.username
        });
    });
}]);

app.get('/readKey',[checkUserInfo, (req,res) => {
    res.render('readKey.hbs', {
        layout: 'default',
        username: req.username
    });
}]);

app.post('/readKey',[checkUserInfo, (req,res) => {
    const keyEntered = req.body.key;
    client.get(keyEntered, (err, reply) => {
        if (err) {
            throw err
        }
        const valueRead = reply;
        res.render('readKey.hbs', {
            layout: 'default',
            key: keyEntered,
            value: valueRead ? valueRead : 'null',
            username: req.username
        });
    });
}]);

app.get('/createUser',[checkUserInfo, (req, res) => {
    res.render('createUser.hbs', {
        layout: 'default',
        username: req.username
    });
}]);

app.post('/createUser',[(req,res, next) => {
    req.name = req.body.username;
    req.password = req.body.password;
    next();
}, db.createUser,(req, res) => {
    res.redirect('/');
}]);

app.get('/login',[checkUserInfo, (req,res) => {
    res.render('login.hbs', {
        layout: 'default',
        username: req.username
    });
}]);

app.post('/login',[ (req,res,next) => {
    req.name = req.body.username;
    req.password = req.body.password;
    next();
}, db.loginUser, (req, res) => {
    console.log(req.success);
    res.redirect('/');
}]);

app.get('/logout',[checkUserInfo, (req,res) => {
    res.render('logout.hbs', {
        layout: 'default',
        username: req.username
    });
}]);

app.post('/logout',(req,res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log('server listening');
});
