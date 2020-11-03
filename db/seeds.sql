/* Seeds for SQL table */
USE employee_management_db;

INSERT INTO employee (id, first_name, last_name, role_id)
VALUES ("1", "Stacey", "Robinson", "1"), ("3", "Laura", "Zimmerling", "5"), ("5", "Alisha", "West", "7"), ("6", "Tracey", "Henry", "3");

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES ("2", "Kobe", "Poulter", "2", "1"), ("4", "Sarah", "Ludwell", "6", "3"), ("7", "Misty", "Fuller", "4", "6");

INSERT INTO `role` (id, title, salary, department_id)
VALUES ("1", "Sales Lead", "90000", "3"), ("2", "Salesperson", "60000", "3"), ("3", "Lead Engineer", "95000", "1"), ("4", "Software Engineer", "80000", "1"), ("5", "Lawyer", "70000", "2"), ("6", "Legal Team Lead", "90000", "2"), ("7", "Accountant", "65000", "4");

INSERT INTO department (id, name)
VALUES ("1", "Engineering"), ("2", "Legal"), ("3", "Sales"), ("4", "Finance");

