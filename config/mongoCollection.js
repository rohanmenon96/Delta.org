const dbConnection = require("./mongoConnection");

async function getCollectionFn(collection) 
{
    let _col = undefined;

    if (!_col) 
    {
      const db = await dbConnection.connection();
      _col = await db.collection(collection);
    }

    return _col;
}

module.exports = { getCollectionFn };
