// Request handlers

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define the handlers
let handlers = {};


//  ************************** USERS SERIVCE ******************************************* //

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
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    
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

        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokeIsValid){
            if(tokeIsValid){
                    // Lookup the user
                _data.read('users',phone,function(err,data){
                    // THe arguments 'err' and 'data' on above line come from the invocation of the callback function in the read method for the database, invoked with the arguments "false" and "parsedData", the last one being a JSON string
                    if(!err && data){
                        // Remove the hashed password from the user object before returning it to the requester
                        delete data.hashedPassword;
                        callback(200,data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                // 403 Forbidden
                callback(403,{'Error' : 'Mising required token in header, or token is invalid'});
            }
        })

  
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Users - put
// Require data: phone
// Optinoal data: firstName, lastName, passwod (at least one must be specified)
//  @TODO Only let an authennticated user update their own object. Don't let them update anyone elses
handlers._users.put = function(data,callback){
    // Check for the required field
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for the opttional fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(phone){
        // Error if nothing is sent to update
        if(firstName || lastName || password){

            // Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token,phone,function(tokeIsValid){
                if(tokeIsValid){
                    // Lookup the user
                    _data.read('users',phone,function(err,userData){
                        if(!err && userData){
                            // Update the fields necessary
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.hashedPassword = helpers.hash(password);
                            }
                            // Store the new updates
                            _data.update('users',phone,userData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500,{'Error': 'Could not update the user'})
                                }
                            })
                        } else {
                            callback(400,{'Error': 'The specified user does not exist'});
                        }
                    });
                } else { 
                    callback(403,{'Error' : 'Mising required token in header, or token is invalid'});
                }
            });
        } else {
            // 400 is badrequest
            callback(400,{'Error' : 'Missing field to update'})
        }
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};

// Users - delete
// Required field: phone
// @TODO Only let an authenticated user delte their object. Don't let them dellete anyone elses
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data,callback){
    // Check for the phone is valid
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    if(phone){

        // Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokeIsValid){
            if(tokeIsValid){
                _data.read('users',phone,function(err,userData){
                    if(!err && userData){
                        _data.delete('users',phone,function(err){
                            if(!err){
                                // Delete each of the check assocaited with the user
                                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                const checksToDelete = userChecks.length;
                                if(checksToDelete > 0){
                                    let checksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop through the checks
                                    userChecks.forEach(function(checkId){
                                        // Delete the check
                                        _data.delete('checks',checkId,function(err){
                                            if(err){
                                                deletionErrors = true;
                                            }
                                            checksDeleted++;
                                            if(checksDeleted == checksToDelete){
                                                if(!deletionErrors){
                                                    callback(200);
                                                } else {
                                                    callback(500,{'Error' : 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the sytem successfully'})
                                                }
                                            }
                                        })
                                    })
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500,{'Error' : 'Could not delete the spceified user'});
                            }
                        });
                    } else {
                        callback(400,{'Error' :'Could not find the specified user'});
                    }
                });
            } else {
                callback(403,{'Error' : 'Mising required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400,{'Error': 'Missing required field'})
    }
};



//  ************************** TOKENS SERIVCE ******************************************* //

handlers.tokens = function(data, callback){
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function(data,callback){
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(phone && password){
        // Lookup the use who matches tha phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                // Hashed the ssent password and compare it to the password contained in the user object 
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // If valid, create a new token with a random name. Set experiation data one hour in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;  // Expires one hour from current time
                    const tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };
                    console.log(tokenObject)
                    // Store the token
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'Error' : 'Could not create the new token'});
                        }
                    });

                } else {
                    callback(400,{'Error' : 'Password did not match the specified user\'s stored password'})
                }
            } else {
                callback(400,{'Error' : 'Could not find the specified user'});
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }

}; 


// Tokens - get
// Required data : id
// Optional data: none
handlers._tokens.get = function(data,callback){
    // Check that the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
        // Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            // THe arguments 'err' and 'data' on above line come from the invocation of the callback function in the read method for the database, invoked with the arguments "false" and "parsedData", the last one being a JSON string
            if(!err && tokenData){
                callback(200,tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
}; 


// Tokens - put
// Required data: id, extend
// Optinal data: none
handlers._tokens.put = function(data,callback){
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(id && extend){
        // Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // CHeck to make sure the token isn't already expried
                if(tokenData.expires > Date.now()){
                    // Set the expiration an hour form now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                        
                    // Store the new uupdates
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200); 
                        } else {
                            console.log(err)
                            callback(500,{'Error' : 'Could not update the token\'s expiration'})
                        }
                    });
                } else {
                    callback(400,{'Error': 'The token has already expried, and cannot be extended'})
                }
            } else {
                callback(400,{'Error': 'Specified token does not exist'})
            }
        })
    } else {
        callback(400,{'Error': 'Missing required field(s) or field(s) are invalid'})
    }
}; 


// Tokens - delete
// Required data: id
// Optinal data: none
handlers._tokens.delete = function(data,callback){
    // Check that the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
        // Lookup the token
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                _data.delete('tokens',id,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500,{'Error' : 'Could not delete the specified token'});
                    }
                })
            } else {
                callback(400,{'Error' : 'Could not find the specified token'});
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
}; 



