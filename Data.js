let Database = require('better-sqlite3')

class Data {
    constructor(api) {
        this.api = api;

        this.db = new Database(`chat_messages.db`);
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS messages
            (
                sender_id   BIGINT    NOT NULL,
                thread_id   BIGINT,
                timestamp   BIGINT    NOT NULL,
                body        TEXT,
                mentions    TEXT
            )
        `).run();

        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS senders
            (
                sender_id   BIGINT    NOT NULL,
                name        TEXT      NOT NULL
            )
        `).run();
    }

    storeMessage(message) {
        let sender_id = message.senderID;
        let thread_id = message.threadID;
        let timestamp = message.timestamp;
        let body = message.body;
        let mentions = JSON.stringify(message.mentions);

        let insertMessage = this.db.prepare(`
            INSERT INTO messages(sender_id, thread_id, timestamp, body, mentions) VALUES (?, ?, ?, ?, ?)
        `);

        insertMessage.run(sender_id, thread_id, timestamp, body, mentions);

        let selectSender = this.db.prepare(`
            SELECT * FROM senders WHERE sender_id = ?
        `);
        let rows = selectSender.get(sender_id);

        if (rows) {
            console.log('Already in senders table');
        }
        if (!rows) {
            this.api.getUserInfo(sender_id, (err, ret) => {
                if (err) console.log(err);
                else {
                    let senderName;

                    for(var prop in ret) {
                        if(ret.hasOwnProperty(prop)) {
                            senderName = ret[prop].name;
                            break;
                        }
                    }

                    let insertSender = this.db.prepare(`
                        INSERT INTO senders(sender_id, name) VALUES (?, ?)
                    `);

                    insertSender.run(sender_id, senderName);
                }
            })
        }
    }

    sendUsage(group_id) {
        let selectSender = this.db.prepare(`
            SELECT
                a.count as msg_count,
                b.name as sender_name
            FROM
            (
                SELECT
                    COUNT(*) as count,
                    sender_id as sender_id
                FROM
                messages
                GROUP BY sender_id
            ) a
            INNER JOIN
            senders b

            ON a.sender_id = b.sender_id
        `);

        let allRows = selectSender.all();

        let retString = 'MESSAGE COUNT\n'

        var len = allRows.length;
        for (var i = 0; i < len; i++) {
            let row = allRows[i];
            retString += `${row.sender_name}: ${row.msg_count} messages\n`;
        }

        this.api.sendMessage(retString, group_id);
    }


};


module.exports = Data;
