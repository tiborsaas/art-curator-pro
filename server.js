const express = require('express');
const app = express();

app.get('/predict', (req, res) => {
    res.json({
        child: 0.999999,
        abstract: 0.111111
    });
});

app.listen(5000, e => {
    console.log('server running');
});