
const express = require('express');
const redis = require('redis');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');


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

let client = redis.createClient();
client.on("error",(error) => {
    throw error
});

const port = process.env.PORT || 3000;

app.get('/',(req,res) => {
    res.render('home.hbs', {
        layout: 'default'
    });
});

app.post('/',(req, res) => {
    const key = req.body.key;
    const value = req.body.value;
    client.set(key, value);
    res.render('home.hbs', {
        layout: 'default'
    });
});


app.listen(port, () => {
    console.log('server listening');
});