// Verify if a given token id is currenlty valid for a given user
handlers._tokens.verifyToken = function(id,phone,callback){
    _data.read('tokens',id,function(err,tokenData){
        if(!err && tokenData){
            // Check that the token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
};


//  ************************** CHECKS SERIVCE ******************************************* //

handlers.checks = function(data, callback){
    const acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._checks[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the checks methods

handlers._checks = {};

// CHeck - post
// Requried data: protocol, url, method, successCodes, timeoutSeconds
// Optinal data: none

handlers._checks.post =function(data,callback){
    // Validate inputs
    const protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        // Get the token form the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Lookup the user by reading the token
        _data.read('tokens',token,function(err,tokenData){
            if(!err && tokenData){
                const userPhone = tokenData.phone;

                // Loooup the user data
                _data.read('users',userPhone,function(err,userData){
                    if(!err && userData){
                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verffiy that the user has less than the number of max-checks-per-user
                        if(userChecks.length < config.maxChecks){
                            // Create a random id for the check
                            const checkId = helpers.createRandomString(20);

                            // Cretae the check object and inlucd ehte user's phone
                            const checkObject = {
                                'id' : checkId,
                                'userPhone' : userPhone,
                                'protocol' : protocol,
                                'url' : url,
                                'method' : method,
                                'successCodes' : successCodes,
                                'timeoutSeconds' : timeoutSeconds
                            };

                            // Persist the object
                            _data.create('checks',checkId,checkObject,function(err){
                                if(!err){
                                    // Add the checkId to the user's boject
                                    userData.checks = userChecks;
                                    userChecks.push(checkId);

                                    // Save the new user data
                                    _data.update('users',userPhone,userData,function(err){
                                        if(!err){
                                            // Return the data about the new check
                                            callback(200,checkObject);
                                        } else {
                                            callback(500,{'Error' : 'Could not update the user with the new check'});
                                        }
                                    })
                                } else {
                                    callback(500,{'Error' : 'Could not create tthe new check'});
                                }
                            });
                        } else {
                            callback(400,{'Error' : 'The suer already has the maximum number of chekcs ('+config.maxChecks+') '})
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                // 403 Not Authorized
                callback(403);
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required inputs, or inputs are invalid'});
    }
};


// Checks - get
// Required data : id
// Optional data : none
handlers._checks.get = function(data,callback){
    // Check that the id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
        // lookup the check
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){
                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                // Verify that the given token is valid and belongs to the user who created the check
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokeIsValid){
                    if(tokeIsValid){
                        // Return the check data
                        callback(200,checkData);
                    } else {
                        // 403 Forbidden
                        callback(403);
                    }
                });
            } else {
                // 404 Not found
                callback(404)
            }
        });
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};


// Checks - put
// Required data : id
// Optional data : protoncol. url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = function(data,callback){
    // Check for the required field
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    // Check for the opttional fields
    const protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    // CHeck to make sure id is valid
    if(id){
        // CHeck to make sure one or more optinal fields has been sent
        if (protocol || url || method || successCodes || timeoutSeconds){
            // Lookup the chekc
            _data.read('checks',id,function(err,checkData){
                if(!err && checkData){
                    // Get the token from the headers
                    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    // Verify that the given token is valid and belongs to the user who created the check
                    handlers._tokens.verifyToken(token,checkData.userPhone,function(tokeIsValid){
                        if(tokeIsValid){
                            // Update the check where necessary
                            if(protocol) {
                                checkData.protocol = protocol;
                            }
                            if(url){
                                checkData.url = url;
                            }
                            if(method){
                                checkData.method = method;
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes;
                            }
                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            // Store the new update
                            _data.update('checks',id,checkData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    callback(500,{'Error': 'Could not update the check'})
                                }
                            })
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400,{'Error' : 'CHeck ID did not exist'});
                }
            })
        } else {
            callback(400,{'Error' : 'Mssing fileds to update'});
        }
    } else {
        callback(400,{'Error' : 'Missing required field'});
    }
};


// Checks - delete
// Required data : id
// Optional data : none
handlers._checks.delete = function(data,callback){
    // Check for the id is valid
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    if(id){

        // Lookup the check
        _data.read('checks',id,function(err,checkData){
            if(!err && checkData){
                // Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                // Verify that the given token is valid for the phone number
                handlers._tokens.verifyToken(token,checkData.userPhone,function(tokeIsValid){
                    if(tokeIsValid){

                        // Delet ethe check data
                        _data.delete('checks',id,function(err){
                            if(!err){
                                // Lookup the user
                                _data.read('users',checkData.userPhone,function(err,userData){
                                    if(!err && userData){
                                        const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        // Remove the dleted check from the list of checks
                                        const checkPosition = userChecks.indexOf(id);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition,1);
                                            // Re-save the user's data
                                            _data.update('users',checkData.userPhone,userData,function(err){
                                                if(!err){
                                                    callback(200);
                                                } else {
                                                    callback(500,{'Error' : 'Could not delete the user'});
                                                }
                                            });
                                        } else {
                                            callback(500,{'Error' : 'Could not find the check on the user\'s object, so could not remove it'});
                                        }
                                    } else {
                                        callback(500,{'Error' :'Could not find the user who created the check, so could not remove the check fomr the list of checks on the user object'});
                                    } 
                                });
                            } else {
                                callback(500,{'Error' : 'Could not delete the check data'})
                            }
                        });
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403,{'Error' : 'The specified check ID does not exist'})
            }
        })


    } else {
        callback(400,{'Error': 'Missing required field'})
    }
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