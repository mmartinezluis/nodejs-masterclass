/*
 * Example REPL server
 * Take in the word "fizz" and log out "buzz"
 *
 */

// Dependnecies     REPL = Read, Eval, Print, Loop
const  repl = require('repl');

// Start the REPL
repl.start({
    'prompt' : '>',
    'eval' : function(str){
        // Evaluation function for incoming inputs
        console.log("At the evaluation stage: ",str);

        // If the user said "Fizz", SAY "Buzz" to them
        if(str.indexOf('fizz') > -1){
            console.log('buzz');
        }
    }
});