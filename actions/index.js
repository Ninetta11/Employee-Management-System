const inquirer = require("inquirer");
const connection = require('./connection');
const view = require('./view');
const add = require('./add');
const remove = require('./remove');
const update = require('./update');

// activates questions for user selection of action
const start = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "selection",
            choices: [
                "View all Employees",
                "View Employees by Department",
                "View Employees by Manager",
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
                view.allEmployees();
                break;
            case "View Employees by Department":
                view.employeesByDepartment();
                break;
            case "View Employees by Manager":
                view.employeesByManager();
                break;
            case "Add Employee":
                add.employee();
                break;
            case "Remove Employee":
                remove.employee();
                break;
            case "Update Employee Role":
                update.employeeRole();
                break;
            case "Update Employee Manager":
                update.employeeManager();
                break;
            case "Add Role":
                add.role();
                break;
            case "Add Department":
                add.department();
                break;
            case "Quit":
                connection.end();
                break;
        }
    })
}

exports.start = start;