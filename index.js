const fs = require('fs'),
    path = require('path');

module.exports = function ValkJS(mod) {
    const { command } = mod;
    const { player } = mod.require.library;
    
    let skill_ids = {};
    let isEnabled = true;
    let lastTimeout = null;    
    let config_file = require('./config.json');
    let timeout;
    let reEnabled = false;    
    let refresh;
    let allreadyrefresh = false;    
    let timer;
    let timer2;    
    let scCancel = true;
    let lastSkill;
    let lastlastSkill;
    let cdtimer = 12500;
    let reclEnable = false;

    if (config_file['RUNEBURST_CANCEL_DELAY'] && typeof config_file['RUNEBURST_CANCEL_DELAY'] === "number") {
        skill_ids['16'] = {
        'delay': config_file['RUNEBURST_CANCEL_DELAY'],
        'fixedDelay': true
        };
    }    
    if (config_file['GUNGNIRS_BITE_CANCEL_DELAY'] && typeof config_file['GUNGNIRS_BITE_CANCEL_DELAY'] === "number") {
        skill_ids['23'] = {
            'delay': config_file['GUNGNIRS_BITE_CANCEL_DELAY']
        };
    }
    if (config_file['LEAPING_STRIKE_CANCEL_DELAY'] && typeof config_file['LEAPING_STRIKE_CANCEL_DELAY'] === "number") {
        skill_ids['6'] = {
            'delay': config_file['LEAPING_STRIKE_CANCEL_DELAY']
        };
    }
    if (config_file['MAELSTROM_CANCEL_DELAY'] && typeof config_file['MAELSTROM_CANCEL_DELAY'] === "number") {
        skill_ids['5'] = {
            'delay': config_file['MAELSTROM_CANCEL_DELAY']
        };
    }
    if (config_file['SHINING_CRESCENT_CANCEL_DELAY'] && typeof config_file['SHINING_CRESCENT_CANCEL_DELAY'] === "number") {
        skill_ids['11-31'] = {
            'delay': config_file['SHINING_CRESCENT_CANCEL_DELAY']
        };
    }
    if (config_file['SHINING_CRESCENT1_CANCEL_DELAY'] && typeof config_file['SHINING_CRESCENT1_CANCEL_DELAY'] === "number") {
        skill_ids['11-30'] = {
            'delay': config_file['SHINING_CRESCENT1_CANCEL_DELAY']
        };
    }
    if (config_file['GLAIVE_STRIKE_CANCEL_DELAY'] && typeof config_file['GLAIVE_STRIKE_CANCEL_DELAY'] === "number") {
        skill_ids['3'] = {
            'delay': config_file['GLAIVE_STRIKE_CANCEL_DELAY']
        };
    }
    if (config_file['GROUND_BASH_CANCEL_DELAY'] && typeof config_file['GROUND_BASH_CANCEL_DELAY'] === "number") {
        skill_ids['9'] = {
            'delay': config_file['GROUND_BASH_CANCEL_DELAY']
        };
    }
    if (config_file['TWILIGHT_WALTZ_CANCEL_DELAY'] && typeof config_file['TWILIGHT_WALTZ_CANCEL_DELAY'] === "number") {
        skill_ids['24-4'] = {
            'delay': config_file['TWILIGHT_WALTZ_CANCEL_DELAY']
        };
    }
    if (config_file['SPINNING_DEATH_CANCEL_DELAY'] && typeof config_file['SPINNING_DEATH_CANCEL_DELAY'] === "number") {
        skill_ids['7-2'] = {
            'delay': config_file['SPINNING_DEATH_CANCEL_DELAY']
        };
    }    
    if (config_file['RAGNAROK_CANCEL_DELAY'] && typeof config_file['RAGNAROK_CANCEL_DELAY'] === "number") {
        skill_ids['12'] = {
            'delay': config_file['RAGNAROK_CANCEL_DELAY']
        };
    }


    command.add('vk', (param) => {
        if(param==null) {
            isEnabled = !isEnabled;
            command.message('Valkyrie is now ' + (isEnabled ? 'enabled' : 'disabled') + '.');
        }; 
        /*            
        if(param=='re'){
            reEnabled = !reEnabled;
            command.message('Refresh is now ' + (reEnabled ? 'enabled' : 'disabled') + '.')
        } 
        */
        if(param=='sc'){
            scCancel = !scCancel;            
            command.message('Shinning Crescent 1st hit cancel is  ' + (scCancel ? 'enabled' : 'disabled') + '.')            
        }        
    });
    
    
    mod.hook('S_ABNORMALITY_BEGIN', 4, event => {            
        if (event.id == 10155010 &&  isEnabled && !allreadyrefresh) {                        
            refresh = 25000
            allreadyrefresh = true           
            timer = setTimeout( () => {
                refreshragna(event)
            }, refresh)
        }
        if (event.id == 10155240 &&  isEnabled && !allreadyrefresh) {              
            refresh = 25000
            allreadyrefresh = true           
            timer = setTimeout( () => {
                refreshragna(event)
            }, refresh)
        }            
    });
    
   
   
    function refreshragna(event) { 
        allreadyrefresh = false    
        if (!player.inCombat && player.alive && reEnabled && mod.game.me.class == 'glaiver') {
            event.loc = player.loc 
            event.w = 0 
            event.skill = 120130            
            StartInstanceSkill(event)
            timeout = setTimeout( () => {
                event.skill = 140100
                StartInstanceSkill(event)                
            }, 500)
        }
    }

    function refreshrecla(event) { 
        allreadyrefresh = false    
        if (!player.inCombat && player.alive && mod.game.me.class == 'glaiver') { 

            timer = setTimeout( () => {                
                if (reclEnable) {
                    event.skill = 190100
                    event.loc = player.loc 
                    event.w = 0
                    StartInstanceSkill(event)
                }                           
            }, cdtimer + 100)

            timer2 = setTimeout( () => {
                if (reEnabled) {
                    refreshragna(event)     
                }                            
            }, cdtimer + 900)                   
        }        
    }
    

    function StartInstanceSkill(event) {                      
        mod.send('C_START_SKILL', 7, {
            skill:     event.skill,
            loc:       event.loc, 			
			w:         event.w,
			continue:  event.continue,
			targets:   [{arrowId: 0, gameId: event.target, hitCylinderId: 0}],
            dest: event.dest            
        })              
    }

    mod.hook('S_START_COOLTIME_SKILL', 3 , event => {
        
        if (Math.floor(event.skill.id/10000) == 19 && reclEnable) {
            cdtimer = event.cooldown
            refreshrecla(event)
        }
    })
    
    
    mod.hook('C_START_SKILL', 7, { order: -100 }, event => {

        lastlastSkill = lastSkill
        lastSkill = Math.floor(event.skill.id/10000)

        if (!player.inCombat && lastSkill == 19 ) {  
            reclEnable = true          
            refreshrecla(event)           
        }
        if (lastSkill !== 19 && lastSkill !== 14 && lastSkill !== 17 && lastSkill !== 12 ) {  
            reclEnable = false                     
        }	
    })
    
    
    mod.hook('S_ACTION_STAGE', 9, { order: -1000000, filter: {fake: true} }, event => {

               
        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'glaiver') return;

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if ( ( skill_id + '-' + altSkill_id ) == '11-30' && (lastlastSkill == 4 || lastlastSkill == 7 || lastlastSkill == 14 || lastlastSkill == 1 || !scCancel) ) return;
                
        if (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids) {  
            
            const skillInfo = skill_id in skill_ids ? skill_ids[skill_id] : skill_ids[skill_id + '-' + altSkill_id];                 

            lastTimeout = mod.setTimeout(() => {
                mod.toClient('S_ACTION_END', 5, {
                    gameId: event.gameId,
                    loc: {
                        x: event.loc.x,
                        y: event.loc.y,
                        z: event.loc.z
                    },
                    w: event.w,
                    templateId: event.templateId,
                    skill: event.skill.id,
                    type: 12394123,
                    id: event.id
                });                  

            }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);

            
        }
    });
    
    mod.hook('S_ACTION_END', 5, {'order': -1000000,'filter': {'fake': true }}, event => {
           
        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'glaiver') return;         

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;    

        if (lastTimeout && (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids)) {
            lastTimeout = null;
            if (event.type == 12394123) {
                event.type = 4;
                return true;
            } else {
                return false;
            }
        }

        if (timeout && (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids)) {
            timeout = null;
            if (event.type == 12394123) {
                event.type = 4;
                return true;
            } else {
                return false;
            }
        }        

    });

    mod.hook('C_CANCEL_SKILL', 3, event => {
        if (!isEnabled || mod.game.me.class !== 'glaiver') return;

        if (lastTimeout) {
            mod.clearTimeout(lastTimeout);
            lastTimeout = null;
        }        
    });

    mod.hook('S_EACH_SKILL_RESULT', 14, { 'order': -10000000 }, event => {
        if (!isEnabled || !lastTimeout || event.target !== mod.game.me.gameId || !event.reaction.enable) return;
        mod.clearTimeout(lastTimeout);
        lastTimeout = null;
    });
            

}