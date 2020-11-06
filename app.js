const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const logo = require('asciiart-logo');
const config = require('./package.json');

// creates connection with database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Universe11)(",
    database: "employee_management_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
})

// activates questions for user selection of action
function start() {
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
                viewAllEmployees();
                break;
            case "View Employees by Department":
                viewEmployeesByDepartment();
                break;
            case "View Employees by Manager":
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
            start();
        })
}

// displays employees by department
function viewEmployeesByDepartment() {
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
                start();
            })
        })
    })
};

// displays employees by manager
function viewEmployeesByManager() {
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
                    start();
                })
            })
        })
    })
}

// enables user to add a new employee
function addEmployee() {
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
            addRole();
        }
        else {
            // returning role id from database for role selected
            connection.query(`SELECT role.id FROM role WHERE role.title = "${response.role}"`, function (err, res) {
                if (err) throw err;
                let roleId = res[0].id;
                // if new employee has no manager, adding employee to database without managerId
                if (response.manager === "No Manager") {
                    addEmployeeToDatabase(response.firstname, response.lastname, roleId);
                }
                else {
                    // returning manager id from database from user selection
                    let selectedManager = response.manager.split(" ");
                    connection.query(`SELECT employee.id FROM employee WHERE employee.first_name = "${selectedManager[0]}" AND employee.last_name = "${selectedManager[1]}"`, function (err, res) {
                        if (err) throw err;
                        let managerId = res[0].id;
                        addEmployeeToDatabase(response.firstname, response.lastname, managerId, roleId);
                    });
                };
            });
        };
    })
}

// adding new employee data to database
function addEmployeeToDatabase(firstname, surname, roleId, managerId) {
    connection.query(
        "INSERT INTO employee SET ?",
        {
            first_name: firstname,
            last_name: surname,
            manager_id: managerId,
            role_id: roleId
        },
        function (err, res) {
            if (err) throw err;
            console.log("New Staff Member added\n");
            start();
        })
}

// enables user to delete an employee 
function removeEmployee() {
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
                        start();
                    })
                } else {
                    console.log("\nNo records have been deleted\n")
                }
            })
        })
    });
}

// enables user to update an employee role
function updateEmployeeRole() {
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
                            addRole();
                        }
                        else {
                            // updates role to database
                            let newRole = roles.find(role => role.title === response.role);
                            connection.query(`UPDATE employee SET employee.role_id = "${newRole.id}" WHERE employee.id = "${updateEmployee.id}"`, function (err, res) {
                                if (err) throw err;
                                console.log("\nEmployee role successfully updated\n");
                                start();

                            })
                        }
                    })
                })
            })
        })
}


// enables user to update an employee manager
function updateEmployeeManager() {
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
                let index = employeeNames.indexOf(response.employee);
                index > -1 ? employeeNames.splice(index, 1) : false;
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
                        start();
                    })
                })
            })
        })
}

// enables user to add a role
function addRole() {
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
                start();
            }
            else {
                role = response.role;
                let department = ["Add New Department"];
                connection.query(`SELECT department.name FROM department`, function (err, res) {
                    if (err) throw err;
                    for (var i = 0; i < res.length; i++) {
                        department.push(res[i].name);
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
                        choices: department
                    }
                ]).then(function (response) {
                    if (response.department === "Add New Department") {
                        console.log("Please add new Department prior to adding new role");
                        addDepartment();
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
                                        start();
                                    })
                            });
                    }
                })
            }
        })
    })
}

// enables user to add a department
function addDepartment() {
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
                start();
            }
            else {
                // adds department to database
                connection.query(
                    "INSERT INTO department SET ?",
                    {
                        name: response,
                    },
                    function (err, res) {
                        if (err) throw err;
                        console.log("New Department added\n");
                        start();
                    })
            }
        })
    })
}

// ceases program
function quit() {
    connection.end();
}

// initiates program
function init() {
    // renders app title
    console.log(logo(config).render());
    // activates user questions
    start();
}

init();