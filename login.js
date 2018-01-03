const fs = require("fs");
const login = require("facebook-chat-api");

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var credentials = {email: config.user, password: config.password};

login(credentials, (err, api) => {
    if(err) return console.error(err);

    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
});
