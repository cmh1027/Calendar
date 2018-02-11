/*
class Blackboard{
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = this.canvas.get(0).getContext("2d");
        this.drawing = false;
        this.press = this.press.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.canvas.on('mousedown', this.press);
        this.canvas.on('mousemove', this.move);
        this.canvas.on('mouseup', this.end);
        this.setShape();
    }
    press(event){
        this.ctx.beginPath();
        this.ctx.moveTo(event.pageX, event.pageY);
        this.drawing = true;
    }
    move(event){
        if(this.drawing){
            this.ctx.lineTo(event.pageX, event.pageY);
            this.ctx.stroke();
        }
    }
    end(event){
        this.drawing = false;
    }
    setShape(color, width){
        this.color = 'white';
        this.width = 1;
        if(color!=null){
            this.color = color;
        }
        if(width!=null){
            this.width = width;
        }
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
    }
} 
*/
$(document).ready(function(){
    $("#cv").attr({width:'860px', height:'645px'});
    var ctx = new Blackboard($("#cv"));
    var map = new daum.maps.Map($("#map")[0], {
        center: new daum.maps.LatLng(33.450701, 126.570667),
        level: 3,
        draggable : false
    });
    $("#map").hide();
    
});

function Blackboard(canvas){
    this.socket = io.connect('http://'+window.location.host+'/blackboard');
    this.canvas = canvas;
    this.ctx = this.canvas[0].getContext("2d");
    this.ctxServer = this.canvas[0].getContext("2d");
    this.drawing = false;
    this.color = 'white';
    this.width = 1;
    this.colorServer = 'white';
    this.widthServer = 1;
    this.setEvent();
    this.setServerEvent();
    this.setShape();
    this.color_map.forEach(element => {
        $("#pen_color").append($("<option>").attr('value', element).text(element));
    });
    Array(16).fill(0).forEach((element, index) => {
        $("#pen_width").append($("<option>").attr('value', index+1).text(index+1));
    });
}

Blackboard.prototype.color_map = ['white', 'red', 'orange', 'yellow', 'blue', 'black'];

Blackboard.prototype.setEvent = function(){
    this.canvas.on('mousedown', (event)=>{
        this.ctx.beginPath();
        this.ctx.moveTo(event.pageX, event.pageY);
        this.drawing = true;
        this.socket.emit('mousedown', {"x":event.pageX, "y":event.pageY});
    });

    this.canvas.on('mousemove', (event)=>{
        if(this.drawing){
            this.ctx.lineTo(event.pageX, event.pageY);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.stroke();
            this.socket.emit('mousemove', {"x":event.pageX, "y":event.pageY});
        }
    });

    this.canvas.on('mouseup', (event)=>{
        this.drawing = false;
    });

    $("#clear").on('click', ()=>{
        this.ctx.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
        this.ctx.beginPath();
        this.ctx.moveTo(741, 50);
        this.ctx.lineTo(821, 50);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
        this.socket.emit('clear');
    });

    $("select").on('change', ()=>{
        let color = $("#pen_color option:selected").val();
        let width = $("#pen_width option:selected").val();
        this.setShape(color, width);
        this.socket.emit('change', {"color":color, "width":width});
    });
    $("#map_toggle").on('click', ()=>{
        if($("#map").is(":hidden")){
            $("#map_toggle").text("Hide map");
        }
        else{
            $("#map_toggle").text("Show map");           
        }
        $("#map").toggle();
    });
}

Blackboard.prototype.setServerEvent = function(){
    this.socket.on('mousedown', (data)=>{
        this.ctxServer.beginPath();
        this.ctxServer.moveTo(data.x, data.y);
    });

    this.socket.on('mousemove', (data)=>{
        this.ctxServer.lineTo(data.x, data.y);
        this.ctx.strokeStyle = this.colorServer;
        this.ctx.lineWidth = this.widthServer;
        this.ctxServer.stroke();
    });

    this.socket.on('clear', ()=>{
        this.ctxServer.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
    });

    this.socket.on('change', (data)=>{
        this.colorServer = data.color;
        this.widthServer = data.width;
    });
	this.socket.on('disconnect', ()=>{
		this.socket.close();
		console.log("disconnected");
	});
}


Blackboard.prototype.setShape = function(clr, wid){
    var color = 'white';
    var width = 1;
    if(clr!=null){
        color = clr;
    }
    if(wid!=null){
        width = wid;
    }
    this.color = color;
    this.width = width;
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.width;
    this.ctx.clearRect(730, 10, 780, 60);
    this.ctx.beginPath();
    this.ctx.moveTo(741, 50);
    this.ctx.lineTo(821, 50);
    this.ctx.stroke();
}