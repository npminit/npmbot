const Line = require('line.js');
const fs = require('fs');

const moment = require('moment');
const chalk = require('chalk');
const rp = require('request-promise');
var config = require('./config')
var funcs = require('./util/functions.js');

global.Client = new Line.Client({
  channelAccessToken: config.line.channelAccessToken, 
  channelSecret: config.line.channelSecret, 
  port: config.line.port 
}); 
// This loop reads the /events/ folder and attaches each event file to the appropriate event.
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    // super-secret recipe to call events with all their proper arguments *after* the `client` var.
    Client.on(eventName, (...args) => eventFunction.run(Client, ...args));
  });
});

Client.on("message", (message) => {
  
  if (!message.group) return message.reply("Not a valid group");

  if (message.content == "msgme") {
    Client.sendMessage(message.author.id, "here i am")
  }

  // This is the best way to define args. Trust me.
  const args = message.content.slice(0).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // The list of if/else is replaced with those simple 2 lines:
  try {
    let commandFile = require(`./commands/${command}.js`);
    commandFile.run(Client, message, args);
  } catch (err) {
    // console.log(err);
  }
});

global.clanData = {};

var LogMessage = `
           --------------
           |Line War Bot|
    

  Been announcing coc wars since ${moment("2017-08-25T23:13:33-05:00").format("MMM Do YYYY")}
`
console.log(chalk.green(LogMessage));

var options = {
  uri: 'https://api.github.com/repos/npminit/npmbot/commits',//https://api.github.com/repos/npminit/npmbot/commits
  headers: {
    'User-Agent': 'line-coc-announcer'
  },
  json: true // Automatically parses the JSON string in the response
};

rp(options) // request the commits
.then(function (data) {
  checkForUpdate(data[0].sha, data[0].commit.message); // checks for update
})

// check for a update every 10 minutes
setInterval(function() {
  rp(options)
  .then(function (data) {
    checkForUpdate(data[0].sha, data[0].commit.message)
  })
}, 1000 * (60 * 10));

var groups = Storage.getItemSync("updateGroups");
if (groups.length != 0) {
  groups.forEach((group) => {
    group = group.split("//");

    if (!clanData[group[1]]) {
      clanData[group[1]] = {channels: [group[0]], onStartup: true}
    } else {
      clanData[group[1]].channels.push(group[0])
    }
  })
  Object.keys(clanData).forEach(key => {

    clanData[key].updateInterval = setInterval(function() {
      funcs.getCurrentWar(key)
    }, 1000 * config.updateInterval);
    
    funcs.getCurrentWar(key);
  })
}
