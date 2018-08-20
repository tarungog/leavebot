'use strict'

let fs = require('fs');
let login = require('facebook-chat-api');
let Chat = require('./Chat');
let Data = require('./Data');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var group_id = config.threadID;
var roon = '100000921889753';

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    // Here you can use the api
    if (err) console.log(err);
    api.setOptions({listenEvents: true});
    api.sendMessage('The ancient powers of light and dark have been released.', roon);

    let group = new Chat(group_id, api);
    let data = new Data(api);

    var stopListening = api.listen((err, event) => {
        if (err) console.log(err);
        if (event) {
            console.log(event);
            if (event.type === 'message') {
                data.storeMessage(event)
                if (group.isChatMessage(event)) {
                    if (event.body === '/leave') group.handleMemberLeave(event);
                    if (event.body === '/usage') data.sendUsage(group_id);
                } else if (group.isMemberMessage(event)) {
                    if (event.body === '/join') group.handleMemberRejoin(event);
                }
            }
            else if (group.isMemberAdd(event)) group.handleMemberAdd(event);

            else if (event.type == 'message_reaction') {
                // add support for storing reactions
                // { type: 'message_reaction',
                // threadID: 1600466900018690,
                // messageID: 'mid.$gAAWvnb0M5gJrhprAX1lVVUoyDQJ2',
                // reaction: '😢',
                // senderID: 100006115174010,
                // userID: 100000921889753,
                // timestamp: 1534734994623 }
            }
        }
    });
});

setTimeout(die, 24 * 3600 * 1000);

function die() {
    process.exit(0);
}
