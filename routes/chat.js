var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('chat', { title: 'chat' });
});

router.post('/roomlist', function(req, res){
  res.set('Content-Type', 'application/json');
  res.send(req.app.get('socket.io').of('/chat').adapter.rooms);
});
module.exports = router;
