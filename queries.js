const Pool = require('pg').Pool;

require('dotenv').config();
const isProduction = process.env.NODE_ENV === 'production';
/// in heroku, all node js applications defaul to NODE_ENV = production !!!


const connectionStringForDevelopment =
    `pstgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionStringForDevelopment,
    ssl: isProduction,
});

const loadAllUsers = (req, res, next) => {
    req.userList = [{name:'dude1',password:'h'},{name:'dude2',password:'y'}];
    pool.query('SELECT * FROM users',(error, result) => {
        if (error) {
            throw error
        }
        req.userList = result.rows;
        next();
    });
};

const createUser = (req, res, next) => {
    pool.query('INSERT INTO users (name, password) VALUES ($1, $2)',[req.name, req.password],(error, result) => {
        if (error) {
            throw error
        }
        next();
    });
};

const loginUser = (req, res, next) => {
    pool.query('SELECT name FROM users WHERE name = $1 AND password = $2',[req.name, req.password],(error, results) => {
        if (error) {
            throw error
        }
        if (results.rows.length > 0) {
            req.success = true;
            req.loggedInName = results.rows[0].name;
            next();
        } else {
            req.success = false;
            next();
        }
    });
};

module.exports = {
    loadAllUsers,
    createUser,
    loginUser
};