/*
* CLI-related tasks
*
*/

// Dependencies
let readLine = require('readline');
let util = require('util');
let debug = util.debuglog('cli');
let events = require('events');
const { read } = require('./data');
class _events extends events{};
let e = new _events();
let os = require('os');
let v8 = require('v8');
let _data = require('./data');
let _logs = require('./logs');
let helpers = require('./helpers');
const childProcess = require('child_process');

// Instatiate the CLI module object
let cli = {};


// Input handlers
e.on('man',function(){
    cli.responders.help();
});

e.on('help',function(){
    cli.responders.help();
});

e.on('exit',function(str){
    cli.responders.exit();
});

e.on('stats',function(str){
    cli.responders.stats();
});

e.on('list users',function(){
    cli.responders.listUsers();
});

e.on('more user info',function(str){
    cli.responders.moreUserInfo(str);
});

e.on('list checks',function(str){
    cli.responders.listChecks(str);
});

e.on('more check info',function(str){
    cli.responders.moreCheckInfo(str);
});

e.on('list logs',function(){
    cli.responders.listLogs();
});

e.on('more log info',function(str){
    cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};



// Help / Man
cli.responders.help = function(){
    let commands = {
        'exit': 'Kill the CLI (and the rest of the application)',
        'man': 'Soow this help page',
        'help': 'Alias of the "man" command',
        'stats': 'Get statitics on the underlying operating system and resource utilization',
        'list users': 'Show a list of all the registered (undeleted) users in the system',
        'more user info --{userId}': 'Show details of a specific user',
        'list chekcs --up --down': 'Show alit of all the active checks in the system, including their state. The "--up" and the "--down" flags are both optional',
        'more check info --{checkId}': 'Show details of a specified check',
        'list logs': 'Show a list of all the log files available to be read (compressed only)',
        'more log info --{fileNmae}': 'Show details of a specified log file'
    };

    // SHow a header for the help age that is as die as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show eaach command, followed by its explation in white and yellow, respectively
    for(let key in commands){
        if(commands.hasOwnProperty(key)){
            let value = commands[key];
            let line = '      \x1b[33m '+key+'      \x1b[0m';
            let padding = 80 - line.length;
            for(i = 0; i < padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // End with another horizontal line
    cli.horizontalLine();
};

// Cretae a vertical space
cli.verticalSpace = function(lines){
    lines = typeof(lines) == 'number' && lines.length > 0 ? lines : 1;
    for(i = 0; i < lines; i++){
        console.log('');
    }
};

// Create a horizontal lines across the screen
cli.horizontalLine = function(){
    // Get the available screen size
    let width = process.stdout.columns;

    let line = '';
    for(i = 0; i < width; i++){
        line+='-';
    }
    console.log(line);
};


// Create centered text on the screen
cli.centered = function(str){
    str = typeof(str) == 'string' && str.trim().length >  0 ? str.trim() : '';

    // Get the available screen size
    let width = process.stdout.columns;

    // Calculate the left padding there should be
    let leftPadding = Math.floor((width - str.length) / 2);

    // Put in left padded spcaes beefore the string itseflf
    let line = '';
    for(i = 0; i< leftPadding; i++){
        line+=' ';
    }
    line+= str;
    console.log(line);
};



// Exit
cli.responders.exit = function(){
    process.exit(0);
};

// Stats
cli.responders.stats = function(){
    // Compoile an object of stats
    let stats = {
        'Load Average' : os.loadavg().join(' '),
        'CPU Count' : os.cpus().length,
        'Free Memory' : os.freemem(),
        'Currrent Malloced Memory' : v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100) ,
        'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
        'Uptime' : os.uptime()+' Seconds '
    };
 
    // Create a header for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show eaach command, followed by its explation in white and yellow, respectively
    for(let key in stats){
        if(stats.hasOwnProperty(key)){
            let value = stats[key];
            let line = '      \x1b[33m '+key+'      \x1b[0m';
            let padding = 80 - line.length;
            for(i = 0; i < padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // End with another horizontal line
    cli.horizontalLine();


};

// List users
cli.responders.listUsers = function(){
    _data.list('users',function(err,userIds){
        if(!err && userIds && userIds.length > 0){
            cli.verticalSpace(); 
            userIds.forEach(function(userId){
                _data.read('users',userId,function(err,userData){
                    if(!err && userData){
                        let line = 'Name: '+userData.firstName+' '+userData.lastName+' '+userData.phone+' Checks: ';
                        let numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
                        line+=numberOfChecks;
                        console.log(line);
                        cli.verticalSpace(); 
                    }
                });
            });
        }
    });
};

// More user info
cli.responders.moreUserInfo = function(str){
    // Get the id from the string 
    let arr = str.split('--');
    let userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(userId){
        // Lookup the user
        _data.read('users',userId,function(err, userData){
            if(!err && userData){
                // Remove the hased password
                delete userData.hashedPassword;

                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(userData,{'color' : true});
                cli.verticalSpace(); 
            }
        });
    }
};

// List checks
cli.responders.listChecks = function(str){
    _data.list('checks',function(err,checkIds){
        if(!err && checkIds && checkIds.length > 0){
            cli.verticalSpace();
            checkIds.forEach(function(checkId){
                _data.read('checks',checkId,function(err,checkData){
                    if(!err && checkData){
                        // let includeCheck = false;
                        let lowerString = str.toLowerCase();
                        // Get the state, default to down
                        let state = typeof(checkData.state) == 'string' ? checkData.state : 'down';
                        // Get the state default to unkonw
                        let stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';
                        // If the suer has specified the state or hasn't specified any state, include the current check accordingly
                        if((lowerString.indexOf('--'+state) > -1) || (lowerString.indexOf('--down') == -1 && lowerString.indexOf('--up') == -1)) {
                            let line = 'ID: '+checkData.id+' '+checkData.method.toUpperCase()+' '+checkData.protocol+'://'+checkData.url+' State: '+stateOrUnknown;
                            console.log(line);
                            cli.verticalSpace();
                        }
                    }
                })
            })
        }
    })
};

// More check info
cli.responders.moreCheckInfo = function(str){
    // Get the id from the string 
    let arr = str.split('--');
    let checkId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(checkId){
        // Lookup the check
        _data.read('checks',checkId,function(err, checkData){
            if(!err && checkData){
                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(checkData,{'color' : true});
                cli.verticalSpace(); 
            }
        });
    }
};

// List logs
// cli.responders.listLogs = function(){
//     _logs.list(true,function(err,logFileNames){
//         if(!err && logFileNames && logFileNames.length > 0){
//             cli.verticalSpace();
//             logFileNames.forEach(function(logFileName){
//                 if(logFileName.indexOf('-') > -1){
//                     console.log(logFileName);
//                     cli.verticalSpace();
//                 }
//             });
//         }
//     });
// };
cli.responders.listLogs = function(){
    let ls = childProcess.spawn('ls',['./.logs/']);
    ls.stdout.on('data',function(dataObject){
        // Explode into separate lines
        let dataStr = dataObject.toString();
        let logFileNames = dataStr.split('\n');
        cli.verticalSpace();
        logFileNames.forEach(function(logFileName){
            if(typeof(logFileName) == 'string' && logFileName.length > 0 && logFileName.indexOf('-') > -1){
                console.log(logFileName.trim().split('.')[0]);
                cli.verticalSpace();
            }
        });
    });
};



// More log info
cli.responders.moreLogInfo = function(str){
    // Get the id from the string 
    let arr = str.split('--');
    let logFileName = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(logFileName){
        cli.verticalSpace();
        // Decompress the log
        _logs.decompress(logFileName,function(err,strData){
            if(!err && strData){
                // Split into lines
                let arr = strData.split('\n');
                arr.forEach(function(jsonString){
                    let logObject = helpers.parseJsonToObject(jsonString);
                    if(logObject && JSON.stringify(logObject) !== '{}'){
                        console.dir(logObject,{'colors' : true});
                        cli.verticalSpace();
                    }
                });
            }
        })
    }
};



// Input processor
cli.processInput = function(str){
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
    // Only process the input if the user actually wrote something. Otherwise ignore it
    if(str){
        // Codify the unique strings that identify the unique questions allowed to be asked
        let uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // Go through the possible inputs and emit an event when a match is found
        let matchFound = false;
        let counter = 0;
        uniqueInputs.some(function(input){
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                // Emit an event matching the unique input, and include the full string given by the user
                e.emit(input,str);
                return true;
            }
        });
 
        // If no match is found, tell the user to try again
        if(!matchFound){
            console.log('Sorry, try again');
        }
    }
};

// Init script
cli.init = function(){
    // Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m',"The CLI is running ");

    // Sstart the interface
    let _interface = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line',function(str){
        // Send to the input processor
        cli.processInput(str);

        // Reinitialze the prompt aftrwards
        _interface.prompt();
    });

    // If the user stops the CLI, kill the associated process
    _interface.on('close',function(){
        process.exit(0);
    });

};


// Export the module
module.exports = cli;