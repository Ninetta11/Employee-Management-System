const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = require('./connection');
const index = require('./index');
const add = require('./add');


// enables user to update an employee role
const employeeRole = () => {
    let allEmployees = [];
    let employeeNames = [];
    // queries all existing employees from database to pre-fill employee selection
    connection.query
        ("SELECT employee.id, employee.first_name, employee.last_name FROM employee", function (err, res) {
            if (err) throw err;
            allEmployees = res;
            for (var i = 0; i < res.length; i++) {
                employeeNames.push(res[i].first_name + " " + res[i].last_name);
            }
            // asks user to select employee they wish to delete
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee would you like to update?",
                    name: "employee",
                    choices: employeeNames
                }
            ]).then(function (response) {
                // asks user to select role they wish to update the employee to
                let roleNames = ["Add New Role"];
                connection.query("SELECT role.id, role.title FROM role", function (err, res) {
                    if (err) throw err;
                    let roles = res;
                    for (var i = 0; i < res.length; i++) {
                        roleNames.push(res[i].title);;
                    }
                    let selectedEmployee = response.employee.split(" ");
                    let updateEmployee = allEmployees.find(employee => employee.first_name === selectedEmployee[0] && employee.last_name === selectedEmployee[1]);
                    inquirer.prompt([
                        {
                            type: "list",
                            message: `Which role would you like to update ${selectedEmployee[0]} ${selectedEmployee[1]} to?`,
                            name: "role",
                            choices: roleNames
                        }
                    ]).then(function (response) {
                        if (response.role === "Add New Role") {
                            add.role();
                        }
                        else {
                            // updates role to database
                            let newRole = roles.find(role => role.title === response.role);
                            connection.query(`UPDATE employee SET employee.role_id = "${newRole.id}" WHERE employee.id = "${updateEmployee.id}"`, function (err, res) {
                                if (err) throw err;
                                console.log("\nEmployee role successfully updated\n");
                                index.start();
                            })
                        }
                    })
                })
            })
        })
}

// enables user to update an employee manager
const employeeManager = () => {
    let allEmployees = [];
    let employeeNames = [];
    // queries all existing employees from database to pre-fill employee selection
    connection.query
        ("SELECT employee.id, employee.first_name, employee.last_name FROM employee", function (err, res) {
            if (err) throw err;
            allEmployees = res;
            for (var i = 0; i < res.length; i++) {
                employeeNames.push(res[i].first_name + " " + res[i].last_name);
            }
            // asks user to select employee they wish to update
            inquirer.prompt([
                {
                    type: "list",
                    message: "Which employee would you like to update the manager for?",
                    name: "employee",
                    choices: employeeNames
                }
            ]).then(function (response) {
                let selectedEmployee = response.employee.split(" ");
                let employee = allEmployees.find(employee => employee.first_name === selectedEmployee[0] && employee.last_name === selectedEmployee[1]);
                let i = employeeNames.indexOf(response.employee);
                i > -1 ? employeeNames.splice(i, 1) : false;
                // asks user to select the employee they wish to update as the manager
                inquirer.prompt([
                    {
                        type: "list",
                        message: `Whom is ${selectedEmployee[0]} ${selectedEmployee[1]} new manager?`,
                        name: "manager",
                        choices: employeeNames
                    }
                ]).then(function (response) {
                    let selectedManager = response.manager.split(" ");
                    // updates manager to database
                    let newManager = allEmployees.find(employee => employee.first_name === selectedManager[0] && employee.last_name === selectedManager[1]);
                    connection.query(`UPDATE employee SET employee.manager_id = "${newManager.id}" WHERE employee.id = "${employee.id}"`, function (err, res) {
                        if (err) throw err;
                        console.log("\nEmployee manager successfully updated\n");
                        index.start();
                    })
                })
            })
        })
}

exports.employeeRole = employeeRole;
exports.employeeManager = employeeManager;