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

e.on('list chekcs',function(str){
    cli.responders.listChecks(str);
});

e.on('more check info',function(str){
    cli.responders.moreCheckInfo(str);
});

e.on('list logs',function(str){
    cli.responders.listLogs();
});

e.on('more log info',function(str){
    cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};



// Help / Man
cli.responders.help = function(){
    console.log('You asked for help');
};
 
// Exit
cli.responders.exit = function(){
    process.exit(0);
};

// Stats
cli.responders.stats = function(){
    console.log('You asked for stats');
};

// List users
cli.responders.listUsers = function(){
    console.log('You asked to list users');
};

// More user info
cli.responders.moreUserInfo = function(str){
    console.log('You asked for more user info',str);
};

// List checks
cli.responders.listChecks = function(str){
    console.log('You asked to list checks',str);
};

// More check info
cli.responders.moreCheckInfo = function(str){
    console.log('You asked for more check info',str);
};

// List logs
cli.responders.listLogs = function(){
    console.log('You asked to list logs');
};

// More log info
cli.responders.moreLogInfo = function(str){
    console.log('You asked for more log info',str);
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
            'list chekcs',
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