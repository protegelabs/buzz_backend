const mysql = require('mysql');

//create db connection
const db = mysql.createConnection({
    host: "thebuzzapp-db.c5xy5hgjxbug.us-east-1.rds.amazonaws.com",
    user: "admin",
    database: "thebuzz",
    password: "vremudia",
});

db.connect((err) => {
    if (err)
        throw err;
    console.log('db connected')
})

module.exports = db;