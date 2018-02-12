const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('socket.io', io);

app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
require('./service/route.js')(app, io);
require('./service/socketManage.js')(io);

module.exports = app;
server.listen(3000, function(){
  console.log('Server running at http://127.0.0.1:3000/');
})