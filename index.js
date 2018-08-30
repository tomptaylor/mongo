const co = require('co');
const mongoose = require('mongoose');

let conn = null;

const uri = 'mongodb://stacy:stacygirl@ds035607.mlab.com:35607/testtom';

// Make multiple table request via context
// node
// var t = require('./index.js')
// t.handler(null, {"table":"notes"}, ()=>{} )
// t.handler(null, {"table":"users"}, ()=>{} )

exports.handler = function(event, context, callback) {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;
    
  run(context).
    then(res => {
      callback(null, res);
      console.log('done');
    }).
    catch(error => callback(error));
};

function run(context) {
    console.log('start', conn);

    return co(function*(conn) {
    // Because `conn` is in the global scope, Lambda may retain it between
    // function calls thanks to `callbackWaitsForEmptyEventLoop`.
    // This means your Lambda function doesn't have to go through the
    // potentially expensive process of connecting to MongoDB every time.
    if (conn == null) {
        console.log('conn');
      conn = yield mongoose.createConnection(uri, {
        // Buffering means mongoose will queue up operations if it gets
        // disconnected from MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0,
        useNewUrlParser: true 
      });
      conn.model(context.table, new mongoose.Schema({ name: String }));
    }

    var M = conn.model(context.table);
   // console.log(M);
    

    const doc = yield M.findOne();
    console.log(doc);

    return doc;
  });
}