const sqlite3 = require('sqlite3').verbose();


class Database {
    constructor() {
        this.db = new sqlite3.Database('../../db_lavachess.db');
        // this.db.serialize(() => {
        // this.db.run("DROP TABLE USERS");
        this.db.run("CREATE TABLE IF NOT EXISTS USERS (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password TEXT NOT NULL,level INTEGER NOT NULL DEFAULT 1, experience INTEGER NOT NULL DEFAULT 0 ,elo INTEGER NOT NULL DEFAULT 1000,connections INTEGER NOT NULL DEFAULT 0,last_login DATETIME DEFAULT CURRENT_TIMESTAMP,games_played INTEGER NOT NULL DEFAULT 0);");
        // });
    }

    getUsers(callback) {
        this.db.all('SELECT * FROM users', callback);
    }

    getUserByEmail = (email) => {
        const sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        return new Promise((resolve, reject) => {
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    getUserById = (id) => {
        const sql = 'SELECT * FROM users WHERE id = ? LIMIT 1';
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    getLeaderboard(callback) {
        this.db.all('SELECT name, elo FROM  users ORDER BY elo DESC LIMIT 5', callback);
    }

    // Insert the user into the database
    insertUser = (name, email, password, level, experience, elo) => {
        const sql = 'INSERT INTO users (name, email, password, level, experience, elo) VALUES (?, ?, ?, ?, ?, ?)';
        return new Promise((resolve, reject) => {
            this.db.run(sql, [name, email, password, level, experience, elo], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, name, email });
                }
            });
        });
    };

    // Update the user's ELO by ID
    updateUserElo = (id, elo) => {
        console.log("UPDATE users SET elo ", id, elo)
        const sql = 'UPDATE users SET elo = ? WHERE id = ?';
        return new Promise((resolve, reject) => {
            this.db.run(sql, [elo, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id, elo });
                    } else {
                        reject(new Error(`User with ID ${id} not found`));
                    }
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