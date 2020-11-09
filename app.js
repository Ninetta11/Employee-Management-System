const cTable = require("console.table");
const logo = require('asciiart-logo');
const config = require('./package.json');
const connection = require('./actions/connection');
const index = require('./actions/index');


class App {
    constructor() {
        connection.connect(function (err) {
            if (err) throw err;
            console.log("connected as id " + connection.threadId);
        })
    }

    // initiates program
    init() {
        // renders app title
        console.log(logo(config).render());
        // activates user questions
        index.start();
    }
}

const app = new App();
app.init();