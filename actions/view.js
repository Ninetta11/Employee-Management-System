const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = require('./connection');
const index = require('./index');

// displays all employees 
const allEmployees = () => {
    connection.query
        ("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, manager_id FROM employee, role, department WHERE employee.role_id = role.id AND role.department_id = department.id", function (err, res) {
            if (err) throw err;
            //matches manager id with employees and returns full name if manager exists
            for (var i = 0; i < res.length; i++) {
                if (res[i].manager_id === null) {
                    res[i].manager = "No Manager";
                }
                else {
                    let managerId = res[i].manager_id;
                    let manager = res.find((employee) => employee.id === managerId);
                    let managerName = manager.first_name + " " + manager.last_name;
                    res[i].manager = managerName;
                }
                delete res[i].manager_id;
            }
            console.table("All Employees", res);
            index.start();
        })
}

// displays employees by department
const employeesByDepartment = () => {
    // returns all current departments from database
    connection.query("SELECT department.name FROM department", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                message: "Which Department would you like to view?",
                name: "selection",
                choices: res
            }
        ]).then(function (response) {
            // displays employees from department based on user selection
            connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee, role, department WHERE employee.role_id = role.id AND role.department_id = department.id AND department.name ="${response.selection}"`, function (err, res) {
                if (err) throw err;
                // checks for employees and returns response accordingly
                if (res.length === 0) {
                    console.log(`\n${response.selection} does not have any employees \n`);
                }
                else {
                    console.log(`\n${response.selection}\n`);
                    console.table(res);
                }
                index.start();
            })
        })
    })
};

// displays employees by manager
const employeesByManager = () => {
    // displays all managers from database for user selection
    connection.query(`SELECT employee.first_name, employee.last_name FROM employee WHERE employee.manager_id IS NULL`, function (err, res) {
        let managers = [];
        for (var i = 0; i < res.length; i++) {
            managers.push(res[i].first_name + " " + res[i].last_name);
        }
        if (err) throw err;
        // asks user for manager selection
        inquirer.prompt([
            {
                type: "list",
                message: "Which managers team would you like to view?",
                name: "selection",
                choices: managers
            }
        ]).then(function (response) {
            // displays employees by manager based on user selection
            let selectedManager = response.selection.split(" ");
            connection.query(`SELECT employee.id FROM employee WHERE employee.first_name = "${selectedManager[0]}" AND employee.last_name = "${selectedManager[1]}"`, function (err, res) {
                if (err) throw err;
                connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee, role WHERE employee.manager_id = "${res[0].id}" AND employee.role_id = role.id`, function (err, res) {
                    if (err) throw err;
                    // checks for employees and returns response accordingly
                    if (res.length === 0) {
                        console.log(`\n${selectedManager[0]} ${selectedManager[1]} does not have any employees \n`);
                    }
                    else {
                        console.log(`\n${response.selection}'s team\n`);
                        console.table(res);
                    }
                    index.start();
                })
            })
        })
    })
}

exports.allEmployees = allEmployees;
exports.employeesByDepartment = employeesByDepartment;
exports.employeesByManager = employeesByManager;