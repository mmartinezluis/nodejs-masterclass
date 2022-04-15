/*
 * Unit Tests
 */

// Dependencies
let helpers = require('../lib/helpers');
let assert = require('assert');
let logs = require('./../lib/logs');
let exampleDebuggingProblem = require('../lib/exampleDebuggingProblem');

// Hodler for the tests
let unit = {};

// Assert tha the getANumber function is returning a number
unit['helpers.getANumber should return a number'] = function(done){
    let val = helpers.getANumber();
    assert.equal(typeof(val),'number');
    done();  
};

// Assert tha the getANumber function is returning 1
unit['helpers.getANumber should return 1'] = function(done){
    let val = helpers.getANumber();
    assert.equal(val,1);
    done();
};

// Assert tha the getANumber function is returning 2
unit['helpers.getANumber should return 2'] = function(done){
    let val = helpers.getANumber();
    assert.equal(val,2);
    done();
};

// Logs.list should callback an array and a false error
unit['logs.list should called back a false error and  an array of log names'] = function(done){
    logs.list(true,function(err,logFileNames){
        assert.equal(err,false);
        assert.ok(logFileNames instanceof Array)
        assert.ok(logFileNames.length > 1);
        done();
    });
};

// Logs.truncate should ont throw is the logId desn't exist
unit['logs.truncate should not throw if the logId does not exits. It should callback an error instead'] = function(done){
    assert.doesNotThrow(function(){
        logs.truncate('I do not exists',function(err){
            assert.ok(err);
            done();
        })
    },TypeError);
};

// exampleDebuggingProblem.init should ont throw (but it does)
unit['exampleDebuggingProblem.init should not throw when called'] = function(done){
    assert.doesNotThrow(function(){
        exampleDebuggingProblem.init();
        done();
    },TypeError);
};


// Export to tests to the runer
module.exports = unit;