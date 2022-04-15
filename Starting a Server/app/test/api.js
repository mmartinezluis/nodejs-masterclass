/*
 * API Tests
*/

// Dependencies
let app = require('../index');
let assert = require('assert');
let http = require ('http');
let config = require('../lib/config');


// Holder for the tests
let api = {};

// Heleprs
let helpers = {};
helpers.makeGetRequest = function(path,callback){
    // Configure the request details 
    let requestDetails = {
        'protocol' : 'http:',
        'hostname' : 'localhost',
        'port' : config.httpPort,
        'method' : 'GET',
        'path' : path,
        'headers' : {
            'Content-Type' : 'application/json'
        }
    };

    // Send the request
    const req = http.request(requestDetails,function(res){
        callback(res);
    });
    req.end();
};

// THe main init() function should be able to run without thrwoing
api['app.init should be able to start without throwing'] = function(done){
    assert.doesNotThrow(function(){
        app.init(function(err){
            done();
        });
    },TypeError);
};

// Make a request to ping
api['/ping shlud respond to GET with 200'] = function(done){
    helpers.makeGetRequest('/ping',function(res){
        assert.equal(res.statusCode,200);
        done();
    });
};

// Make a request to /api/users
api['/api/users shlud respond to GET with 400'] = function(done){
    helpers.makeGetRequest('/api/users',function(res){
        assert.equal(res.statusCode,400);
        done();
    });
};

// Make a request to a random path
api['/A random path shlud respond to GET with 404'] = function(done){
    helpers.makeGetRequest('/this/path/shouldnt/exist',function(res){
        assert.equal(res.statusCode,404);
        done();
    });
};


// Export the tests to the runner
module.exports = api;