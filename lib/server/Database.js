const sqlite3 = require('sqlite3').verbose();


class Database {
    constructor() {
        this.db = new sqlite3.Database('../../db_lavachess.db');
    }

    getUsers(callback) {
        this.db.all('SELECT * FROM users', callback);
    }


// Open the database


// db.serialize(() => {
//     // db.run("DROP TABLE USERS");
//     db.run("CREATE TABLE IF NOT EXISTS USERS (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,connections INTEGER NOT NULL DEFAULT 0,last_login DATETIME DEFAULT CURRENT_TIMESTAMP,games_played INTEGER NOT NULL DEFAULT 0,rank INTEGER NOT NULL DEFAULT 0);");
// });

//  db.close();
// const getUsers = () => {
//     db.all('SELECT * FROM users', (err, rows) => {
//         if (err) {
//             res.send({ error: err.message });
//         } else {
//             res.send({ data: rows });
//         }
//     });
// }
// Insert the user into the database
insertUser = (name, email, password) => {
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
        this.db.run(sql, [name, email, password], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, name, email });
            }
        });
    });
};

// Close the database when the process is exited
// process.on('exit', () => {
//     db.close();
// });

}
module.exports = new Database();