var funcs = require('../util/functions.js');
var config = require('../config');

exports.run = (client, message, args) => {

  var groups = Storage.getItemSync("updateGroups");

  var clanTag = args[0]
  let changed = false;

  if (!args[0]) {
    message.reply("specify a clantag");
  } else {
    if (groups.length != 0) {
      groups.forEach((group, index) => {
        group = group.split('//');
        // group[0] group id
        // group[1] clantag

        if (group[0] == message.group.id) {
          groups[index] = `${message.group.id}//${clanTag}`
          if (!clanData[clanTag]) {
            clanData[clanTag] = {channels: [group[0]]}

            clanData[clanTag].updateInterval = setInterval(function() {
              funcs.getCurrentWar(clanTag)
            }, 1000 * config.updateInterval);
            
            funcs.getCurrentWar(clanTag);
          } else {
            clanData[clanTag].channels.push(group[0])
            clanData[group[1]].channels.splice(clanData[group[1]].channels.indexOf(group[0]), 1)
          }
          Storage.setItemSync("updateGroups", groups);
          message.reply(`this group will now recieve updates for ${clanTag} instead of ${group[1]}`);
          changed = true;

        }
      })
    }
    if (changed == false) {
      groups.push(`${message.group.id}//${clanTag}`)
      Storage.setItemSync("updateGroups", groups)

      if (!clanData[clanTag]) {
        clanData[clanTag] = {channels: [message.group.id]}

        clanData[clanTag].updateInterval = setInterval(function() {
          funcs.getCurrentWar(clanTag)
        }, 1000 * config.updateInterval);
        
        funcs.getCurrentWar(clanTag);
      } else {
        clanData[clanTag].channels.push(message.group.id)
      }
      
      message.reply(`this group will now recieve updates for ${clanTag}`)
    }
  }

}

exports.description = "add this channel to recieve updates for a clan `claim #clantag`"
