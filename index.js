
const express = require('express');

let app = express();

const port = process.env.PORT || 3000;

app.get('/',(req,res) => {
    res.send('hello world');
});

app.listen(port, () => {
    console.log('server listening');
});