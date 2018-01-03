const login = require("facebook-chat-api");
const fs = require("fs");
const _ = require("underscore");

class Chat {
    constructor(chat_id, api) {
        this.id = chat_id;
        this.api = api;
        fs.readFile(this.id + ".json", 'utf8', (err, data) => {
            if (err) {
                this.left = ['00000'];
                this.members = [];
            } else {
                load = JSON.parse(data);
                this.left = load.left;
                this.members = load.members;
            }
            this.api.getThreadInfoGraphQL(this.id, (err, info) => {
                if (err)
                    console.log(err);
                if (info) {
                    this.members = _.union(this.members, info.participantIDs);
                    this.clean();
                }
            });
        })
    }
    clean() {
        fs.writeFile(this.id + ".txt", JSON.stringify({"left": this.left, "members": this.members}));
    }
    isChatMessage(message) {
        return message.threadID === this.id;
    }
    isMemberMessage(message) {
        return this.members.includes(message.threadID);
    }
    isMemberAdd(message) {
        return message.type === 'event'
            && message.logMessageType === 'log:subscribe';
    }
    handleMemberAdd(message) {
        console.log(message.logMessageData.addedParticipants[0].userFbId);
        var addedUser = message.logMessageData.addedParticipants[0].userFbId;
        if (this.left.includes(addedUser)) {
            this.api.removeUserFromGroup(addedUser, this.id);
        } else {
            this.members = _.union(this.members, [addedUser]);
            this.clean();
        }
    }
    handleMemberLeave(message) {
        this.api.removeUserFromGroup(message.senderID, this.id, (err) => {
            if (err) console.log(err);
            this.left.push(message.senderID);
            this.clean();
        });
    }
    handleMemberRejoin(message) {
        this.api.addUserToGroup(message.senderID, this.id, (err) => {
            if (err) console.log(err);
            this.left = _.without(this.left, message.senderID);
            this.clean();
        });
    }
}

module.exports = Chat;
