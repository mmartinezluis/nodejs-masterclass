const http = require('http');
const url = require('url');

let server = http.createServer(function(req, res){

    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    const method = req.method.toLowerCase();

    res.end('Hello World\n'); 

    console.log('Request received on path: '+trimmedPath+ 'with method: '+method);
})

server.listen(3000, function(){
    console.log("The sever is listening on port 3000 now")
})