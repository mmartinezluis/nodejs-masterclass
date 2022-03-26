const http = require('http');
const url = require('url');

let server = http.createServer(function(req, res){

    const parsedUrl = url.parse(req.url, true);


    const path = parsedUrl.pathname;


    const trimmedPath = path.replace(/^\/+|\/+$/g,'');


    res.end('Hello World\n'); 

    console.log('Request received on path: '+trimmedPath)

    

})

server.listen(3000, function(){
    console.log("The sever is listening on port 3000 now")
})