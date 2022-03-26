const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let server = http.createServer(function(req, res){

    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;

    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    const queryStringObject = parsedUrl.query;

    const method = req.method.toLowerCase();

    const headers = req.headers;    

    // Get the payload
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        res.end('Hello World\n'); 

        console.log('Reqeust received with this payload: ', buffer);  
    })

    // console.log('Request received on path: '+trimmedPath+ ' with method: '+method+' and with this query string parameters', queryStringObject);
    // console.log('Reqeust received with these headers: ', headers);
})


server.listen(3000, function(){
    console.log("The sever is listening on port 3000 now")
})