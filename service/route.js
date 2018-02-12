const index = require('../routes/index');
const board = require('../routes/board');
const calendar = require('../routes/calendar');
const chat = require('../routes/chat');

module.exports = function(app, io){
	app.use('/', index);
    app.use('/chat', chat);
    app.use('/board', board);
	app.use('/calendar', calendar);
	
	app.use(function(req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});
	app.use(function(err, req, res, next) {
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};
		res.status(err.status || 500);
		res.render('error');
	});
};