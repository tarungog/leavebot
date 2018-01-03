import json
import subprocess


user = raw_input("facebook username? ")
pw = raw_input("facebook pw? ")
chat = raw_input("group chat thread ID? ")

config = {
    'user': user,
    'password': pw,
    'threadID': chat
}

with open('config.json', 'w+') as fp:
    json.dump(config, fp)

subprocess.call("node login.js", shell=True)
