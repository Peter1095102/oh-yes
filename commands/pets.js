const CommandError = require("../CommandError");
const stuff = require("../stuff");

module.exports = {
    name: "pets",
    description: "shows a list of your pets or info about a specific pet",
    usage: "pets [index:int]",
    execute(message, args) {
        var i = parseInt(args[0]);
        if (!args[0]) {
            var petNames = [];
            var pets = stuff.db.getData(`/${message.author.id}/pets`);
            var i = 0;
            pets.forEach(el => {
                petNames.push(`\`${i}\` ${el.icon} **${el.name}**`)
                i++;
            })
            var embed = {
                title: `${message.author.username}'s pets`,
                description: petNames.join("\n"),
                footer: {
                    text: "use ;pets <index> to see info about that specific pet"
                }
            };
            message.channel.send({embed: embed});
        } else {
            var pet = stuff.db.getData(`/${message.author.id}/pets[${i}]`);
            if (!pet) throw new CommandError("Pet not found", `You don't have a pet at index \`${i}\`!!1!!!1`)
            if (!stuff.db.exists(`/${message.author.id}/pets[${i}]/happiness`)) {
                stuff.db.push(`/${message.author.id}/pets[${i}]/happiness`, 0.5);
            }
            if (args[1] == "feed") {
                var repeat = stuff.clamp(parseInt(args[2]) || 1, 1, 200);
                
                var mult = pet.baseMultiplierAdd || 250;
                var happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                stuff.repeat(() => {


                    if (stuff.removeItem(message.author.id, pet.food)) {
                        var _happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                        
    
                        
                        
                        stuff.db.push(`/${message.author.id}/pets[${i}]/happiness`, _happiness + (0.1 * Math.random()));
    
                        
    
                        
    
                        if (repeat < 2) {
                            message.channel.send({embed: {
                                color: stuff.shopItems[pet.food].rarity,
                                description: `You gave **${pet.name}**: ${stuff.shopItems[pet.food].icon} ${stuff.shopItems[pet.food].name} h`
                            }})
                        }
                    } else {
                        stuff.addMultiplier(message.author.id, -mult * happiness)
                        happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                        stuff.addMultiplier(message.author.id, mult * happiness)
                        throw new CommandError("Item not found", `You don't have ${stuff.shopItems[pet.food].icon} ${stuff.shopItems[pet.food].name} in your inventory!1!!!1!`)
                    }
                }, repeat).then(repeat => {
                    stuff.addMultiplier(message.author.id, -mult * happiness)
                    happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                    stuff.addMultiplier(message.author.id, mult * happiness)
    
                    if (repeat > 1) {
                        message.channel.send({embed: {
                            color: stuff.shopItems[pet.food].rarity,
                            description: `You gave **${pet.name}**: ${repeat}x ${stuff.shopItems[pet.food].icon} ${stuff.shopItems[pet.food].name} h`
                        }})
                    }
                })
                
            } else if (args[1] == "attack") {
                if (!stuff.currentBoss) {
                    throw new CommandError("Boss not found", "There is no boss to fight!")
                }
                if (stuff.userHealth[message.author.id] <= 0) {
                    throw new CommandError("ded", "you can't attack bosses while dead lolololol")
                }

                var happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                var attackDamage = stuff.db.getData(`/${message.author.id}/pets[${i}]`).damage || 5;
                var totalAttackDamage = attackDamage * happiness;
                var damageDealt = stuff.clamp(totalAttackDamage * 2 * Math.random(), attackDamage, totalAttackDamage * 1.5);
                var dmgReduction = (stuff.currentBoss.damageReduction || 4);
                stuff.currentBoss.health -= damageDealt / dmgReduction;
                if (!stuff.currentBoss.fighting.includes(message.author.id)) {
                    stuff.currentBoss.fighting.push(message.author.id);
                    
                }
                if (stuff.currentBoss.health <= 0) {
                    message.channel.send(`${stuff.currentBoss.name} has been defeated!`)
                    stuff.currentBoss.fighting.forEach(u => {
                        stuff.addPoints(u, stuff.currentBoss.drops / stuff.currentBoss.fighting.length);
                    })
                    stuff.currentBoss = undefined;
                    return;
                }

                if (Math.random() < 0.6) {
                    var dmg = (stuff.currentBoss.damage || 200) * stuff.clamp(Math.random() * 1.2, 0.5, 1.2);
                    
                    stuff.userHealth[message.author.id] -= dmg;
                    message.channel.send(`${message.author.username}\n${stuff.format(stuff.userHealth[message.author.id])}/${stuff.format(stuff.getMaxHealth(message.author.id))} **-${stuff.format(dmg)}**`);
                    if (stuff.userHealth[message.author.id] <= 0) {
                        message.channel.send({embed: {description: `${message.author} died, respawning in 10 seconds`}})
                        setTimeout(() => {
                            stuff.userHealth[message.author.id] = stuff.getMaxHealth(message.author.id);
                            message.channel.send({embed: {description: `${message.author} just respawned`}})
                        }, 10000)
                        return;
                    }
                }
                
                
                message.channel.send(`${stuff.currentBoss.name}\n${"▮".repeat(stuff.clamp(stuff.currentBoss.health / stuff.currentBoss.maxHealth * 50, 0, Infinity))} ${stuff.format(stuff.currentBoss.health)}/${stuff.format(stuff.currentBoss.maxHealth)} **-${stuff.format(damageDealt)}**`);
            } else {
                var happiness = stuff.db.getData(`/${message.author.id}/pets[${i}]/happiness`);
                var mult = pet.baseMultiplierAdd || 250;
                var totalMult = mult * happiness;
                var attackDamage = stuff.db.getData(`/${message.author.id}/pets[${i}]`).damage || 5;
                var totalAttackDamage = attackDamage * happiness;
                var chonkBar = `${"▮".repeat(stuff.clamp(happiness * 10, 0, 500))}${"▯".repeat(stuff.clamp((1 - happiness) * 20, 0, Infinity))}`;
                var multiplierBar = `${"▮".repeat(stuff.clamp((totalMult / mult) * 10, 0, 500))}${"▯".repeat(stuff.clamp((1 - (totalMult / mult)) * 20, 0, Infinity))}`;
                var damageBar = `${"▮".repeat(stuff.clamp((totalAttackDamage / attackDamage) * 10, 0, 500))}${"▯".repeat(stuff.clamp((1 - (totalAttackDamage / attackDamage)) * 20, 0, Infinity))}`;
                var embed = {
                    title: `${pet.icon} ${pet.name}`,
                    fields: [
                        {
                            name: "favorite food",
                            value: `${stuff.shopItems[pet.food].icon} ${stuff.shopItems[pet.food].name}`
                        },
                        {
                            name: "chonk level",
                            value: `${(chonkBar.length > 200) ? "<insert long bar here>" : chonkBar} ${(happiness * 100).toFixed(1)}%`
                        },
                        {
                            name: "multiplier",
                            value: `${(multiplierBar.length > 200) ? "<insert long bar here>" : multiplierBar} ${stuff.format(totalMult)}`
                        },
                        {
                            name: "attack damage",
                            value: `${(damageBar.length > 200) ? "<insert long bar here>" : damageBar} ${stuff.format(totalAttackDamage)}`
                        }
                    ]
                }
                message.channel.send({embed: embed});
            }
        }
    }
}