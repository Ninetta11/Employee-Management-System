const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = require('./connection');
const index = require('./index');

// enables user to delete an employee 
const employee = () => {
    let allEmployees = [];
    let employeeNames = [];
    // queries all existing employees from database to pre-fill employee selection
    connection.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee`, function (err, res) {
        if (err) throw err;
        allEmployees = res;
        for (var i = 0; i < res.length; i++) {
            employeeNames.push(res[i].first_name + " " + res[i].last_name);
        }
        // asks user to select employee they wish to delete
        inquirer.prompt([
            {
                type: "list",
                message: "Which employee would you like to delete?",
                name: "selection",
                choices: employeeNames
            }
        ]).then(function (response) {
            // asks user to confirm they wish to delete selected employee
            let selectedEmployee = response.selection.split(" ");
            let deleteEmployee = allEmployees.find(employee => employee.first_name === selectedEmployee[0] && employee.last_name === selectedEmployee[1]);
            inquirer.prompt([
                {
                    type: "list",
                    message: `Are you sure you want to delete ${response.selection}? This will remove \n ${JSON.stringify(deleteEmployee)} \nfrom the records permanently.`,
                    name: "delete",
                    choices: ["Yes", "No"]
                }
            ]).then(function (response) {
                // deletes selected employee from database
                if (response.delete === "Yes") {
                    connection.query(`DELETE FROM employee WHERE employee.id = "${deleteEmployee.id}"`, function (err, res) {
                        if (err) throw err;
                        console.log(`\n${deleteEmployee.first_name} ${deleteEmployee.last_name} has been deleted from the records\n`)
                        index.start();
                    })
                } else {
                    console.log("\nNo records have been deleted\n")
                    index.start();
                }
            })
        })
    });
}

exports.employee = employee;