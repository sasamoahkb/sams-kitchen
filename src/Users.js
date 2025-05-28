const db = require('./db');
const bcrypt = require("bcryptjs");

class User {
    id;
    email;

    constructor(email) {
        this.email = email;
    }

    async getIDfromEmail() {
        const sql = "SELECT user_id FROM users WHERE email = ?";
        const result = await db.query(sql, [this.email]);
        if (result.length > 0) {
            this.id = result[0].user_id;
            return this.id;
        } else {
            return false;
        }
    }

    async authenticate(inputPassword) {
        if (!this.id) throw new Error("User ID not set. Call getIDfromEmail() first.");
        const sql = "SELECT password FROM users WHERE user_id = ?";
        const result = await db.query(sql, [this.id]);
        if (result.length === 0) return false;
        const match = await bcrypt.compare(inputPassword, result[0].password);
        return match;
    }

    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        const sql = "UPDATE users SET password = ? WHERE user_id = ?";
        await db.query(sql, [pw, this.id]);
        return true;
    }

    async addUser(params) {
        if (!params.firstname || !params.lastname || !params.email || !params.password) {
            throw new Error("Missing required user fields");
        }

        const pw = await bcrypt.hash(params.password, 10);
        const sql = "INSERT INTO users (firstname, lastname, email, password, phone_number) VALUES (?, ?, ?, ?, ?)";
        const values = [
            params.firstname,
            params.lastname,
            params.email,
            pw,
            params.phone_number ?? null
        ];
        await db.query(sql, values);
        return true;
    }
}

module.exports = {
    User
};