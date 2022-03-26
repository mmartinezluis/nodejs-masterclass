const http = require('http');

let server = http.createServer(function(req, res){
    res.end('Hello World\n');
})

server.listen(3000, function(){
    console.log("The sever is listening on port 3000 now")
})