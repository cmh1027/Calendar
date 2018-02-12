module.exports = function(io){
	let chat = io.of('/chat');
	chat.on('connection', function(socket){
		console.log(socket.request.connection.remoteAddress+" has connected");
		for(let room in chat.adapter.sids[socket.id]){
			socket.leave(room);
		}
		socket.on('roommake', function(data){;
			if(Object.keys(chat.adapter.sids[socket.id]).length==0){
				console.log(data.nickname+" has opened a room (room name : "+data.roomname+")");
				socket.join(data.roomname);
				socket.room = data.roomname;
				socket.nickname = data.nickname;
				socket.broadcast.emit('roomlist', {"rooms":chat.adapter.rooms, action:"roommake", "id":socket.id});
			}
		});
		socket.on('enter', function(name){
			chat.to(name).emit('intro', socket.nickname);
			socket.broadcast.emit('roomlist', {"rooms":chat.adapter.rooms, "action":"enter", "id":socket.id});
		});
		socket.on('message', function(data){
			for(room in chat.adapter.sids[socket.id]){
				if(room==data.roomname){
					console.log(socket.nickname+" has sent a message (room name : "+data.roomname+" , msg : "+data.msg+")");
					chat.to(room).emit('message', {"nickname":socket.nickname, "msg":data.msg});
					break;
				}
			}
		});
		socket.on('roomenter', function(data){
			for(r in chat.adapter.rooms){
				if(r===data.roomname){
					console.log(data.nickname+" has entered a room (room name : "+data.roomname+")");
					socket.join(data.roomname);
					socket.room = data.roomname;
					socket.nickname = data.nickname;
					chat.to(data.roomname).emit('intro', socket.nickname);
					chat.emit('roomlist', {"rooms":chat.adapter.rooms, "action":"enter", "id":socket.id});
				}
			}
		});
		socket.on('quit', function(room){
			for(r in chat.adapter.rooms){
				if(r===room){
					console.log(socket.nickname+" has quited a room (room name : "+room+")");
					socket.leave(room);
					socket.broadcast.to(room).emit("quit", socket.nickname);
					chat.emit('roomlist', {"rooms":chat.adapter.rooms, "action":"enter", "id":socket.id});
				}
			}

		})
		socket.on('disconnect', function(){
			console.log(socket.request.connection.remoteAddress+" has disconnected");
		})
		socket.on('error',function(error){
			throw error;
		});
	});
}