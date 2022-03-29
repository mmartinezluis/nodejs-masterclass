// Request handlers

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

let handlers = {};

// Users
handlers.users = function(data, callback){
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Contaienr for the user's submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optinal data: none
handlers._users.post = function(data,callback){
    // Check that all required fields are filled out
    console.log(data)
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    console.log(firstName,lastName,phone,password,tosAgreement)
    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure tha the suer does already exist
        _data.read('users',phone,function(err,data){
            if(err){
                // Hash the password
                const hashedPassword = helpers.hash(password);

                // Create the user object
                if(hashedPassword){
                    const userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : tosAgreement
                    }
    
                    // Store the user
                    _data.create('users',phone,userObject,function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500,{'Error' : 'Could not create the new user'});
                        }
                    })

                } else {
                    callback(500,{'Error': 'Could not hash the user\'s password'});
                }
    
            } else {
                //  User already exists
                callback(400, {'Error' : 'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400,{'Error' :'Missing required fields'});
    }
};

// Users - get
// Requried data: phone
// Optional data: none
// @TODO Only let authenticated users acecss their object. Don't let them access anyone elses
handlers._users.get = function(data,callback){
    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Lookup the user
        _data.read('users',phone,function(err,data){
            if(!err && data){
                // Remove the hashed password from the user object before returning it to the requester
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Users - put
handlers._users.put = function(data,callback){

};

// Users - delete
handlers._users.delete = function(data,callback){

};


handlers.ping = function(data, callback){
    callback(200);
};

handlers.notFound = function(data, callback){
    callback(404);
};

handlers.sample = function(data, callback){
    callback(406,{'name' : 'sample handler'});
};


// Export the handlers
module.exports = handlers;