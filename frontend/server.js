const express = require('express');
const app = express();
const routes = require('./Routes.js');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use('/', routes);

app.listen(3000);

console.log('listening on port 3000')
