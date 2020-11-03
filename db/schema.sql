/* Schema for SQL database/table */
DROP DATABASE IF EXISTS employee_management_db;

/* Create database */
CREATE DATABASE employee_management_db;
USE employee_management_db;

/* Employee table with a primary key that auto-increments, with links to role and manager */
CREATE TABLE employee(
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL REFERENCES `role`(id), 
  manager_id INT REFERENCES employee(id), 
  PRIMARY KEY(id)
);

/* Role table with a primary key that auto-increments, with links to relevant department */
CREATE TABLE `role`(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2),
  department_id INT REFERENCES department(id),
  PRIMARY KEY(id)
);

/* Department table with a primary key that auto-increments */
CREATE TABLE department(
  id INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(30) NOT NULL,
  PRIMARY KEY(id)
);