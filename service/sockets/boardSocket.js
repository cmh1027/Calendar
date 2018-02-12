module.exports = function(io){
    let blackboard = io.of('/blackboard');
    blackboard.on('connection', function(socket){
        console.log(socket.request.connection.remoteAddress+" has connected");
        socket.on('mousedown', function(data){
            socket.broadcast.emit('mousedown', {"x":data.x, "y":data.y});
        });
        socket.on('mousemove', function(data){
            socket.broadcast.emit('mousemove', {"x":data.x, "y":data.y});
        });
        socket.on('clear', function(){
            socket.broadcast.emit('clear');
        });
        socket.on('change', function(data){
            socket.broadcast.emit('change', {"color":data.color, "width":data.width});
        });
        socket.on('disconnect', function(){
            console.log(socket.request.connection.remoteAddress+" has disconnected");
        });
        socket.on('error',function(error){
			throw error;
		});
    });
}