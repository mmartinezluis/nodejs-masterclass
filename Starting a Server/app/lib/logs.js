/*
 * Library for storing and rotating logs
 *
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Conatiner for the module
let lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname,'../.logs/');

// Append a string to a file. Craete a file if it does not exists
lib.append = function(file,str,callback){
    // Opening the file for appending
    fs.open(lib.baseDir+file+'.log','a',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Append to the file and close it
            fs.appendFile(fileDescriptor,str+'\n',function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing file that was being appended');
                        }
                    });
                } else {
                    callback('Error appending the file');
                }
            });
        } else {
            callback('Could not opn fil efor appending');
        }
    });
};

// List all the logs, and optinoally include the compressed logs
lib.list = function(includeCompressedLogs,callback){
    fs.readdir(lib.baseDir,function(err,data){
        if(!err && data && data.length > 0){
            let trimmedFileNames = [];
            data.forEach(function(fileName){
                // Add the .log files
                if(fileName.indexOf('.log') > -1){
                    trimmedFileNames.push(fileName.replace('.log',''));
                }

                // Add on the .gzfiles
                if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
                    trimmedFileNames.push(fileName.replace('.gz.b64',''));
                }
            });
            callback(false,trimmedFileNames);
        } else {    
            callback(err,data);
        }
    });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = function(logId,newFileId,callback){
    let sourceFile = logId+'.log';
    let destFile = newFileId+'.gz.64';

    // Read the souce file
    fs.readFile(lib.baseDir+sourceFile,'utf8',function(err,inputString){
        if(!err && inputString){
            // Compress the data using gzip
            zlib.gzip(inputString,function(err,buffer){
                if(!err && buffer){
                    // Send the data to the destination file
                    fs.open(lib.baseDir+destFile,'wx',function(err,fileDescriptor){
                        if(!err && fileDescriptor){
                            //  Write to the destination file
                            fs.writeFile(fileDescriptor,buffer.toString('base64'),function(er){
                                if(!err){
                                    // Close the destination file
                                    fs.close(fileDescriptor,function(err){
                                        if(!err){
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err)
                }
            });
        } else {
            callback(err);
        }
    });
};

// Decompress the contents of a .gz.b64 file into a string variable
lib.decompress = function(fileId,callback){
    let fileName = fileId+'.gz.b64';
    fs.readFile(lib.baseDir+fileName,'utf8',function(err,str){
        if(!err && str){
            // Decompress the data
            let inputBuffer = Buffer.from(str,'base64');
            zlib.unzip(inputBuffer,function(err,outputBuffer){
                if(!err && outputBuffer){
                    // Callback
                    let str = outputBuffer.toString();
                    callback(false,str);
                } else {  
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// Truncating a log file
lib.truncate = function(logId,callback){
    fs.truncate(lib.baseDir+logId+'.log',0,function(err){
        if(!err){
            callback(false);
        } else {
            callback(err);
        }
    });
};

// Exoport the module
module.exports = lib;