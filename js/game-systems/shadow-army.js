class ShadowArmySystem {
    constructor() {
        this.soldiers = [];
        this.maxCapacity = 10; // Évolue avec le rang et le charisme
        this.generals = []; // Soldats évolués
        this.currentFormation = 'default';
        
        this.loadFromSave();
    }
    
    extractSoldier(enemy) {
        if (this.soldiers.length >= this.maxCapacity) {
            UI.Notifications.show('Capacité maximale atteinte!', 'warning');
            return false;
        }
        
        // Calculer le taux de réussite basé sur le rang et les stats
        const successRate = this.calculateExtractionRate(enemy);
        if (Math.random() > successRate) {
            UI.Notifications.show('Échec de l\'extraction!', 'error');
            return false;
        }
        
        // Créer un soldat basé sur l'ennemi
        const soldier = this.createSoldierFromEnemy(enemy);
        this.soldiers.push(soldier);
        
        // Effet visuel
        this.playExtractionEffect(enemy);
        
        // Notification
        UI.Notifications.show(`Soldat d'ombre extrait: ${soldier.name}`, 'success');
        
        // Sauvegarder
        this.save();
        
        return soldier;
    }
    
    calculateExtractionRate(enemy) {
        const baseRate = 0.3; // 30% de base
        const rankBonus = this.getRankBonus();
        const charismaBonus = EvolutionSystem.stats.charisma * 0.01;
        const enemyTierModifier = this.getEnemyTierModifier(enemy.tier);
        
        return Math.min(0.95, baseRate + rankBonus + charismaBonus + enemyTierModifier);
    }
    
    getRankBonus() {
        const bonuses = {
            'E': 0.0,
            'D': 0.1,
            'C': 0.2,
            'B': 0.3,
            'A': 0.4,
            'S': 0.5,
            'SS': 0.6,
            'SSS': 0.7
        };
        return bonuses[EvolutionSystem.rank] || 0;
    }
    
    getEnemyTierModifier(tier) {
        // Plus l'ennemi est fort, plus c'est difficile à extraire
        const modifiers = {
            'common': 0.1,
            'uncommon': 0.05,
            'rare': 0.0,
            'elite': -0.1,
            'boss': -0.2,
            'legendary': -0.3
        };
        return modifiers[tier] || 0;
    }
    
    createSoldierFromEnemy(enemy) {
        const soldierTypes = {
            'goblin': { name: 'Goblin Ombre', type: 'infantry', tier: 'common' },
            'orc': { name: 'Orc Ombre', type: 'warrior', tier: 'uncommon' },
            'mage': { name: 'Mage Ombre', type: 'mage', tier: 'rare' },
            'knight': { name: 'Chevalier Ombre', type: 'knight', tier: 'elite' },
            'dragon': { name: 'Dragon Ombre', type: 'dragon', tier: 'legendary' }
        };
        
        const enemyType = enemy.type || 'goblin';
        const template = soldierTypes[enemyType] || soldierTypes.goblin;
        
        return {
            id: Date.now() + Math.random(),
            name: template.name,
            type: template.type,
            tier: template.tier,
            level: 1,
            exp: 0,
            stats: this.generateSoldierStats(template.tier),
            skills: [],
            model: enemy.type, // Référence au modèle 3D
            equipped: false // Si assigné à une formation
        };
    }
    
    generateSoldierStats(tier) {
        const baseStats = {
            health: 50,
            damage: 10,
            defense: 5,
            speed: 1.0
        };
        
        const multipliers = {
            'common': 1.0,
            'uncommon': 1.5,
            'rare': 2.0,
            'elite': 3.0,
            'legendary': 5.0
        };
        
        const multiplier = multipliers[tier] || 1.0;
        
        return {
            health: Math.floor(baseStats.health * multiplier),
            damage: Math.floor(baseStats.damage * multiplier),
            defense: Math.floor(baseStats.defense * multiplier),
            speed: baseStats.speed * multiplier
        };
    }
    
    playExtractionEffect(enemy) {
        if (!window.game) return;
        
        // Effet visuel d'extraction
        const position = enemy.position.clone();
        
        // Créer un vortex d'ombre
        const vortexGeometry = new THREE.ConeGeometry(1, 3, 8);
        const vortexMaterial = new THREE.MeshBasicMaterial({
            color: 0x6d28d9,
            transparent: true,
            opacity: 0.7
        });
        
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
        vortex.position.copy(position);
        vortex.rotation.x = Math.PI;
        
        window.game.scene.add(vortex);
        
        // Animation
        let scale = 0.1;
        let opacity = 0.7;
        
        const animate = () => {
            scale += 0.1;
            opacity -= 0.02;
            
            vortex.scale.setScalar(scale);
            vortexMaterial.opacity = opacity;
            vortex.rotation.z += 0.1;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(vortex);
                vortexGeometry.dispose();
                vortexMaterial.dispose();
            }
        };
        
        animate();
        
        // Son
        AudioManager.play('extraction');
    }
    
    levelUpSoldier(soldierId) {
        const soldier = this.soldiers.find(s => s.id === soldierId);
        if (!soldier) return false;
        
        soldier.level++;
        soldier.exp = 0;
        
        // Améliorer les stats
        const growthRates = {
            'common': 1.1,
            'uncommon': 1.15,
            'rare': 1.2,
            'elite': 1.25,
            'legendary': 1.3
        };
        
        const growth = growthRates[soldier.tier] || 1.1;
        
        soldier.stats.health = Math.floor(soldier.stats.health * growth);
        soldier.stats.damage = Math.floor(soldier.stats.damage * growth);
        soldier.stats.defense = Math.floor(soldier.stats.defense * growth);
        
        // Vérifier l'évolution
        this.checkSoldierEvolution(soldier);
        
        // Sauvegarder
        this.save();
        
        return true;
    }
    
    checkSoldierEvolution(soldier) {
        // Évolution à des niveaux spécifiques
        const evolutionLevels = [10, 20, 30, 40, 50];
        
        if (evolutionLevels.includes(soldier.level)) {
            this.evolveSoldier(soldier);
        }
    }
    
    evolveSoldier(soldier) {
        const evolutionMap = {
            'infantry': 'warrior',
            'warrior': 'knight',
            'mage': 'archmage',
            'knight': 'paladin',
            'dragon': 'ancient dragon'
        };
        
        const newType = evolutionMap[soldier.type];
        if (newType) {
            const oldType = soldier.type;
            soldier.type = newType;
            soldier.name = `${newType} ombre`;
            
            // Amélioration significative des stats
            soldier.stats.health = Math.floor(soldier.stats.health * 1.5);
            soldier.stats.damage = Math.floor(soldier.stats.damage * 1.5);
            soldier.stats.defense = Math.floor(soldier.stats.defense * 1.5);
            
            UI.Notifications.show(`${soldier.name} a évolué!`, 'evolution');
            
            // Animation d'évolution
            this.playSoldierEvolutionEffect(soldier);
        }
    }
    
    playSoldierEvolutionEffect(soldier) {
        // Trouver le soldat dans la scène (si actif)
        // Pour l'instant, effet visuel générique
        if (window.game && window.game.shadowSoldiers) {
            const soldierMesh = window.game.shadowSoldiers.find(s => s.userData.id === soldier.id);
            if (soldierMesh) {
                // Flash de lumière
                const flashLight = new THREE.PointLight(0x00f3ff, 2, 10);
                flashLight.position.copy(soldierMesh.position);
                window.game.scene.add(flashLight);
                
                setTimeout(() => {
                    window.game.scene.remove(flashLight);
                }, 1000);
            }
        }
    }
    
    setFormation(formationType) {
        this.currentFormation = formationType;
        
        // Appliquer les bonus de formation
        const formationBonuses = {
            'default': { damage: 1.0, defense: 1.0 },
            'offensive': { damage: 1.3, defense: 0.8 },
            'defensive': { damage: 0.8, defense: 1.5 },
            'balanced': { damage: 1.1, defense: 1.1 }
        };
        
        this.formationBonus = formationBonuses[formationType] || formationBonuses.default;
        
        // Mettre à jour l'UI
        UI.ArmyUI.updateFormation(this.currentFormation);
        
        // Sauvegarder
        this.save();
    }
    
    sendOnMission(soldierIds, missionType) {
        // Envoyer des soldats en mission pour obtenir des récompenses
        const selectedSoldiers = this.soldiers.filter(s => soldierIds.includes(s.id));
        
        if (selectedSoldiers.length === 0) return false;
        
        const missionDuration = this.getMissionDuration(missionType);
        const missionRewards = this.calculateMissionRewards(selectedSoldiers, missionType);
        
        // Marquer les soldats comme occupés
        selectedSoldiers.forEach(soldier => {
            soldier.onMission = true;
            soldier.missionEndTime = Date.now() + missionDuration;
        });
        
        // Sauvegarder
        this.save();
        
        // Démarrer le timer
        this.startMissionTimer(selectedSoldiers, missionRewards, missionDuration);
        
        return {
            duration: missionDuration,
            rewards: missionRewards
        };
    }
    
    getMissionDuration(missionType) {
        const durations = {
            'short': 5 * 60 * 1000, // 5 minutes
            'medium': 30 * 60 * 1000, // 30 minutes
            'long': 2 * 60 * 60 * 1000, // 2 heures
            'overnight': 8 * 60 * 60 * 1000 // 8 heures
        };
        return durations[missionType] || durations.short;
    }
    
    calculateMissionRewards(soldiers, missionType) {
        const totalPower = soldiers.reduce((sum, soldier) => {
            return sum + (soldier.stats.damage + soldier.stats.defense) * soldier.level;
        }, 0);
        
        const rewardMultipliers = {
            'short': 1,
            'medium': 3,
            'long': 10,
            'overnight': 25
        };
        
        const multiplier = rewardMultipliers[missionType] || 1;
        
        return {
            exp: Math.floor(totalPower * 0.1 * multiplier),
            gold: Math.floor(totalPower * 0.5 * multiplier),
            items: this.generateMissionItems(soldiers.length, missionType)
        };
    }
    
    generateMissionItems(soldierCount, missionType) {
        const items = [];
        const rarityChances = {
            'short': { common: 0.8, uncommon: 0.2 },
            'medium': { common: 0.6, uncommon: 0.3, rare: 0.1 },
            'long': { common: 0.4, uncommon: 0.4, rare: 0.2 },
            'overnight': { common: 0.2, uncommon: 0.4, rare: 0.3, epic: 0.1 }
        };
        
        const chances = rarityChances[missionType] || rarityChances.short;
        
        for (let i = 0; i < soldierCount; i++) {
            const rand = Math.random();
            let cumulative = 0;
            
            for (const [rarity, chance] of Object.entries(chances)) {
                cumulative += chance;
                if (rand <= cumulative) {
                    items.push({
                        type: 'consumable',
                        rarity: rarity,
                        name: `${rarity} item`
                    });
                    break;
                }
            }
        }
        
        return items;
    }
    
    startMissionTimer(soldiers, rewards, duration) {
        const missionId = Date.now();
        
        const timer = setTimeout(() => {
            this.completeMission(soldiers, rewards, missionId);
        }, duration);
        
        // Stocker le timer pour annulation possible
        this.missionTimers[missionId] = {
            timer: timer,
            soldiers: soldiers,
            endTime: Date.now() + duration
        };
        
        // Mettre à jour l'UI
        UI.ArmyUI.showMissionStarted(soldiers.length, duration);
    }
    
    completeMission(soldiers, rewards, missionId) {
        // Libérer les soldats
        soldiers.forEach(soldier => {
            soldier.onMission = false;
            soldier.missionEndTime = null;
            soldier.exp += rewards.exp;
            
            // Vérifier le niveau up
            while (soldier.exp >= soldier.level * 100) {
                this.levelUpSoldier(soldier.id);
            }
        });
        
        // Distribuer les récompenses
        InventorySystem.addGold(rewards.gold);
        rewards.items.forEach(item => InventorySystem.addItem(item));
        
        // Supprimer le timer
        delete this.missionTimers[missionId];
        
        // Notification
        UI.Notifications.show('Mission terminée!', 'success');
        UI.ArmyUI.showMissionComplete(rewards);
        
        // Sauvegarder
        this.save();
    }
    
    updateCapacity() {
        // La capacité de base évolue avec le rang
        const baseCapacity = {
            'E': 0,
            'D': 5,
            'C': 10,
            'B': 20,
            'A': 35,
            'S': 50,
            'SS': 75,
            'SSS': 100
        };
        
        const charismaBonus = Math.floor(EvolutionSystem.stats.charisma / 10);
        
        this.maxCapacity = baseCapacity[EvolutionSystem.rank] + charismaBonus;
        
        // Si on dépasse la capacité, désactiver certains soldats
        if (this.soldiers.length > this.maxCapacity) {
            this.soldiers.slice(this.maxCapacity).forEach(soldier => {
                soldier.active = false;
            });
        }
    }
    
    save() {
        const data = {
            soldiers: this.soldiers,
            maxCapacity: this.maxCapacity,
            currentFormation: this.currentFormation,
            missionTimers: this.missionTimers
        };
        
        SaveManager.save('shadowArmy', data);
    }
    
    loadFromSave() {
        const data = SaveManager.load('shadowArmy');
        if (data) {
            this.soldiers = data.soldiers || [];
            this.maxCapacity = data.maxCapacity || 10;
            this.currentFormation = data.currentFormation || 'default';
            this.missionTimers = data.missionTimers || {};
            
            // Vérifier les missions en cours
            this.checkMissionTimers();
        }
    }
    
    checkMissionTimers() {
        const now = Date.now();
        
        Object.entries(this.missionTimers).forEach(([missionId, mission]) => {
            if (mission.endTime <= now) {
                // Mission terminée
                this.completeMission(mission.soldiers, mission.rewards, missionId);
            } else {
                // Redémarrer le timer
                const remainingTime = mission.endTime - now;
                this.startMissionTimer(mission.soldiers, mission.rewards, remainingTime);
            }
        });
    }
    
    getSoldierCount() {
        return this.soldiers.length;
    }
    
    getActiveSoldiers() {
        return this.soldiers.filter(s => s.active !== false);
    }
    
    getSoldierById(id) {
        return this.soldiers.find(s => s.id === id);
    }
    
    dismissSoldier(id) {
        const index = this.soldiers.findIndex(s => s.id === id);
        if (index !== -1) {
            const soldier = this.soldiers[index];
            
            // Récupérer une partie de l'investissement
            const refund = Math.floor(soldier.level * 10);
            InventorySystem.addGold(refund);
            
            this.soldiers.splice(index, 1);
            
            UI.Notifications.show(`Soldat libéré. Remboursement: ${refund} or`, 'info');
            
            this.save();
            return true;
        }
        return false;
    }
}

window.ShadowArmySystem = new ShadowArmySystem();
