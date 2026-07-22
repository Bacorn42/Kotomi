const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}

const db = new Database(path.join(dataDirectory, "kotomi.db"));
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

db.exec(schema);

module.exports = db;
