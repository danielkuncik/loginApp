const hbs = require('express-hbs');


hbs.registerHelper('listAllUsers',(userList) => {
    let output = "<ul>";
    userList.forEach((user) => {
        output = output + "<li class = 'mb-4'><ul>";
        output = output + `<li>Name: ${user.name}</li>`;
        output = output + `<li>Password: ${user.password}</li>`;
        output = output + "</ul></li>";
    });
    output = output + "</ul>";
    return new hbs.SafeString(output)
});