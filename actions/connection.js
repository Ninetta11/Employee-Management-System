const mysql = require("mysql");

// creates connection with database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_management_db"
});

module.exports = connection;