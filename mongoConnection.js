const MongoClient = require("mongodb").MongoClient;
const settings = require("./settings");
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

async function connection() 
{
    if (!_connection) 
    {
        _connection = await MongoClient.connect(mongoConfig.serverUrl, { useNewUrlParser: true });
        _db = await _connection.db(mongoConfig.database);
    }
    
    return _db;
}

module.exports = { connection }
