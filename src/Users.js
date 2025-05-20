// Initialise functions in db.js file
const db = require("./db");

// Initialise framework for encryption
const bcrypt = require("bcryptjs");

// create the a class for the user

class User {

    // id of user
    id;

    // email of user
    email;

    // specify constructor for email of the user
    constructor(email) {
        console.log("", email)
        this.email = email;
        console.log(this.email)
    }



    // Check database to see if this user already exists
    async getIDfromEmail() {
        var sql = "SELECT user_id FROM users WHERE users.email = ?";
        const result = await db.query(sql, [this.email]);
        console.log("RESULTS FROM getIDfromEmail", result);
        // Error checks
        // Check the returned array is not empty
        if (JSON.stringify(result) != '[]') {
            this.id = result[0].id;
            return this.id;
        }
        else {
            return false;
        }
    }

    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        console.log("user password set: ", pw);
        // Post the new password to the database
        var sql = "UPDATE users SET password = ? WHERE Users.id = ?"
        const result = await db.query(sql, [pw, this.id]);
        console.log("Result from password setUserPassword", result)
        return true;
    }

    async addUser(params) {
        const pw = await bcrypt.hash(params.password, 10);
        console.log("Password in addUser :", pw);
    
        const sql = "INSERT INTO users (firstname, lastname, email, password, phone_number) VALUES (?, ?, ?, ?, ?)";
    
        // Replace undefined values with null to avoid MySQL errors
        const values = [
            params.firstname,
            params.lastname,
            params.email,          
            pw,
            params.phone_number || null
        ];
    
        const result = await db.query(sql, values);
        console.log("Result from addUser: ", result);
    
        return true;
    }
    
    async authenticate(password) {
        //compare the stored hash password of the user with the hash of the current password input
        var sql = "SELECT password FROM users WHERE id = ?";
        const result = db.query(sql, [this.id]);
        console.log("Result from authenticate", result);
        const match = await bcrypt.compare(password, result[0].password);
        if (match == true) {
            return true;
        }
        else {
            return false;
        }
    }

}

module.exports = {
    User
}