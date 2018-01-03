import json
import subprocess


user = input("facebook username? ")
pw = input("facebook pw? ")
chat = input("group chat thread ID? ")

config = {
    'user': user,
    'password': pw,
    'threadID': chat
}

with open('config.json', 'w+') as fp:
    json.dump(config, fp)

subprocess.call("node login.js")
