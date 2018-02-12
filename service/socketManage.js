module.exports = function(io){
    require('./sockets/chatSocket')(io);
    require('./sockets/boardSocket')(io);
}