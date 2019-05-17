angular
  .module('splatApp', ['ui.bootstrap', 'ngAnimate', 'ngAria'])
  .controller('splatController', ['$scope', '$rootScope', '$timeout', '$locale', function splatCtrl($scope, $rootScope, $timeout, $locale, $translate, $uibModal, $log) {
    $rootScope.splatController = $scope;
    angular.module('splatApp').skills($scope);
    angular.module('splatApp').stats($scope, $translate);
    angular.module('splatApp').weapons($scope);
    angular.module('splatApp').subs($scope);
    angular.module('splatApp').specials($scope);
    angular.module('splatApp').gear($scope);
    angular.module('splatApp').clipboard($scope, $timeout);
    angular.module('splatApp').util($scope);

    $scope.loadout = new Loadout();
    $scope.status = {}
    $scope.logging = false;
    $scope.appVersion = 210; // 2.0.0
    $scope.screenshotMode = false;
    $scope.toggledAbilities = {};

    $scope.tutorial = angular.module('splatApp').tutorial;

    $scope.appVersionToString = function() {
      var appVersionString = "";
      for(i = 0; i < $scope.appVersion.toString().length; i++) {
        appVersionString += $scope.appVersion.toString()[i];
        if(i < $scope.appVersion.toString().length - 1) {
          appVersionString += ".";
        }
      }
      return appVersionString;
    }

    $scope.getCurrentLang = function() {
      var current_lang = window.location.pathname;
      while(current_lang.indexOf("/") != -1) {
        current_lang = current_lang.replace("/","");
      }
      return current_lang;
    }

    $scope.saveToggledAbility = function(weaponType, statName, statKey) {
      if($scope.toggledAbilities[weaponType] == null) {
        $scope.toggledAbilities[weaponType] = {};
      }
      $scope.toggledAbilities[weaponType][statKey] = statName;
    }

    $scope.loadSavedToggledAbilities = function() {
      var weaponNameKeys = Object.keys($scope.toggledAbilities);

      for(var i = 0; i < weaponNameKeys.length; i++) {
        if(weaponNameKeys[i] == $scope.loadout.weapon.name) {
          var weaponName = weaponNameKeys[i];
          var statKeyKeys = Object.keys($scope.toggledAbilities[weaponName]);
  
          for(var j = 0; j < statKeyKeys.length; j++) {
            var statKey = statKeyKeys[j];
            var statName = $scope.toggledAbilities[weaponName][statKey];
  
            // TODO: The value stored should be a dictionary of the Stat Name and Ability Name
            var abilityName = null;
            if(statKey.indexOf("Main Power Up") != -1)  {
              abilityName = "Main Power Up";
            }
            if(statKey == "Special Saved") {
              abilityName = "Special Saver";
            }
            if(statKey == "Sub Power") {
              abilityName = "Sub Power Up";
            }
  
            var abilityScore = $scope.loadout.calcAbilityScore(abilityName);
            var statValues = $scope.calcStat(abilityScore, weaponName, statName);
            $scope.displayStat(statKey, statValues.name, statValues.value, statValues.percentage, statValues.label);
          }
          break;
        }
      }
    }

    $scope.checkIfToggledAbilityActive = function(name) {
      var weaponTypeKeys = Object.keys($scope.toggledAbilities);

      for(var i = 0; i < weaponTypeKeys.length; i++) {
        if(weaponTypeKeys[i] == $scope.loadout.weapon.type) {
          var weaponType = weaponTypeKeys[i];
          var statKeyKeys = Object.keys($scope.toggledAbilities[weaponType]);
  
          for(var j = 0; j < statKeyKeys.length; j++) {
            var statKey = statKeyKeys[j];
            var statName = $scope.toggledAbilities[weaponType][statKey];
  
            if(statName == name)  {
              return true;
            }
          }
        }
        break;
      }
      return false;
    }

    $scope.switchSet = function() {
      $scope.loadout.weapon = $scope.availableWeapons()[0];
    }

    $scope.availableWeapons = function() {
      return $scope.selectedSet.weapons.filter(filter_available)
    }

    $scope.selectedSet = $scope.weaponSets[0];
    $scope.loadout.weapon = $scope.availableWeapons()[0];
    $scope.loadout.head.equipped = $scope.hats[0];
    $scope.loadout.clothes.equipped = $scope.clothes[0];
    $scope.loadout.shoes.equipped = $scope.shoes[0];

    $scope.refreshStats = function() {
      Object.keys($scope.stats).forEach(function(currentKey) {
          $scope.stats[currentKey].calc($scope.loadout);
      });
    }

     $scope.$watch('loadout', function() {
       $scope.refreshStats();
       $scope.loadSavedToggledAbilities();
       history.replaceState(undefined, undefined, "#" + $scope.encodeLoadout())
     },true);

    $scope.encodeLoadout = function() {
      return encode($scope.selectedSet.id,$scope.loadout)
    }

    $scope.loadCode = function(code) {
      var newLoadout = new Loadout();
      var results = decode(code)
      if(results) {
      $scope.selectedSet = $scope.getWeaponSetById(results.set)
      newLoadout.weapon = $scope.getWeaponById(results.set,results.weapon)
      newLoadout.head.equipped = $scope.getHatById(results.head.gear)
      newLoadout.clothes.equipped = $scope.getClothesById(results.clothes.gear)
      newLoadout.shoes.equipped = $scope.getShoesById(results.shoes.gear)
      newLoadout.head.main = $scope.getSkillById(results.head.main)
      for(var i=0; i<3; i++) {
        newLoadout.head.subs[i] = $scope.getSkillById(results.head.subs[i])
      }
      newLoadout.clothes.main = $scope.getSkillById(results.clothes.main)
      for(var i=0; i<3; i++) {
        newLoadout.clothes.subs[i] = $scope.getSkillById(results.clothes.subs[i])
      }
      newLoadout.shoes.main = $scope.getSkillById(results.shoes.main)
      for(var i=0; i<3; i++) {
        newLoadout.shoes.subs[i] = $scope.getSkillById(results.shoes.subs[i])
      }

      return newLoadout
    }
      return false;
    }

    $scope.encodedURL = function() {
      return window.location.protocol +"//"+ window.location.hostname + "/#" + $scope.encodeLoadout()
    }

    $scope.randomizeBuild = function() {
      var randomized = new Loadout()
      $scope.selectedSet = randomFrom($scope.weaponSets)
      randomized.weapon = randomFrom($scope.availableWeapons())
      randomized.head.equipped = randomFrom($scope.hats)
      randomized.clothes.equipped = randomFrom($scope.clothes)
      randomized.shoes.equipped = randomFrom($scope.shoes)
      $scope.loadout = randomized;
    }

    $scope.resetLoadout = function() {
      $scope.selectedSet = $scope.weaponSets[0];
      $scope.loadout.weapon = $scope.availableWeapons()[0];
      $scope.loadout.head.equipped = $scope.hats[0];
      $scope.loadout.clothes.equipped = $scope.clothes[0];
      $scope.loadout.shoes.equipped = $scope.shoes[0];
      $scope.loadout.clearAbilities();
    }

    if(window.location.hash) {
      var newLoadout = $scope.loadCode(window.location.hash.replace('#',''))
      if(newLoadout) {
        $scope.loadout = newLoadout;
      }
    }

    $scope.equip = function(item,slot) {
      if(eval("$scope.loadout." + slot + ".main") == null || eval("$scope.loadout." + slot + ".equipped.name") == "Splatfest Tee" || item.name == "Splatfest Tee") {
        eval(("$scope.loadout." + slot + ".main = $scope.getSkillByName('" + item.main + "')"))
      }
      eval("$scope.loadout." + slot + ".equipped = item")
    }

    $scope.toFixedTrimmed = function(number, precision) {
      return Number(number.toFixed(precision)).toString();
    }

    $scope.calcMod = function(abilityScore) {
      return (0.99 * abilityScore - Math.pow(0.09 * abilityScore,2));
    }

    $scope.calcP = function(abilityScore) {
      return Math.min(3.3*abilityScore - 0.027*Math.pow(abilityScore,2),100);
    }

    $scope.calcS = function(values) {
      var max = values[0];
      var mid = values[1];
      var min = values[2];
      return (mid-min) / (max-min);
    }

    $scope.calcRes = function(values, p, s) {
      var max = values[0];
      var mid = values[1];
      var min = values[2];
      return min + (max-min) * this.lerpN(p/100, s);
    }

    $scope.lerpN = function(p, s) {
      if(s.toFixed(3) == 0.5) {
        return p;
      }
      if(p == 0.0) {
        return p;
      }
      if(p == 1.0) {
        return p;
      }
      if(s != 0.5) {
        return Math.pow(Math.E,-1 * (Math.log(p) * Math.log(s) / Math.log(2)))
      }
    }

    $scope.statValuesToDict = function(name, value, percentage, label) {
      return {
        "name": name,
        "value": value,
        "percentage": percentage,
        "label": label
      };
    }

    $scope.displayStat = function(key, name, value, percentage, label) {
      $scope.stats[key].name = name;
      $scope.stats[key].value = value;
      $scope.stats[key].percentage = percentage;
      $scope.stats[key].label = label;
    }

    // TODO: Remove the Ability Score and Weapon Type parameters. Determine both in function.
    $scope.calcStat = function(abilityScore, weaponType, stat, saveStat) {
      if(saveStat === undefined) {
        saveStat = false;
      }

      if(stat == "STAT_SPECIAL_SAVER") {
        var parameters = $scope.parameters["Special Saver"]["default"];
        var ap = abilityScore * 1.0;
        
        var desc = null;
        if($scope.loadout.hasAbility('Respawn Punisher')) {
          ap = ap * 0.7;
          desc = "{{ DESC_PUNISHER_DISCLAIMER | translate }}";
        }
  
        var p = $scope.calcP(ap);       
        var s = $scope.calcS(parameters);
        var modifier = $scope.calcRes(parameters, p, s);
        var special_saved = 100.0 * modifier;
  
        if($scope.loadout.hasAbility('Respawn Punisher')) {
          special_saved = special_saved * 0.775;
        }

        // Only enable toggle if the Special is Splashdown
        var equippedSpecial = $scope.getSpecialByName($scope.loadout.weapon.special)
        if(equippedSpecial.name == "Splashdown") {
          var name = "[+] {{ STAT_SPECIAL_SAVER | translate }}";
        }
        else {
          var name = "{{ STAT_SPECIAL_SAVER | translate }}";
        }
        var value = special_saved;
        var percentage = $scope.toFixedTrimmed((modifier - 0.5) * 100, 2);
        var label = "{{ LABEL_PERCENT | translate }}".format({value: (special_saved).toFixed(1)});  

        if($scope.logging) {
          var special_saver_debug_log = {"Special Saver":special_saved,"AP":ap,"Delta":modifier}
          console.log(special_saver_debug_log);
        }
  
        if(saveStat) {
          $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Special Saved");
        }
        return $scope.statValuesToDict(name, value, percentage, label);
      }

      if(stat == "STAT_SPECIAL_SAVER_ON_DEATH") {
        var parameters = null;
        var ap = abilityScore * 1.0;

        if($scope.loadout.weapon.special == "Splashdown") {
          parameters = $scope.parameters["Special Saver"]["Splashdown"];
        }
        else {
          parameters = $scope.parameters["Special Saver"]["default"];        
        }
        
        var desc = null;
        if($scope.loadout.hasAbility('Respawn Punisher')) {
          ap = ap * 0.7;
          desc = "{{ DESC_PUNISHER_DISCLAIMER | translate }}";
        }
  
        var p = $scope.calcP(ap);       
        var s = $scope.calcS(parameters);
        var modifier = $scope.calcRes(parameters, p, s);
        
        var special_saved = 100.0 * modifier;
        if(special_saved > 100) {
          special_saved = 100.0;
        }
  
        if($scope.loadout.hasAbility('Respawn Punisher')) {
          special_saved = special_saved * 0.775;
        }
  
        if($scope.logging) {
          var special_saver_debug_log = {"Special Saver (On Death)":special_saved,"AP":ap,"Delta":modifier}
          console.log(special_saver_debug_log);
        }

        var name = "[+] {{ STAT_SPECIAL_SAVER_ON_DEATH | translate }}";
        var value = special_saved;
        var percentage = $scope.toFixedTrimmed((modifier - 0.5) * 100, 2);
        var label = "{{ LABEL_PERCENT | translate }}".format({value: (special_saved).toFixed(1)});
  
        if(saveStat) {
          $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Special Saved");
        }
        return $scope.statValuesToDict(name, value, percentage, label);
      }
      
      if(stat == "STAT_SUB_POWER_RANGE") {
        var equippedSub = $scope.getSubByName($scope.loadout.weapon.sub);

        switch(equippedSub.name) {
          case 'Point Sensor':
            var parameters = $scope.parameters["Sub Power Up"]["Point Sensor Distance Up"];
            var p = $scope.calcP(abilityScore);      
            var s = $scope.calcS(parameters);
            var result = $scope.calcRes(parameters, p, s);
            var max_param = parameters[0];          
            var min_param = parameters[2];

            var name = "[+] {{ STAT_SUB_POWER_RANGE | translate }}";
            var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
            var percentage = ((result/min_param - 1) * 100).toFixed(1);
            var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)})

            if($scope.logging) {
              var sub_power_up_debug_log = {"Sub Power Up (Point Sensor Range)":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":this.percentage}
              console.log(sub_power_up_debug_log);
            }

            if(saveStat) {
              $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Sub Power");
            }
            return $scope.statValuesToDict(name, value, percentage, label);        
        }
      }

      if(stat == "STAT_SUB_POWER_TRACKING_TIME") {
        var equippedSub = $scope.getSubByName($scope.loadout.weapon.sub);

        if(equippedSub.name == "Point Sensor") {
          var parameters = $scope.parameters["Sub Power Up"]["Point Sensor Mark Time Duration"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "[+] {{ STAT_SUB_POWER_TRACKING_TIME | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result,2)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Sub Power Up (Point Sensor Tracking Time)":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Sub Power");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(equippedSub.name == "Ink Mine") {
          var parameters = $scope.parameters["Sub Power Up"]["Ink Mine Mark Time Duration"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "[+] {{ STAT_SUB_POWER_TRACKING_TIME | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result,2)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Sub Power Up (Ink Mine Tracking Time)":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Sub Power");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }        

      }

      if(stat == "STAT_SUB_POWER_MINE") {
        var parameters = $scope.parameters["Sub Power Up"]["Ink Mine Mark Radius"];
        var p = this.calcP(abilityScore);      
        var s = this.calcS(parameters);
        var result = this.calcRes(parameters, p, s);
        var max_param = parameters[0];
        var min_param = parameters[2];

        var name = "[+] {{ STAT_SUB_POWER_MINE | translate }}";
        var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
        var percentage = ((result/min_param - 1) * 100).toFixed(1);
        var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(result*100,2)})

        if($scope.logging) {
          var sub_power_up_debug_log = {"Sub Power Up (Ink Mine Radius)":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
          console.log(sub_power_up_debug_log);
        }

        if(saveStat) {
          $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Sub Power");
        }
        return $scope.statValuesToDict(name, value, percentage, label);
      }

      if(weaponType == ".52 Gal") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"][".52 Gal"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
        
        if(stat == "STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"][".52 Gal"]["DegRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);         
        }        
      }

      if(weaponType == ".96 Gal") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"][".96 Gal"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"][".96 Gal"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Aerospray") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Aerospray"]["SplashPaintRadius"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";      
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Ballpoint Splatling") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Ballpoint Splatling"]["DamageRate"]["normal_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Ballpoint Splatling"]["DamageRate"]["normal_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Ballpoint Splatling"]["DamageRate"]["repeat_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var min_damage = result * $scope.loadout.weapon.minDamage.repeat;
          if($scope.loadout.weapon.mpuMaxDamage.repeat != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.repeat) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.repeat;
          }

          var name = "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Ballpoint Splatling"]["DamageRate"]["repeat_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.repeat;
          if($scope.loadout.weapon.mpuMaxDamage.repeat != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.repeat) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.repeat;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }        
      }

      if(weaponType == "Bamboozler 14") {
        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Bamboozler 14"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Bamboozler 14"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Bamboozler 14"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Bamboozler 14"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Blaster") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Blaster"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Bloblobber") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Bloblobber"]["SplashPaintRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Carbon Roller") {
        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Carbon Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Clash Blaster") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Clash Blaster"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Dapple Dualies") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dapple Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dapple Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Dualie Squelchers") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dualie Squelchers"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dualie Squelchers"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Dynamo Roller") {
        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Dynamo Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "E-liter 4K Scope") {
        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K Scope"]["FullChargeDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K Scope"]["MaxDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K Scope"]["SplashPaintRadiusRate"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }
      
      if(weaponType == "E-liter 4K") {
        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K"]["FullChargeDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K"]["MaxDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["E-liter 4K"]["SplashPaintRadiusRate"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Explosher") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Explosher"]["SplashPaintRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Flingza Roller") {
        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Flingza Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }    

      if(weaponType == "Glooga Dualies") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Glooga Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Glooga Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);       
        }

        if(stat == "STAT_MAIN_POWER_UP_BURST_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Glooga Dualies"]["SideStepOneMuzzleDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.burst;
          if($scope.loadout.weapon.mpuMaxDamage.burst != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.burst) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.burst;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_BURST_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_BURST_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Glooga Dualies"]["SideStepOneMuzzleDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.burst;
          if($scope.loadout.weapon.mpuMaxDamage.burst != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.burst) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.burst;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_BURST_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Goo Tuber") {
        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Goo Tuber"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Goo Tuber"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Goo Tuber"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Goo Tuber"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "H-3 Nozzlenose") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["H-3 Nozzlenose"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["H-3 Nozzlenose"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Heavy Splatling") {
        if(stat == "STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Heavy Splatling"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.firstRingBurstDuration,2)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }

        if(stat == "STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Heavy Splatling"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.secondRingBurstDuration,2)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }        
      }

      if(weaponType == "Hydra Splatling") {
        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Hydra Splatling"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Hydra Splatling"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);       
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Hydra Splatling"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }
  
        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Hydra Splatling"]["DamageMaxMaxChargeRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);       
        }        
      }

      if(weaponType == "Inkbrush") {
        if(stat == "STAT_MAIN_POWER_UP_DASH_SPEED") {
          var parameters = $scope.parameters["Main Power Up"]["Inkbrush"]["DashSpeed"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_DASH_SPEED | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(result,4)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_TRAIL_SIZE") {
          var parameters = $scope.parameters["Main Power Up"]["Inkbrush"]["CorePaintWidthHalfRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_TRAIL_SIZE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Jet Squelcher") {
        if(stat == "STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Jet Squelcher"]["DegRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
        
        if(stat == "STAT_MAIN_POWER_UP_BULLET_VELOCITY") {
          var parameters = $scope.parameters["Main Power Up"]["Jet Squelcher"]["InitVelRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_BULLET_VELOCITY | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "L-3 Nozzlenose") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["L-3 Nozzlenose"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["L-3 Nozzlenose"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Luna Blaster") {
        if(stat == "STAT_MAIN_POWER_UP_HIGH_DAMAGE_RADIUS") {
          var parameters = $scope.parameters["Main Power Up"]["Luna Blaster"]["CollisionRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_HIGH_DAMAGE_RADIUS | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
        
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Luna Blaster"]["SphereSplashDropPaintRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Mini Splatling") {
        if(stat == "STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Mini Splatling"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.firstRingBurstDuration,2)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }

        if(stat == "STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Mini Splatling"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.secondRingBurstDuration,2)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }        
      }

      if(weaponType == "N-ZAP") {
        if(stat == "STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["N-ZAP"]["DegRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["N-ZAP"]["SplashPaintRadius"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";      
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }        
      }

      if(weaponType == "Nautilus") {
        if(stat == "STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Nautilus"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_FIRST_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.firstRingBurstDuration,2)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }

        if(stat == "STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION") {
          var parameters = $scope.parameters["Main Power Up"]["Nautilus"]["MaxChargeShootingFrameTimes"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 60;
          var max_param = parameters[0] / 60;
          var min_param = parameters[2] / 60;
  
          var name = "{{ STAT_MAIN_POWER_UP_SECOND_RING_BURST_DURATION | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result * $scope.loadout.weapon.secondRingBurstDuration,2)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);   
        }        
      }

      if(weaponType == "Octobrush") {
        if(stat == "STAT_MAIN_POWER_UP_DASH_SPEED") {
          var parameters = $scope.parameters["Main Power Up"]["Octobrush"]["DashSpeed"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_DASH_SPEED | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(result,4)});

          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_TRAIL_SIZE") {
          var parameters = $scope.parameters["Main Power Up"]["Octobrush"]["CorePaintWidthHalfRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_TRAIL_SIZE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Range Blaster") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Range Blaster"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Rapid Blaster Pro") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Rapid Blaster Pro"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_DAMAGE_RADIUS") {
          var parameters = $scope.parameters["Main Power Up"]["Rapid Blaster Pro"]["CollisionRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_DAMAGE_RADIUS | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Rapid Blaster") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Rapid Blaster"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_DAMAGE_RADIUS") {
          var parameters = $scope.parameters["Main Power Up"]["Rapid Blaster"]["CollisionRadiusRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_DAMAGE_RADIUS | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }  

      if(weaponType == "Slosher") {
        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE_RANGE") {
          var parameters = $scope.parameters["Main Power Up"]["Slosher"]["BulletDamageMaxDist"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE_RANGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Sloshing Machine") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Sloshing Machine"]["PaintRRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          return $scope.statValuesToDict(name, value, percentage, label);
        }        
      }

      if(weaponType == "Splash-o-matic") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splash-o-matic"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splash-o-matic"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Splat Brella") {
        var parameters = $scope.parameters["Main Power Up"]["Splat Brella"]["CanopyNakedFrame"]["params"];
        var p = $scope.calcP(abilityScore);      
        var s = $scope.calcS(parameters);
        var result = $scope.calcRes(parameters, p, s) / 60;
        var max_param = parameters[0] / 60;
        var min_param = parameters[2] / 60;

        var name = "{{ STAT_MAIN_POWER_UP_CANOPY_REGENERATION_TIME | translate }}";
        var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
        var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
        var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result,2)});

        if($scope.logging) {
          var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
          console.log(main_power_up_debug_log);
        }

        return $scope.statValuesToDict(name, value, percentage, label);   
      }
      
      if(weaponType == "Splat Charger") {
        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Charger"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Charger"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Charger"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Charger"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Splat Dualies") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Splat Roller") {
        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["rolling"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.rolling;
          if($scope.loadout.weapon.mpuMaxDamage.rolling != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.rolling) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.rolling;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["standing"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.standing;
          if($scope.loadout.weapon.mpuMaxDamage.standing != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.standing) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.standing;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splat Roller"]["DamageRate"]["jumping"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.jumping;
          if($scope.loadout.weapon.mpuMaxDamage.jumping != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.jumping) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.jumping;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Splatterscope") {
        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splatterscope"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splatterscope"]["MinMaxChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.partial;
          if($scope.loadout.weapon.mpuMaxDamage.partial != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.partial) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.partial;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splatterscope"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.minDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splatterscope"]["FullChargeDamageRate"]["params"];
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.full;
          if($scope.loadout.weapon.mpuMaxDamage.full != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.full) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.full;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Splattershot Jr.") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splattershot Jr."]["SplashPaintRadius"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";      
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = ((result/min_param - 1) * 100).toFixed(1);
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Splattershot Pro") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splattershot Pro"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Splattershot Pro"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Splattershot") {
        if(stat == "STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Splattershot"]["DegJumpRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_JUMP_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
        
        if(stat == "STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION") {
          var parameters = $scope.parameters["Main Power Up"]["Splattershot"]["DegRandom"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          var name = "{{ STAT_MAIN_POWER_UP_GROUND_SHOT_RANDOMIZATION | translate }}";
          var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed(((result/min_param) * 100),3)});
  
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);         
        }        
      }

      if(weaponType == "Sploosh-o-matic") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Sploosh-o-matic"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Sploosh-o-matic"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }      

      if(weaponType == "Squeezer") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Squeezer"]["DamageRate"]["normal_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
          
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);         
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Squeezer"]["DamageRate"]["normal_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage.normal;
          if($scope.loadout.weapon.mpuMaxDamage.normal != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.normal) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.normal;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Squeezer"]["DamageRate"]["repeat_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var min_damage = result * $scope.loadout.weapon.minDamage.repeat;
          if($scope.loadout.weapon.mpuMaxDamage.repeat != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage.repeat) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage.repeat;
          }

          var name = "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }

          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Squeezer"]["DamageRate"]["repeat_params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];        
          
          var max_damage = result * $scope.loadout.weapon.maxDamage.repeat;
          if($scope.loadout.weapon.mpuMaxDamage.repeat != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage.repeat) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage.repeat;
          }
  
          var name = "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 2");
          }
          return $scope.statValuesToDict(name, value, percentage, label);
        }        
      }

      if(weaponType == "Squiffer") {
        if(stat == "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["Squiffer"]["FullChargeDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE") {
          var parameters = $scope.parameters["Main Power Up"]["Squiffer"]["MaxDistance"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];

          var name = "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          if(saveStat) {
            $scope.saveToggledAbility($scope.loadout.weapon.name, stat, "Main Power Up 1");
          }
          return $scope.statValuesToDict(name, value, percentage, label);          
        }

        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Squiffer"]["SplashPaintRadiusRate"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Tenta Brella") {
        if(stat == "STAT_MAIN_POWER_UP_CANOPY_HP") {
          var parameters = $scope.parameters["Main Power Up"]["Tenta Brella"]["CanopyHP"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s) / 10;
          var max_param = parameters[0] / 10;
          var min_param = parameters[2] / 10;
  
          var name = "{{ STAT_MAIN_POWER_UP_CANOPY_HP | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(result,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }
      }

      if(weaponType == "Tetra Dualies") {
        if(stat == "STAT_MAIN_POWER_UP_MIN_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Tetra Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var min_damage = result * $scope.loadout.weapon.minDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && min_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            min_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(min_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);
        }

        if(stat == "STAT_MAIN_POWER_UP_MAX_DAMAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Tetra Dualies"]["DamageRate"]["params"];
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          // Adjust max damage for MPU damage caps
          var max_damage = result * $scope.loadout.weapon.maxDamage;
          if($scope.loadout.weapon.mpuMaxDamage != null && max_damage >= $scope.loadout.weapon.mpuMaxDamage) {
            max_damage = $scope.loadout.weapon.mpuMaxDamage;
          }
  
          var name = "{{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}";
          var value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_NO_UNIT | translate }}".format({value: $scope.toFixedTrimmed(max_damage,2)});
          
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);       
        }
      }

      if(weaponType == "Tri-Slosher") {
        if(stat == "STAT_MAIN_POWER_UP_INK_COVERAGE") {
          var parameters = $scope.parameters["Main Power Up"]["Tri-Slosher"]["SplashPaintRadiusRate"]["params"];        
          var p = $scope.calcP(abilityScore);      
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
          var max_param = parameters[0];
          var min_param = parameters[2];
          
          var name = "{{ STAT_MAIN_POWER_UP_INK_COVERAGE | translate }}";
          var value = (result/max_param * 100).toFixed(1);
          var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
          var label = "{{ LABEL_PERCENT | translate }}".format({value: $scope.toFixedTrimmed((result * 100),3)});
        
          if($scope.logging) {
            var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
            console.log(main_power_up_debug_log);
          }
  
          return $scope.statValuesToDict(name, value, percentage, label);          
        }
      }

      if(weaponType == "Undercover Brella") {
        var parameters = $scope.parameters["Main Power Up"]["Undercover Brella"]["CanopyNakedFrame"]["params"];
        var p = $scope.calcP(abilityScore);      
        var s = $scope.calcS(parameters);
        var result = $scope.calcRes(parameters, p, s) / 60;
        var max_param = parameters[0] / 60;
        var min_param = parameters[2] / 60;

        var name = "{{ STAT_MAIN_POWER_UP_CANOPY_REGENERATION_TIME | translate }}";
        var value = 100 - Math.abs(((result/min_param - 1) * 100).toFixed(1));
        var percentage = Math.abs(((result/min_param - 1) * 100).toFixed(1));
        var label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(result,2)});

        if($scope.logging) {
          var main_power_up_debug_log = {"Main Power Up":result,"AP:":abilityScore,"P":p,"S":s,"Delta:":percentage}
          console.log(main_power_up_debug_log);
        }

        return $scope.statValuesToDict(name, value, percentage, label);   
      }

    }

    $scope.statBarClicked = function(name) {
      if($scope.loadout.weapon.type == "Ballpoint Splatling") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);        
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);        
        }
      }

      if($scope.loadout.weapon.type == "Bamboozler 14") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Carbon Roller") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Dynamo Roller") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "E-liter 4K Scope") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }        
      }

      if($scope.loadout.weapon.type == "E-liter 4K") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }        
      }

      if($scope.loadout.weapon.type == "Flingza Roller") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Glooga Dualies") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_BURST_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_BURST_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_BURST_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_BURST_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Goo Tuber") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Hydra Splatling") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Splat Charger") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Splat Roller") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_STANDING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_JUMPING_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_ROLLING_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }

      if($scope.loadout.weapon.type == "Splatterscope") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
      }
      
      if($scope.loadout.weapon.type == "Squeezer") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);        
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MIN_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MIN_DAMAGE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_REPEAT_MAX_DAMAGE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_MAX_DAMAGE", true);
          $scope.displayStat("Main Power Up 2", statValues.name, statValues.value, statValues.percentage, statValues.label);        
        }
      }      

      if($scope.loadout.weapon.type == "Squiffer") {
        if(name == "[+] {{ STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }
        if(name == "[+] {{ STAT_MAIN_POWER_UP_PARTIAL_CHARGE_DISTANCE | translate }}") {
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_MAIN_POWER_UP_FULL_CHARGE_DISTANCE", true);
          $scope.displayStat("Main Power Up 1", statValues.name, statValues.value, statValues.percentage, statValues.label);
        }        
      }

      // TODO: Add Charging run speeds for Charger weapons
      if($scope.loadout.weapon.class.toLowerCase() == 'splatling' || $scope.loadout.weapon.class.toLowerCase() == 'brella') {
        if(name == "[+] {{ STAT_RUN_SPEED_FIRING | translate }}") {
          var run_speed_parameters = $scope.parameters["Run Speed"]["Shooting"][$scope.loadout.weapon.shootingSpeed];
          var abilityScore = $scope.loadout.calcAbilityScore('Run Speed Up');
          var p = $scope.calcP(abilityScore);       
          var s = $scope.calcS(run_speed_parameters);
          var run_speed = $scope.calcRes(run_speed_parameters, p, s) * $scope.loadout.weapon.chargeSpeed;
          var delta = ((run_speed / $scope.loadout.weapon.chargeSpeed - 1) * 100).toFixed(1).toString();
          
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_CHARGING | translate }}";
          $scope.stats["Run Speed (Firing)"].value = run_speed;
          $scope.stats["Run Speed (Firing)"].percentage = delta;
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(run_speed,4)});
        }
        else {
          var run_speed_parameters = $scope.parameters["Run Speed"]["Shooting"][$scope.loadout.weapon.shootingSpeed];
          var abilityScore = $scope.loadout.calcAbilityScore('Run Speed Up');
          var p = $scope.calcP(abilityScore);       
          var s = $scope.calcS(run_speed_parameters);
          var run_speed = $scope.calcRes(run_speed_parameters, p, s) * $scope.loadout.weapon.baseSpeed;
          var delta = ((run_speed / $scope.loadout.weapon.baseSpeed - 1) * 100).toFixed(1).toString();
          
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_FIRING | translate }}";
          $scope.stats["Run Speed (Firing)"].value = run_speed;
          $scope.stats["Run Speed (Firing)"].percentage = delta;
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(run_speed,4)});        
        }
      }

      if($scope.loadout.weapon.class.toLowerCase() == 'roller') {
        var ink_saver_parameters = null;
        if($scope.loadout.weapon.inkSaver == 'Low') {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Low"];
        }
        if($scope.loadout.weapon.inkSaver == 'Middle') {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Mid"];
        }
        if($scope.loadout.weapon.inkSaver == "High") {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["High"];
        }

        /**************************
         * INK SAVER (MAIN) STATS *
         **************************/
        var abilityScore = $scope.loadout.calcAbilityScore('Ink Saver (Main)');
        var p = $scope.calcP(abilityScore);       
        var s = $scope.calcS(ink_saver_parameters);
        var reduction = $scope.calcRes(ink_saver_parameters, p, s);

        if(name == "[+] {{ STAT_SAVER_MAIN_ROLLING | translate }}") {
          costPerShot = $scope.loadout.weapon.horizontalInkPerShot * reduction;
          $scope.stats["Ink Consumption (Main)"].name = "[+] {{ STAT_SAVER_MAIN_HORIZONTAL_FLICK | translate }}";
          $scope.stats["Ink Consumption (Main)"].desc = "{{ DESC_MAIN_COST | translate }}".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)});       
          $scope.stats["Ink Consumption (Main)"].label = "{{ LABEL_MAIN_COST | translate }}".format({value: $scope.toFixedTrimmed(costPerShot,3), unit: "{{SHOT_UNIT_FLICK_HORIZ | translate}}"});
          $scope.stats["Ink Consumption (Main)"].value = costPerShot;
          $scope.stats["Ink Consumption (Main)"].percentage = (100 - (reduction*100)).toFixed(1);
        }
        else if(name == "[+] {{ STAT_SAVER_MAIN_HORIZONTAL_FLICK | translate }}") {
          costPerShot = $scope.loadout.weapon.verticalInkPerShot * reduction;
          $scope.stats["Ink Consumption (Main)"].name = "[+] {{ STAT_SAVER_MAIN_VERTICAL_FLICK | translate }}";
          $scope.stats["Ink Consumption (Main)"].desc = "{{ DESC_MAIN_COST | translate }}".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)});       
          $scope.stats["Ink Consumption (Main)"].label = "{{ LABEL_MAIN_COST | translate }}".format({value: $scope.toFixedTrimmed(costPerShot,3), unit: "{{SHOT_UNIT_FLICK_VERT | translate}}"});
          $scope.stats["Ink Consumption (Main)"].value = costPerShot;
          $scope.stats["Ink Consumption (Main)"].percentage = (100 - (reduction*100)).toFixed(1);
        }
        else if(name == "[+] {{ STAT_SAVER_MAIN_VERTICAL_FLICK | translate }}") {
          costPerShot = $scope.loadout.weapon.inkPerShotRolling * reduction * 60;
          $scope.stats["Ink Consumption (Main)"].name = "[+] {{ STAT_SAVER_MAIN_ROLLING | translate }}";
          $scope.stats["Ink Consumption (Main)"].desc = "{{ DESC_MAIN_COST | translate }}".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)});       
          $scope.stats["Ink Consumption (Main)"].label = "{{ INK_BREAKDOWN_INK_PER_SECOND | translate }}".format({value: $scope.toFixedTrimmed(costPerShot,3)});
          $scope.stats["Ink Consumption (Main)"].value = costPerShot;
          $scope.stats["Ink Consumption (Main)"].percentage = (100 - (reduction*100)).toFixed(1);
        }

        /****************************
         * RUN SPEED (FIRING) STATS *
         ****************************/
        var run_speed_parameters = $scope.parameters["Run Speed"]["Shooting"][$scope.loadout.weapon.shootingSpeed];
        var abilityScore = $scope.loadout.calcAbilityScore('Run Speed Up');
        var p = $scope.calcP(abilityScore);       
        var s = $scope.calcS(run_speed_parameters);
        var result = $scope.calcRes(run_speed_parameters, p, s);

        if(name == "[+] {{ STAT_RUN_SPEED_ROLLING | translate }}") {
          var run_speed = result * $scope.loadout.weapon.horizontalSwingMoveSpeed;
          var delta = ((run_speed / $scope.loadout.weapon.horizontalSwingMoveSpeed - 1) * 100).toFixed(1).toString();        
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_FLICKING_HORIZONTAL | translate }}";
          $scope.stats["Run Speed (Firing)"].value = run_speed;
          $scope.stats["Run Speed (Firing)"].percentage = delta;
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(run_speed,4)});
          $scope.stats["Run Speed (Firing)"].desc = "{{ UNIT_DISTANCE_UNITS_PER_FRAME | translate }}";
        }
        else if(name == "[+] {{ STAT_RUN_SPEED_FLICKING_HORIZONTAL | translate }}") {
          var run_speed = result * $scope.loadout.weapon.verticalSwingMoveSpeed;
          var delta = ((run_speed / $scope.loadout.weapon.verticalSwingMoveSpeed - 1) * 100).toFixed(1).toString();        
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_FLICKING_VERTICAL | translate }}";
          $scope.stats["Run Speed (Firing)"].value = run_speed;
          $scope.stats["Run Speed (Firing)"].percentage = delta;
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(run_speed,4)});
          $scope.stats["Run Speed (Firing)"].desc = "{{ UNIT_DISTANCE_UNITS_PER_FRAME | translate }}";
        }
        else if(name == "[+] {{ STAT_RUN_SPEED_FLICKING_VERTICAL | translate }}") {
          $scope.stats["Run Speed (Firing)"].value = $scope.loadout.weapon.dashSpeed;
          $scope.stats["Run Speed (Firing)"].percentage = 0.0;
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_ROLLING | translate }}";
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.loadout.weapon.dashSpeed});
          $scope.stats["Run Speed (Firing)"].desc = "{{ ROLL_SPEED | translate }}";
        }
      }

      if($scope.loadout.weapon.class.toLowerCase() == 'brush') {
        /**************************
         * INK SAVER (MAIN) STATS *
         **************************/
        var ink_saver_parameters = null;
        if($scope.loadout.weapon.inkSaver == 'Low') {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Low"];
        }
        if($scope.loadout.weapon.inkSaver == 'Middle') {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["Mid"];
        }
        if($scope.loadout.weapon.inkSaver == "High") {
          ink_saver_parameters = $scope.parameters["Ink Saver Main"]["High"];
        }

        var abilityScore = $scope.loadout.calcAbilityScore('Ink Saver (Main)');
        var p = $scope.calcP(abilityScore);
        var s = $scope.calcS(ink_saver_parameters);
        var reduction = $scope.calcRes(ink_saver_parameters, p, s);

        if(name == "[+] {{ STAT_SAVER_MAIN_ROLLING | translate }}") {
          var costPerShot = $scope.loadout.weapon.inkPerShot * reduction;
          $scope.stats["Ink Consumption (Main)"].name = "[+] {{ STAT_SAVER_MAIN | translate }}";
          $scope.stats["Ink Consumption (Main)"].desc = "{{ DESC_MAIN_COST | translate }}".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)});       
          $scope.stats["Ink Consumption (Main)"].label = "{{ LABEL_MAIN_COST | translate }}".format({value: $scope.toFixedTrimmed(costPerShot,3), unit: "{{SHOT_UNIT_FLICK_HORIZ | translate}}"});
          $scope.stats["Ink Consumption (Main)"].value = costPerShot;
          $scope.stats["Ink Consumption (Main)"].percentage = (100 - (reduction*100)).toFixed(1);
        }
        else if(name == "[+] {{ STAT_SAVER_MAIN | translate }}") {
          var costPerShot = $scope.loadout.weapon.inkPerShotRolling * reduction * 60;
          $scope.stats["Ink Consumption (Main)"].name = "[+] {{ STAT_SAVER_MAIN_ROLLING | translate }}";
          $scope.stats["Ink Consumption (Main)"].desc = "{{ DESC_MAIN_COST | translate }}".format({totalShots: Math.floor(100/costPerShot), reduction: (100 - (reduction*100)).toFixed(1)});       
          $scope.stats["Ink Consumption (Main)"].label = "{{ INK_BREAKDOWN_INK_PER_SECOND | translate }}".format({value: $scope.toFixedTrimmed(costPerShot,3)});          
          $scope.stats["Ink Consumption (Main)"].value = costPerShot;
          $scope.stats["Ink Consumption (Main)"].percentage = (100 - (reduction*100)).toFixed(1);
        }

        /****************************
         * RUN SPEED (FIRING) STATS *
         ****************************/
        if(name == "[+] {{ STAT_RUN_SPEED_DASHING | translate }}") {
          var run_speed_parameters = $scope.parameters["Run Speed"]["Shooting"][$scope.loadout.weapon.shootingSpeed];
          var abilityScore = $scope.loadout.calcAbilityScore('Run Speed Up');
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(run_speed_parameters);
          var run_speed = $scope.calcRes(run_speed_parameters, p, s) * $scope.loadout.weapon.horizontalSwingMoveSpeed;
          var delta = ((run_speed / $scope.loadout.weapon.horizontalSwingMoveSpeed - 1) * 100).toFixed(1).toString();        

          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_FLICKING | translate }}";
          $scope.stats["Run Speed (Firing)"].value = run_speed;
          $scope.stats["Run Speed (Firing)"].percentage = delta;
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(run_speed,4)});
          $scope.stats["Run Speed (Firing)"].desc = "{{ UNIT_DISTANCE_UNITS_PER_FRAME | translate }}";
        }
        else if(name == "[+] {{ STAT_RUN_SPEED_FLICKING | translate }}") {
          var parameters = null;            
          if($scope.loadout.weapon.name.indexOf('Inkbrush') != -1) {
            parameters = $scope.parameters["Main Power Up"]["Inkbrush"]["DashSpeed"]["params"];
          }
          if($scope.loadout.weapon.name.indexOf('Octobrush') != -1 || $scope.loadout.weapon.name.indexOf('Herobrush Replica') != -1) {
            parameters = $scope.parameters["Main Power Up"]["Octobrush"]["DashSpeed"]["params"];
          }
          
          var abilityScore = $scope.loadout.calcAbilityScore('Main Power Up');
          var p = $scope.calcP(abilityScore);
          var s = $scope.calcS(parameters);
          var result = $scope.calcRes(parameters, p, s);
    
          var max_param = parameters[0];
          var min_param = parameters[2];
  
          $scope.stats["Run Speed (Firing)"].name = "[+] {{ STAT_RUN_SPEED_DASHING | translate }}";
          $scope.stats["Run Speed (Firing)"].value = $scope.toFixedTrimmed((result/max_param) * 100,2);
          $scope.stats["Run Speed (Firing)"].percentage = ((result/min_param - 1) * 100).toFixed(1);            
          $scope.stats["Run Speed (Firing)"].label = "{{ LABEL_DISTANCE_PER_FRAME | translate }}".format({value: $scope.toFixedTrimmed(result,4)});
          $scope.stats["Run Speed (Firing)"].desc = "{{ BRUSH_SPEED | translate }}";
        }
      }

      switch(name) {
        case "[+] {{ STAT_TRACKING_TIME_POINT_SENSOR | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Bomb Defense Up DX');
          var tracking_time_parameters = $scope.parameters["Cold Blooded"]["Ink Mine"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(tracking_time_parameters);
          var modifier = this.calcRes(tracking_time_parameters, p, s);
    
          var duration = 5 * modifier;
          var max_duration = 5;
          var min_duration = tracking_time_parameters[2] * 5;
    
          $scope.stats["Tracking Time"].name = "[+] {{ STAT_TRACKING_TIME_INK_MINE | translate }}"
          $scope.stats["Tracking Time"].value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          $scope.stats["Tracking Time"].percentage = ((duration/min_duration - 1) * 100).toFixed(1);
          $scope.stats["Tracking Time"].label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(duration,2)})
          $scope.stats["Tracking Time"].desc = "{{ DESC_TRACKING | translate }}";
          break;
          
        case "[+] {{ STAT_TRACKING_TIME_INK_MINE | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Bomb Defense Up DX');
          var tracking_time_parameters = $scope.parameters["Cold Blooded"]["Point Sensor"];
          var p = this.calcP(abilityScore);      
          var s = this.calcS(tracking_time_parameters);
          var modifier = this.calcRes(tracking_time_parameters, p, s);
    
          var duration = 8 * modifier;
          var max_duration = 8;
          var min_duration = tracking_time_parameters[2] * 8;
    
          $scope.stats["Tracking Time"].name = "[+] {{ STAT_TRACKING_TIME_POINT_SENSOR | translate }}"
          $scope.stats["Tracking Time"].value = $scope.toFixedTrimmed((duration/max_duration) * 100,2);
          $scope.stats["Tracking Time"].percentage = ((duration/min_duration - 1) * 100).toFixed(1);
          $scope.stats["Tracking Time"].label = "{{ LABEL_TIME | translate }}".format({value: $scope.toFixedTrimmed(duration,2)})
          $scope.stats["Tracking Time"].desc = "{{ DESC_TRACKING | translate }}";
          break;

        case "[+] {{ STAT_SPECIAL_SAVER | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Special Saver');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SPECIAL_SAVER_ON_DEATH", true);
          $scope.displayStat("Special Saved", statValues.name, statValues.value, statValues.percentage, statValues.label);
          break;

        case "[+] {{ STAT_SPECIAL_SAVER_ON_DEATH | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Special Saver');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SPECIAL_SAVER", true);
          $scope.displayStat("Special Saved", statValues.name, statValues.value, statValues.percentage, statValues.label);
          break;

        case "[+] {{ STAT_SUB_POWER_RANGE | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Sub Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SUB_POWER_TRACKING_TIME", true);
          $scope.displayStat("Sub Power", statValues.name, statValues.value, statValues.percentage, statValues.label);
          break;

        case "[+] {{ STAT_SUB_POWER_TRACKING_TIME | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Sub Power Up');
          var equippedSub = $scope.getSubByName($scope.loadout.weapon.sub);

          if(equippedSub.name == "Point Sensor") {
            var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SUB_POWER_RANGE", true);
          }
          if(equippedSub.name == "Ink Mine") {
            var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SUB_POWER_MINE", true);
          }

          $scope.displayStat("Sub Power", statValues.name, statValues.value, statValues.percentage, statValues.label);
          break;

        case "[+] {{ STAT_SUB_POWER_MINE | translate }}":
          var abilityScore = $scope.loadout.calcAbilityScore('Sub Power Up');
          var statValues = $scope.calcStat(abilityScore, $scope.loadout.weapon.type, "STAT_SUB_POWER_TRACKING_TIME", true);
          $scope.displayStat("Sub Power", statValues.name, statValues.value, statValues.percentage, statValues.label);
          break;
      }
    }

    // TODO: Re-enable these when localisations are updated.
    $scope.languages = {
      'en_US': 'English',
      'ja_JP': '日本語',
      // 'es_ES': 'Español (ES)',
      // 'es_MX': 'Español (MX)',
      'fr_FR': 'Français (FR)',
      // 'fr_CA': 'Français (CA)',
      // 'it_IT': 'Italiano',
      // 'zh_HK': '中文 (香港)'
    }

    $scope.weaponRanks = [
      "Kensa Splattershot Pro",
      "Tentatek Splattershot",
      "Splat Roller",
      "Mini Splatling",
      "Enperry Splat Dualies",
      "Custom Dualie Squelchers",
      "Range Blaster",
      "Slosher Deco",
      "Splatterscope",
      "Kensa Sloshing Machine",
      "Custom Explosher",
      "Splat Brella",
      "Kensa Splat Dualies",
      "Custom Hydra Splatling",
      "Splat Charger",
      "Dark Tetra Dualies",
      "N-ZAP '85",
      "Splattershot Jr.",
      "Heavy Splatling",
      "H-3 Nozzlenose D",
      "Ballpoint Splatling Nouveau",
      "Kensa Rapid Blaster",
      "Kensa Dynamo Roller",
      "Dapple Dualies Nouveau",
      "Custom Blaster",
      "Bamboozler 14 Mk I",
      "Carbon Roller Deco",
      "Kensa Undercover Brella",
      "Tenta Brella",
      ".96 Gal Deco",
      "Kensa Splattershot",
      "Forge Splattershot Pro",
      "Sploosh-o-matic",
      ".96 Gal",
      "E-liter 4K Scope",
      "Glooga Dualies Deco",
      "Gold Dynamo Roller",
      "Bloblobber",
      "Inkbrush Nouveau",
      "Inkbrush",
      "Luna Blaster",
      "E-liter 4K",
      "Custom Jet Squelcher",
      "Splattershot",
      "Custom Splattershot Jr.",
      "Kensa Splattershot Jr.",
      "Neo Splash-o-matic",
      "Octobrush",
      "Dapple Dualies",
      "Rapid Blaster Pro",
      "Splattershot Pro",
      "Foil Flingza Roller",
      "Splash-o-matic",
      "Sloshing Machine",
      "Octobrush Nouveau",
      "L-3 Nozzlenose",
      "Dualie Squelchers",
      "Blaster",
      "Kensa Octobrush",
      "Carbon Roller",
      "Kensa Mini Splatling",
      "Foil Squeezer",
      "Kensa .52 Gal",
      "Nautilus 47",
      "New Squiffer",
      "Krak-On Splat Roller",
      "Zink Mini Splatling ",
      "L-3 Nozzlenose D",
      "Dynamo Roller",
      "Clash Blaster Neo",
      "Ballpoint Splatling",
      "Kensa Glooga Dualies",
      "Neo Sploosh-o-matic",
      "Slosher",
      "Kensa L-3 Nozzlenose",
      "Kensa Luna Blaster",
      "Kensa Splat Roller",
      "Bloblobber Deco",
      "Heavy Splatling Deco",
      "Explosher",
      "Tri-Slosher",
      "Splat Dualies",
      "Rapid Blaster Pro Deco",
      "Nautilus 79",
      "Classic Squiffer",
      "N-ZAP '89",
      "Undercover Brella",
      "Aerospray RG",
      "Kensa Charger",
      "Tenta Sorella Brella",
      "Undercover Sorella Brella",
      "Sloshing Machine Neo",
      "Firefin Splatterscope",
      ".52 Gal Deco",
      "Flingza Roller",
      "Clash Blaster",
      "Light Tetra Dualies",
      "Rapid Blaster",
      "Rapid Blaster Deco",
      "Sorella Brella"
     ];

    $scope.parameters = {
      "Ink Saver Sub": {
          "A": [0.8, 0.9, 1.0],
          "B": [0.7, 0.85, 1.0],
          "C": [0.65, 0.825, 1.0],
          "D": [0.6, 0.8, 1.0],
          "E": [0.5, 0.75, 1.0],
          "F": [1.0, 1.0, 1.0]
      },
  
      "Ink Saver Main": {
          "Low": [0.6, 0.8, 1.0],
          "High": [0.5, 0.7, 1.0],
          "Mid": [0.55, 0.775, 1.0]
      },
  
      "Bomb Defense": {
          "Special": [0.65, 0.825, 1.0],
          "Additional": [1.0, 1.0, 1.0],
          "Heavy Light": [0.6, 0.8, 1.0],
          "Heavy Sub": [0.5, 0.75, 1.0]
      },
  
      "Special Charge Up": {
          "default": [1.3, 1.15, 1.0]
      },
  
      "Quick Respawn": {
          "Die Frames": [30.0, 60.0, 90.0],
          "Deathcam Frames": [90.0, 180.0, 270.0]
      },
  
      "Special Saver": {
          "Splashdown": [1.25, 1.05, 0.75],
          "default": [1.0, 0.8, 0.5]
      },
  
      "Swim Speed": {
          "Light": [2.4, 2.208, 2.016],
          "Heavy": [2.4, 2.064, 1.728],
          "Mid": [2.4, 2.16, 1.92]
      },
  
      "Special Power Up": {
          "Curling Bomb Launcher": [520, 460, 400],
          "Other Bomb Launcher": [480, 420, 360],
          "Inkjet Duration": [510, 480, 450],
          "Tenta Missiles Cross Paint Ray Length": [30.0, 30.0, 30.0],
          "Ultra Stamp Duration": [660, 600, 540],
          "Baller HP": [6000, 5000, 4000],
          "Tenta Missiles Paint Radius": [34, 32, 30],
          "Booyah Ball Auto Charge Increase": [0.01, 0.006, 0.002],
          "Splash Down Burst Radius Far (Stealth Jump)": [140.0, 140.0, 140.0],
          "Ink Armor Duration": [540, 450, 360],
          "Ink Armor Wind Up Time": [30, 60, 90],
          "Booyah Ball Object Shredder Multiplier": [1.05, 1.025, 1.0],
          "Splash Down Burst Radius Far": [140.0, 140.0, 140.0],
          "Inkjet Explosion Paint Splash Velocity L": [5.2, 5.05, 4.9],
          "Ink Storm Duration": [600, 540, 480],
          "Inkjet Explosion Paint Splash Radius": [7, 6.65, 6.3],
          "Tenta Missiles Cross Paint Radius": [20.0, 20.0, 20.0],
          "Tenta Missiles Target Circle Radius": [240.0, 190.0, 140.0],
          "Splash Down Jump-In Additional Height (Stealth Jump)": [40.0, 20.0, 0.0],
          "Splash Down Jump-In Height (Stealth Jump)": [100.0, 60.0, 20.0],
          "Splash Down Burst Radius Midle (Stealth Jump)": [112.5, 112.5, 112.5],
          "Splash Down Jump-In Additional Height": [40.0, 20.0, 0.0],
          "Inkjet Bullet Damage Radius Multiplier": [1.3, 1.15, 1.0],
          "Sting Ray Duration": [585, 525, 465],
          "Bubble Blower Bubble Radius Multiplier": [1.3, 1.18, 1.0],
          "Splash Down Burst Radius Close (Stealth Jump)": [90.0, 90.0, 90.0],
          "Splash Down Jump-In Height": [100.0, 60.0, 20.0],
          "Bubble Blower Burst Paint Radius": [80, 68, 56],
          "Bubble Blower Object Shredder Multiplier": [1.3, 1.3, 1.0],
          "Inkjet Explosion Paint Radius": [40, 36, 32],
          "Splash Down Burst Radius Close": [110.0, 90.0, 70.0],
          "Splash Down Burst Radius Middle": [125.0, 112.5, 100.0],
          "Bubble Blower Maximum Collision Player Radius": [35, 27.5, 20],
          "Ink Armor Object Shredder Multiplier": [3.0, 3.0, 1.0],
          "Inkjet Explosion Paint Splash Velocity H": [3.5, 3.4, 3.3]
      },
  
      "Ink Recovery Up": {
          "Standing": [220.0, 410.0, 600.0],
          "In Ink": [117.0, 148.5, 180.0]
      },
  
      "Cold Blooded": {
          "Thermal Ink Time Reduction": [1.0, 1.0, 1.0],
          "Silhouette Close": [250.0, 190.0, 130.0],
          "Silhouette Far": [290.0, 230.0, 170.0],
          "Point Sensor": [0.1, 0.43, 1.0],
          "Ink Mine": [0.1, 0.55, 1.0]
      },
  
      "Ink Resistance": {
          "Dmg Per Frame": [0.0015, 0.00225, 0.003],
          "Run": [0.768, 0.5568, 0.24],
          "Dmg Limit": [0.2, 0.3, 0.4],
          "Shoot K": [1.0, 0.75, 0.5],
          "Jump": [1.1, 0.98, 0.8],
          "Shoot": [0.4, 0.26, 0.12],
          "Jump(story)": [1.05, 0.825, 0.6],
          "Invuln Frames": [39.0, 26.0, 0.0]
      },

      "Quick Super Jump": {
          "Jump": [96.6, 132.3, 138.0],
          "Prepare": [20.0, 35.0, 80.0]
      },
  
      "Run Speed": {
        "Light": [1.44, 1.24, 1.04],
        "Heavy": [1.44, 1.16, 0.88],
        "Mid": [1.44, 1.2, 0.96],
        "Shooting": {
          "A": [1.2, 1.1, 1.0],
          "B": [1.25, 1.125, 1.0],
          "C": [1.3, 1.15, 1.0],
          "D": [1.35, 1.175, 1.0],
          "E": [1.4, 1.2, 1.0]
        }
      },

      "Sub Power Up": {
          "Point Sensor Distance Up": [19.0, 17.0, 15.0],
          "Splash Wall Max HP": [15000, 11500, 8000],
          "Ink Mine Mark Radius": [1.375, 1.1875, 1.0],
          "Ink Mine Mark Time Duration": [600, 450, 300],
          "Sprinkler First Phase Duration": [600, 450, 300],
          "Splash Wall Object Shredder Multiplier": [1.5, 1.5, 1.5],
          "Torpedo Distance Up": [18.4, 16.0, 13.6],
          "Beakon Object Shredder Multiplier": [10.0, 10.0, 10.0],
          "Fizzy Bomb Distance Up": [18.4, 16.0, 13.6],
          "Sprinkler Object Shredder Multiplier": [10.0, 10.0, 10.0],
          "Sprinkler Second Phase Duration": [1020, 960, 900],
          "General Bomb Distance Up": [16.8, 14.0, 11.2],
          "Point Sensor Mark Time Duration": [960, 720, 480]
      },

      "Main Power Up": {
        ".52 Gal": {
          "DegRandom": {
            "desc": "Ground Shot Randomization",
            "params": [
              4.8,
              5.2,
              6.0
            ]
          },
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              6.0,
              8.0,
              12.0
            ],
          }
        },
        ".96 Gal": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.25,
              1.125,
              1.0
            ]
          }
        },
        "Aerospray": {
          "SplashPaintRadius": {
            "desc": "Increased Ink Coverage",
            "params": [
              14.0,
              13.3,
              12.0
            ]
          }
        },
        "Ballpoint Splatling": {
          "DamageRate": {
            "desc": "Damage Up",
            "normal_params": [
              1.1,
              1.05,
              1.0
            ],
            "repeat_params": [
              1.1,
              1.05,
              1.0
            ]
          }
        },
        "Bamboozler 14": {
          "MinMaxChargeDamageRate": {
            "desc": "Partial Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          },
          "FullChargeDamageRate": {
            "desc": "Full Charge Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]            
          }
        },
        "Blaster": {
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              6.0,
              8.0,
              10.0
            ]
          }
        },
        "Bloblobber": {
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Carbon Roller": {
          "DamageRate": {
            "desc": "Damage Up",
            "rolling": [
              1.15,
              1.075,
              1.0
            ],
            "standing": [
              1.15,
              1.075,
              1.0
            ],
            "jumping": [
              1.15,
              1.075,
              1.0
            ]
          }
        },
        "Clash Blaster": {
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              4.0,
              6.0,
              8.0
            ]
          }
        },
        "Dapple Dualies": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Dualie Squelchers": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Dynamo Roller": {
          "DamageRate": {
            "desc": "Damage Up",
            "rolling": [
              1.15,
              1.075,
              1.0
            ],
            "standing": [
              1.15,
              1.075,
              1.0
            ],
            "jumping": [
              1.15,
              1.075,
              1.0
            ]
          }
        },
        "E-liter 4K Scope": {
          "FullChargeDistance": {
            "desc": "Full Charge Distance",
            "params": [
              325.5,
              318.0,
              310.5
            ]            
          },
          "MaxDistance": {
            "desc": "Partial Charge Distance",     
            "params": [
              305.5,
              298.0,
              290.5
            ]       
          },
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.17,
              1.12,
              1.0
            ]
          }
        },
        "E-liter 4K": {
          "FullChargeDistance": {
            "desc": "Full Charge Distance",
            "params": [
              305.5,
              298.0,
              290.5
            ]            
          },
          "MaxDistance": {
            "desc": "Partial Charge Distance",     
            "params": [
              305.5,
              298.0,
              290.5
            ]       
          },
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.17,
              1.12,
              1.0
            ]
          }
        },
        "Explosher": {
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.3,
              1.15,
              1.0
            ]
          }
        },
        "Flingza Roller": {
          "DamageRate": {
            "desc": "Damage Up",
            "rolling": [
              1.15,
              1.1,
              1.0
            ],
            "standing": [
              1.15,
              1.1,
              1.0
            ],
            "jumping": [
              1.15,
              1.1,
              1.0
            ]
          }
        },
        "Glooga Dualies": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          },
          "SideStepOneMuzzleDamageRate": {
            "desc": "Burst Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Goo Tuber": {
          "MinMaxChargeDamageRate": {
            "desc": "Partial Damage Up",
            "params": [
              1.15,
              1.075,
              1.0
            ]
          },
          "FullChargeDamageRate": {
            "desc": "Full Charge Damage Up",
            "params": [
              1.15,
              1.075,
              1.0
            ]            
          }
        },
        "H-3 Nozzlenose": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.24,
              1.12,
              1.0
            ]
          }
        },
        "Heavy Splatling": {
          "MaxChargeShootingFrameTimes": {
            "desc": "Burst Duration",
            "params": [
              1.24,
              1.12,
              1.0
            ]
          }
        },
        "Hydra Splatling": {
          "DamageRate": {
            "desc": "Partial Charge Damage Up",
            "params": [
              1.1,
              1.05,
              1.0
            ]
          },
          "DamageMaxMaxChargeRate": {
            "desc": "Full Charge Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Inkbrush": {
          "DashSpeed": {
            "desc": "Dash Speed",
            "params": [
              2.016,
              1.986,
              1.92
            ]
          },
          "CorePaintWidthHalfRate": {
            "desc": "Ink Trail Width",
            "params": [
              1.48,
              1.32,
              1.0
            ]
          }          
        },
        "Jet Squelcher": {
          "DegRandom": {
            "desc": "Ground Shot Randomization",
            "params": [
              2.1,
              2.45,
              3.0
            ]
          },
          "InitVelRate": {
            "desc": "Bullet Velocity",
            "params": [
              1.0846,
              1.0299,
              1.0
            ]
          }
        },
        "L-3 Nozzlenose": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.3,
              1.15,
              1.0
            ]
          }
        },
        "Luna Blaster": {
          "CollisionRadiusRate": {
            "desc": "Increased Explosion Radius",
            "params": [
              3.0,
              1.75,
              1.0
            ]
          },
          "SphereSplashDropPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.09375,
              1.05625,
              1.0
            ]
          }
        },
        "Mini Splatling": {
          "MaxChargeShootingFrameTimes": {
            "desc": "Burst Duration",
            "params": [
              1.35,
              1.25,
              1.0
            ]
          }
        },
        "N-ZAP": {
          "SplashPaintRadius": {
            "desc": "Increased Ink Coverage",
            "params": [
              13.2,
              12.6,
              11.6
            ]
          },
          "DegRandom": {
            "desc": "Ground Shot Randomization",
            "params": [
              4.8,
              5.2,
              6.0
            ]
          }
        },
        "Nautilus": {
          "MaxChargeShootingFrameTimes": {
            "desc": "Burst Duration",
            "params": [
              1.3,
              1.2,
              1.0
            ]
          }
        },
        "Octobrush": {
          "DashSpeed": {
            "desc": "Dash Speed",
            "params": [
              1.8816,
              1.806,
              1.68
            ]
          },
          "CorePaintWidthHalfRate": {
            "desc": "Ink Trail Width",
            "params": [
              1.6,
              1.3,
              1.0
            ]
          }
        },
        "Range Blaster": {
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              5.0,
              6.5,
              8.0
            ]
          }
        },
        "Rapid Blaster Pro": {
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              4.0,
              6.0,
              8.0
            ]
          },
          "CollisionRadiusRate": {
            "desc": "Increased Explosion Radius",
            "params": [
              1.093939,
              1.036364, 
              1.0
            ]
          }
        },
        "Rapid Blaster": {
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              4.0,
              6.0,
              8.0
            ]
          },
          "CollisionRadiusRate": {
            "desc": "Increased Explosion Radius",
            "params": [
              1.093939,
              1.036364, 
              1.0
            ]
          }
        },
        "Slosher": {
          "BulletDamageMaxDist": {
            "desc": "Max Damage Range",
            "params": [
              55.0,
              35.0,
              15.0
            ]
          }
        },
        "Sloshing Machine": {
          "PaintRRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.15,
              1.075,
              1.0
            ]
          }
        },
        "Splash-o-matic": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.25,
              1.125,
              1.0
            ]
          }
        },
        "Splat Brella": {
          "CanopyNakedFrame": {
            "desc": "Canopy Regeneration Time",
            "params": [
              210.0,
              300.0,
              390.0
            ]
          }
        },
        "Splat Charger": {
          "MinMaxChargeDamageRate": {
            "desc": "Partial Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          },
          "FullChargeDamageRate": {
            "desc": "Full Charge Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]            
          }
        },
        "Splat Dualies": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.16,
              1.06,
              1.0
            ]
          }
        },
        "Splat Roller": {
          "DamageRate": {
            "desc": "Damage Up",
            "rolling": [
              1.15,
              1.1,
              1.0
            ],
            "standing": [
              1.15,
              1.1,
              1.0
            ],
            "jumping": [
              1.15,
              1.1,
              1.0
            ]
          }
        },
        "Splatterscope": {
          "MinMaxChargeDamageRate": {
            "desc": "Partial Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          },
          "FullChargeDamageRate": {
            "desc": "Full Charge Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]            
          }
        },
        "Splattershot Jr.": {
          "SplashPaintRadius": {
            "desc": "Increased Ink Coverage",
            "params": [
              15.5,
              13.7,
              12.9
            ]
          }
        },
        "Splattershot Pro": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.216,
              1.108,
              1.0
            ]
          }
        },
        "Splattershot": {
          "DegRandom": {
            "desc": "Ground Shot Randomization",
            "params": [
              4.8,
              5.2,
              6.0
            ]
          },
          "DegJumpRandom": {
            "desc": "Jump Shot Randomization",
            "params": [
              6.0,
              8.0,
              12.0
            ],
          }
        },
        "Sploosh-o-matic": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.25,
              1.125,
              1.0
            ]
          }
        },
        "Squeezer": {
          "DamageRate": {
            "desc": "Damage Up",
            "normal_params": [
              1.3,
              1.15,
              1.0
            ],
            "repeat_params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Squiffer": {
          "FullChargeDistance": {
            "desc": "Full Charge Distance",
            "params": [
              182.65,
              175.15,
              167.65
            ]            
          },
          "MaxDistance": {
            "desc": "Partial Charge Distance",     
            "params": [
              182.65,
              175.15,
              167.65
            ]       
          },
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.24,
              1.12,
              1.0
            ]
          }        
        },
        "Tenta Brella": {
          "CanopyHP": {
            "desc": "Canopy HP",
            "params": [
              10000,
              8500,
              7000
            ]
          }
        },
        "Tetra Dualies": {
          "DamageRate": {
            "desc": "Damage Up",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Tri-Slosher": {
          "SplashPaintRadiusRate": {
            "desc": "Increased Ink Coverage",
            "params": [
              1.2,
              1.1,
              1.0
            ]
          }
        },
        "Undercover Brella": {
          "CanopyNakedFrame": {
            "desc": "Canopy Regeneration Time",
            "params": [
              150,
              180,
              270
            ]
          }
        }
      }
    }
  }])
  .filter("trust", ['$sce', function($sce) {
    return function(htmlCode){
      return $sce.trustAsHtml(htmlCode);
    }
  }]);
