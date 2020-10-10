
const express = require('express');
const redis = require('redis');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');

require('dotenv').config();

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

app.get('/',(req,res) => {
    res.render('home.hbs', {
        layout: 'default'
    });
});

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


app.listen(port, () => {
    console.log('server listening');
});
