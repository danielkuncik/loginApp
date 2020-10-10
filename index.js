
const express = require('express');
const redis = require('redis');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');
const db = require(__dirname + '/queries.js');

const helpers = require('./helpers.js');

console.log(process.env.NODE_ENV);

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

const port = process.env.PORT || 3000;

app.get('/',[db.loadAllUsers, (req,res) => {
    res.render('home.hbs', {
        layout: 'default',
        userList: req.userList
    });
}]);

app.get('/createKey',(req, res) => {
    res.render('createKey.hbs', {
        layout: 'default'
    });
});


app.post('/createKey',(req, res) => {
    const key = req.body.key;
    const value = req.body.value;
    client.set(key, value, () => {
        res.render('createKey.hbs', {
            layout: 'default'
        });
    });
});

app.get('/readKey',(req,res) => {
    res.render('readKey.hbs', {
        layout: 'default'
    });
});

app.post('/readKey',(req,res) => {
    const keyEntered = req.body.key;
    client.get(keyEntered, (err, reply) => {
        if (err) {
            throw err
        }
        const valueRead = reply;
        res.render('readKey.hbs', {
            layout: 'default',
            key: keyEntered,
            value: valueRead ? valueRead : 'null'
        });
    });
});

app.get('/createUser',(req, res) => {
    res.render('createUser.hbs', {
        layout: 'default'
    });
});

app.post('/createUser',[(req,res, next) => {
    req.name = req.body.username;
    req.password = req.body.password;
    next();
}, db.createUser,(req, res) => {
    res.redirect('/');
}]);

app.get('/login',(req,res) => {
    res.render('login.hbs', {
        layout: 'default'
    });
});

app.post('/login',[(req,res,next) => {
    req.name = req.body.username;
    req.password = req.body.password;
    next();
}, db.loginUser, (req, res) => {
    console.log(req.success);
    res.redirect('/');
}]);

app.get('/logout',(req,res) => {
    res.render('logout.hbs', {
        layout: 'default'
    });
});

app.post('/logout',(req,res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log('server listening');
});
