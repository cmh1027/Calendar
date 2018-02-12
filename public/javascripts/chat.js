let socket = null;
let nickname = null;
let clientID = null;
let isIn = false;
const namespace = '/chat'
let serverUrl = 'http://'+window.location.host+namespace;
$(document).ready(function(){
	socket = io.connect(serverUrl);
	socket.on('connect', function(){
		clientID = namespace+"#"+socket.id;
	})
	getRoomList();
	$("#room_make").click(function(){
		var data = {"roomname":$("#roomname").val(), "nickname":$("#nickname").val()};
		nickname = $("#nickname").val();
		socket.emit('roommake', data);
		isIn = true
		$("#roomname").val("");
		$("#nickname").val("");
		getRoomList();
	});
	socket.on('roomlist', function(data){
		var rooms = data.rooms;
		var roomlist = [];
		var inroom = false;
		var sameroom = false;
		$.each(rooms, function(room){
			$.each(rooms[room].sockets, function(id){
				if(clientID===id){
					inroom = true;
					$.each(rooms[room].sockets, function(id2){
						if(id2==data.id){
							sameroom = true;
						}
					});
				}
			});
			roomlist.push({"name":room, "count":rooms[room].length, "inroom":inroom});
		});
		if(data.action==="roommake" && !isIn || data.action==="enter" && (!isIn||sameroom)){
			viewRoomlist(roomlist);
		}
	});
	socket.on('intro', function(name){
		$("#chatroom textarea").val($("#chatroom textarea").val()+name+" has joined.\n");
		$("#chatroom textarea").scrollTop($('#chatroom textarea').scrollHeight);
	});
	socket.on('message', function(data){
		var msg = data.nickname + " : " + data.msg+"\n";
		$("#chatroom textarea").val($("#chatroom textarea").val()+name+msg);
		$("#chatroom textarea").scrollTop($('#chatroom textarea').scrollHeight);		
	});
	socket.on('quit', function(name){
		if(isIn){
			$("#chatroom textarea").val($("#chatroom textarea").val()+name+" has quited.\n");
			$("#chatroom textarea").scrollTop($('#chatroom textarea').scrollHeight);
		}
	})
	$("#chatinput").on('keypress', function(e){
		if(e.keyCode == 13){
			socket.emit('message', {"msg":$("#chatinput").val(), "roomname":$("#quit").attr("data-roomname")});
			$("#chatinput").val("");
		}
	});
	$("#send").on('click', function(e){
		socket.emit('message', {"msg":$("#chatinput").val(), "roomname":$("#quit").attr("data-roomname")});
		$("#chatinput").val("");
	});
	socket.on('disconnect', function(){
		socket.close();
		$("body").empty();
		$("body").text("The connection to the server has been disconnected");
	});
	socket.on('error', function(error){
		socket.close();
		throw error;
	});
});

function getRoomList(){
	$.ajax({
		method: "post",
		dataType: "json",
		url: "./chat/roomlist",
		success: function(rooms){
			var roomlist = [];
			var inroom = false;
			$.each(rooms, function(room){
				$.each(rooms[room].sockets, function(id){
					if(clientID===id){
						inroom = true;
					}
				})
				roomlist.push({"name":room, "count":rooms[room].length, "inroom":inroom});
			});
			console.log(roomlist);
			viewRoomlist(roomlist);
		},
		error: function(data){
			console.log(data);
		}
	});
}

function viewRoomlist(data){
	$("#roomlist").empty();
	for(var i=0; i<data.length; i++){
		if(data[i].inroom){
			$("#room").hide();
			$("#roommake").hide();
			$("#chatroom").show();
			$("#chatinput").removeAttr("readonly");
			$("#roominfo").text("Room name : "+data[i].name + " || Members : "+data[i].count+" || Nickname : "+nickname);
			$("#quit").off();
			$("#quit").attr("data-roomname", data[i].name).click(function(){
				socket.emit("quit", $(this).attr("data-roomname"));
				$("#roominfo").text("Not connected");
				$("#chatroom textarea").val("");
				isIn = false;
			});
			break;
		}
	}
	if(!isIn){
		for(var i=0; i<data.length; i++){
			$("#roomlist")
				.append($("<li>").text("Room name : "+data[i].name+", Members : "+data[i].count+", Nickname : ").attr("data-roomname", data[i].name)
					.append($("<input>").attr("type", "text")).append("  ")
					.append($("<input>").attr({"type":"button", "value":"Enter"})
					.on('click', function(){
						isIn = true;
						nickname = $($(this).siblings()[0]).val();
						socket.emit('roomenter', {"roomname":$(this).parent().attr("data-roomname"), "nickname":nickname});
				})));
		}
		if(!isIn){
			if(!$("#room").is(":visible")){
				$("#room").show();
			}
			if(!$("#roommake").is(":visible")){
				$("#roommake").show();
			}
			if($("#chatroom").is(":visible")){
				$("#chatroom").hide();
			}
		}

	}
	if(data.length<1){
		$("#roomlist").append($("<li>").text("No rooms"));
	}
}
