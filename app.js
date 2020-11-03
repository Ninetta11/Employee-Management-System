const mysql = require("mysql");
const inquirer = require("inquirer");

// creates connection with database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_management_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});

// activates questions for user selection of action
function start() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "selection",
            choices: [
                "View all Employees",
                "View all Employees by Department",
                "View all Employees by Manager",
                "Add Employee",
                "Remove Employee",
                "Update Employee Role",
                "Update Employee Manager",
                "Add Role",
                "Add Department",
                "Quit"
            ]
        }
    ]).then(function (response) {
        // activates action based on user selection
        switch (response.selection) {
            case "View all Employees":
                viewAllEmployees();
                break;
            case "View all Employees by Department":
                viewEmployeesByDepartment();
                break;
            case "View all Employees by Manager":
                viewEmployeesByManager();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
                break;
            case "Add Role":
                addRole();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Quit":
                quit();
                break;
        }
    })
}

// displays all employees 
function viewAllEmployees() {
    // required
}

// displays employees by department
function viewEmployeesByDepartment() {
    // required
}

// displays employees by manager
function viewEmployeesByManager() {

}

// enables user to add a new employee
function addEmployee() {
    // required
}

// enables user to delete an employee 
function removeEmployee() {

}

// enables user to update an employee role
function updateEmployeeRole() {
    // required
}

// enables user to update an employee manager
function updateEmployeeManager() {

}

// enables user to add a role
function addRole() {
    // required
}

// enables user to add a department
function addDepartment() {
    // required
}

function quit() {

}