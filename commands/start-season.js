const stuff = require("../stuff");

module.exports = {
    name: "start-season",
    description: "starts a new season and resets data",
    requiredPermission: "commands.start-season",
    execute (message) {
        message.channel.send("Are you sure to start a new season? React with ✅ to confirm").then(m => {
            m.react("✅").then(() => {
                m.awaitReactions((r, u) => {
                    return u.id == message.author.id && r.emoji.name == "✅";
                }, {max: 1, time: 15000, errors: ['time']}).then(() => {
                    
                    message.channel.send("Okay then, resetting data and starting a new season");
                    stuff.db.delete("/");
                    stuff.set("season", stuff.getConfig("season") + 1)
                    message.channel.send("Data reset and started a new season!");
                    message.client.commands.get("announce").execute(message, [`Season ${stuff.getConfig("season")} of "get the phone and break the economy any% speedrun" started!!1!!!1!!`], ["title", "new season alert!!1!!!1"])
                }).catch(err => {
                    message.channel.send("You took too long to react, cancelling data reset");
                })
            })
        })
    }
}