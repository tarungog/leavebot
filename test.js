const fs = require("fs");
const login = require("facebook-chat-api");

login({email: "nimbyest@gmail.com", password: "password12345678910"}, (err, api) => {
    if(err) return console.error(err);
    api.setOptions({listenEvents: true});
    api.removeUserFromGroup(aaron, test, (err) => {
        api.addUserToGroup(aaron, test, (err) => {
            if (err)
                console.log(err);
            api.getThreadInfo(test, (err, info) => {
                if (err) console.log(err);
                consoleface.log(info);
            })
        });
    })

    // api.listen((err, message) => {
    //     if (err) console.log(err);
    //     console.log(message);
    //     if (message.type === 'event' && message.logMessageType === 'log:subscribe') {
    //         console.log(message);
    //     }
    // });
});

var aaron = '100003952090241'; //aaron's user ID
var test = '1774234042601695'; // test chat
