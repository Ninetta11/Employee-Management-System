const mysql = require("mysql");
const inquirer = require("inquirer");
const connection = require('./connection');
const index = require('./index');

// enables user to add a new employee
const employee = () => {
    let employees = ["No Manager"];
    let roles = ["Add New Role"];
    // queries all existing employees from database to pre-fill manager selection
    connection.query(`SELECT employee.first_name, employee.last_name FROM employee`, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            employees.push(res[i].first_name + " " + res[i].last_name);
        }
    });
    // queries all existing roles from database to pre-fill role selection
    connection.query(`SELECT role.title FROM role`, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            roles.push(res[i].title);
        }
    });
    // queries user for new employee information
    inquirer.prompt([
        {
            type: "input",
            message: "What is their first name?",
            name: "firstname",
            // The users input must be alphabetic
            validate: val => /^[A-Za-z\s]+$/.test(val)
        },
        {
            type: "input",
            message: "What is their last name?",
            name: "lastname",
            // The users input must be alphabetic
            validate: val => /^[A-Za-z\s]+$/.test(val)
        },
        {
            type: "list",
            message: "Select their Manager",
            name: "manager",
            choices: employees
        },
        {
            type: "list",
            message: "Select their Role",
            name: "role",
            choices: roles
        }
    ]).then(function (response) {
        // if new role needs to be created for new employee, add role function activated
        if (response.role === "Add New Role") {
            console.log("Please add new role prior to adding new Employee");
            role();
        }
        else {
            // returning role id from database for role selected
            connection.query(`SELECT role.id FROM role WHERE role.title = "${response.role}"`, function (err, res) {
                if (err) throw err;
                let roleId = res[0].id;
                // if new employee has no manager, adding employee to database without managerId
                if (response.manager === "No Manager") {
                    connection.query(
                        "INSERT INTO employee SET ?",
                        {
                            first_name: response.firstname,
                            last_name: response.lastname,
                            role_id: roleId
                        },
                        function (err, res) {
                            if (err) throw err;
                            console.log("New Staff Member added\n");
                            index.start();
                        })
                }
                else {
                    // returning manager id from database from user selection
                    let selectedManager = response.manager.split(" ");
                    connection.query(`SELECT employee.id FROM employee WHERE employee.first_name = "${selectedManager[0]}" AND employee.last_name = "${selectedManager[1]}"`, function (err, res) {
                        if (err) throw err;
                        let managerId = res[0].id;
                        // adding new employee data to database
                        connection.query(
                            "INSERT INTO employee SET ?",
                            {
                                first_name: response.firstname,
                                last_name: response.lastname,
                                manager_id: managerId,
                                role_id: roleId
                            },
                            function (err, res) {
                                if (err) throw err;
                                console.log("New Staff Member added\n");
                                index.start();
                            })

                    });
                };
            });
        };
    })
}

// enables user to add a role
const role = () => {
    let role = "";
    inquirer.prompt([
        {
            type: "input",
            name: "role",
            message: "Enter the title of the role you would like to add"
        }
    ]).then(function (response) {
        connection.query('SELECT role.title FROM role', function (err, res) {
            if (err) throw err;
            if (res.some((role) => role.title === response.role)) {
                console.log("\nThis role already exists\n");
                index.start();
            }
            else {
                role = response.role;
                let departmentList = ["Add New Department"];
                connection.query(`SELECT department.name FROM department`, function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        departmentList.push(res[i].name);
                    }
                });
                inquirer.prompt([
                    {
                        type: "input",
                        name: "salary",
                        message: "What is the annual salary of this Role?",
                        // The users input must be numeric
                        validate: val => /^\d+$/.test(val)
                    },
                    {
                        type: "list",
                        message: "Select the Department for this role",
                        name: "department",
                        choices: departmentList
                    }
                ]).then(function (response) {
                    if (response.department === "Add New Department") {
                        console.log("Please add new Department prior to adding new role");
                        department();
                    }
                    else {
                        connection.query(`SELECT id FROM department WHERE department.name = "${response.department}"`,
                            function (err, res) {
                                if (err) throw err;
                                connection.query(
                                    "INSERT INTO role SET ?",
                                    {
                                        title: role,
                                        salary: response.salary,
                                        department_id: res.id
                                    },
                                    function (err, res) {
                                        if (err) throw err;
                                        console.log("New Role added\n");
                                        index.start();
                                    })
                            });
                    }
                })
            }
        })
    })
}

// enables user to add a department
const department = () => {
    // asks user for name of new department
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "Enter the name of the department you would like to add"
        }
    ]).then(function (response) {
        // checks if department already exists
        connection.query('SELECT department.name FROM department', function (err, res) {
            if (err) throw err;
            // if department already exists, alerts user and ceases function
            if (res.some((department) => department.name === response.department)) {
                console.log("\nThis department already exists\n");
                index.start();
            }
            else {
                // adds department to database
                connection.query(
                    "INSERT INTO department SET ?",
                    {
                        name: response.department
                    },
                    function (err, res) {
                        if (err) throw err;
                        console.log("\nNew Department added\n");
                        index.start();
                    })
            }
        })
    })
}

exports.employee = employee;
exports.role = role;
exports.department = department;