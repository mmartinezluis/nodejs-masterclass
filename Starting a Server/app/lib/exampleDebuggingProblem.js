/*
 *  Library that demonstrates something throwing when it's init() is called
*/


// Container for the module
let example = {};


// Init function
example.init = function(){
    // This is an error created intentionally (but is not defined)
    let foo = bar;
};

// Export the module
module.exports = example;

