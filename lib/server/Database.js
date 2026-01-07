const { createClient } = require('@supabase/supabase-js');
const config = require("../../config");

class Database {
    constructor() {
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
    }

    // SQLite's all() callback signature: (err, rows) => void
    getUsers(callback) {
        this.supabase
            .from('users')
            .select('*')
            .then(({ data, error }) => {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, data);
                }
            });
    }

    getUserByEmail = (email) => {
        return new Promise((resolve, reject) => {
            this.supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        // Supabase returns error for no rows, but our app might expect null
                        if (error.code === 'PGRST116') { // JSON object requested, multiple (or no) rows returned
                            resolve(null);
                        } else {
                            reject(error);
                        }
                    } else {
                        resolve(data);
                    }
                });
        });
    };

    getUserById = (id) => {
        return new Promise((resolve, reject) => {
            this.supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                });
        });
    };

    // SQLite's all() callback signature: (err, rows) => void
    getLeaderboard(callback) {
        this.supabase
            .from('users')
            .select('name, elo')
            .order('elo', { ascending: false })
            .limit(5)
            .then(({ data, error }) => {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, data);
                }
            });
    }

    // Insert the user into the database
    insertUser = (name, email, password, level, experience, elo) => {
        return new Promise((resolve, reject) => {
            this.supabase
                .from('users')
                .insert([
                    { name, email, password, level, experience, elo }
                ])
                .select()
                .single()
                .then(({ data, error }) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data); // Supabase returns the inserted object
                    }
                });
        });
    };

    // Update the user's ELO by ID
    updateUserElo = (id, elo) => {
        console.log("UPDATE users SET elo ", id, elo)
        return new Promise((resolve, reject) => {
            this.supabase
                .from('users')
                .update({ elo: elo })
                .eq('id', id)
                .select()
                .then(({ data, error }) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (data && data.length > 0) {
                            resolve({ id, elo });
                        } else {
                            reject(new Error(`User with ID ${id} not found`));
                        }
                    }
                });
        });
    };
}

module.exports = new Database();