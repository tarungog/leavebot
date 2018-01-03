'use strict'

const fs = require("fs");
const login = require("facebook-chat-api");
const Chat = require("./Chat")

var group_id = '1667682209968511';
console.log(group_id);

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    // Here you can use the api
    if (err) console.log(err);
    api.setOptions({listenEvents: true});
    api.sendMessage("The ancient powers of light and dark have been released.", group_id);

    var group = new Chat(group_id, api);

    var stopListening = api.listen((err, message) => {
        if (err) console.log(err);
        console.log(message);
        if (group.isChatMessage(message)) {
            if (message.body === '/leave') {
                group.handleMemberLeave(message);
            } else if (group.isMemberAdd(message)) {
                group.handleMemberAdd(message);
            }
        } else if (group.isMemberMessage(message)) {
            if (message.body === '/join') {
                group.handleMemberRejoin(message);
            }
        }
    });
});

process.on('SIGINT', function() {
    group.clean();
    process.exit();
  });
