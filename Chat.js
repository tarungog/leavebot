const login = require("facebook-chat-api");
const fs = require("fs");

class Chat {
    constructor(chat_id, api) {
        this.id = chat_id;
        this.api = api;
        fs.access(this.id + ".txt", fs.constants.R_OK, (err) => {
            if (err) {
                this.left = ['00000'];
                this.members = [];
            } else {
                load = JSON.parse(fs.readFileSync(this.id + ".txt", 'utf8'));
                this.left = load.left;
                this.members = load.members;
            }
            this.api.getThreadInfoGraphQL(this.id, (err, info) => {
                if (err)
                    console.log(err);
                if (info) {
                    console.log(info);
                    this.members = info.participantIDs;
                    console.log(this.members);
                }
            });
        })
    }
    clean() {
        fs.writeFileSync(this.id + ".txt", JSON.stringify({"left": this.left, "members": this.members}));
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
            this.members.push(addedUser);
        }
    }
    handleMemberLeave(message) {
        this.api.removeUserFromGroup(message.senderID, this.id, (err) => {
            if (err) console.log(err);
            this.left.push(message.senderID);
        });
    }
    handleMemberRejoin(message) {
        this.api.addUserToGroup(message.senderID, this.id);
    }
}

module.exports = Chat;
