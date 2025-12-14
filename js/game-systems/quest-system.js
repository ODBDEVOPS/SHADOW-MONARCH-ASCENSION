class QuestSystem {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
        this.failedQuests = [];
        this.dailyQuests = [];
        this.achievements = [];
        
        this.dailyResetTime = this.getNextResetTime();
        this.checkDailyReset();
        
        this.loadFromSave();
    }
    
    addQuest(quest) {
        quest.id = quest.id || Date.now() + Math.random();
        quest.startedAt = Date.now();
        quest.objectives = quest.objectives.map(obj => ({
            ...obj,
            current: 0,
            completed: false
        }));
        
        this.activeQuests.push(quest);
        
        // Notification
        UI.Notifications.show(`Nouvelle quête: ${quest.title}`, 'quest');
        
        // Sauvegarder
        this.save();
        
        return quest.id;
    }
    
    updateQuestObjective(questId, objectiveIndex, amount = 1) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (!quest) return false;
        
        const objective = quest.objectives[objectiveIndex];
        if (!objective || objective.completed) return false;
        
        objective.current += amount;
        
        if (objective.current >= objective.required) {
            objective.completed = true;
            objective.current = objective.required;
            
            // Vérifier si la quête est terminée
            if (quest.objectives.every(obj => obj.completed)) {
                this.completeQuest(questId);
            }
        }
        
        // Mettre à jour l'UI
        UI.QuestUI.updateQuest(quest);
        
        // Sauvegarder
        this.save();
        
        return true;
    }
    
    completeQuest(questId) {
        const index = this.activeQuests.findIndex(q => q.id === questId);
        if (index === -1) return false;
        
        const quest = this.activeQuests[index];
        quest.completedAt = Date.now();
        
        // Retirer des quêtes actives
        this.activeQuests.splice(index, 1);
        
        // Ajouter aux quêtes complétées
        this.completedQuests.push(quest);
        
        // Distribuer les récompenses
        this.giveQuestRewards(quest);
        
        // Notification
        UI.Notifications.show(`Quête complétée: ${quest.title}`, 'success');
        
        // Sauvegarder
        this.save();
        
        return true;
    }
    
    giveQuestRewards(quest) {
        if (quest.rewards) {
            if (quest.rewards.exp) {
                EvolutionSystem.gainExp(quest.rewards.exp);
            }
            
            if (quest.rewards.gold) {
                InventorySystem.addGold(quest.rewards.gold);
            }
            
            if (quest.rewards.items) {
                quest.rewards.items.forEach(item => {
                    InventorySystem.addItem(item);
                });
            }
            
            if (quest.rewards.skillPoints) {
                EvolutionSystem.stats.availablePoints += quest.rewards.skillPoints;
            }
        }
    }
    
    failQuest(questId) {
        const index = this.activeQuests.findIndex(q => q.id === questId);
        if (index === -1) return false;
        
        const quest = this.activeQuests[index];
        quest.failedAt = Date.now();
        
        this.activeQuests.splice(index, 1);
        this.failedQuests.push(quest);
        
        // Notification
        UI.Notifications.show(`Quête échouée: ${quest.title}`, 'error');
        
        this.save();
        return true;
    }
    
    generateDailyQuests() {
        this.dailyQuests = [];
        
        // Générer 3 quêtes quotidiennes
        const dailyCount = 3;
        const questTypes = ['hunt', 'collect', 'complete_dungeon', 'upgrade', 'extract'];
        
        for (let i = 0; i < dailyCount; i++) {
            const type = questTypes[Math.floor(Math.random() * questTypes.length)];
            const quest = this.createDailyQuest(type);
            this.dailyQuests.push(quest);
        }
        
        this.save();
    }
    
    createDailyQuest(type) {
        const templates = {
            hunt: {
                title: 'Chasse quotidienne',
                description: 'Vaincre des monstres',
                objectives: [{
                    type: 'kill',
                    target: 'any',
                    required: 10 + Math.floor(Math.random() * 20)
                }],
                rewards: {
                    exp: 100,
                    gold: 500
                }
            },
            collect: {
                title: 'Collecte de ressources',
                description: 'Collecter des ressources',
                objectives: [{
                    type: 'collect',
                    target: 'any',
                    required: 5 + Math.floor(Math.random() * 10)
                }],
                rewards: {
                    exp: 150,
                    gold: 300,
                    items: [{ type: 'consumable', name: 'Potion de soin', quantity: 3 }]
                }
            },
            complete_dungeon: {
                title: 'Explorateur',
                description: 'Terminer un donjon',
                objectives: [{
                    type: 'complete_dungeon',
                    target: 'any',
                    required: 1
                }],
                rewards: {
                    exp: 300,
                    gold: 1000
                }
            },
            upgrade: {
                title: 'Amélioration',
                description: 'Améliorer une compétence ou un équipement',
                objectives: [{
                    type: 'upgrade',
                    target: 'any',
                    required: 1
                }],
                rewards: {
                    exp: 200,
                    gold: 800
                }
            },
            extract: {
                title: 'Chasseur d\'ombres',
                description: 'Extraire des soldats d\'ombre',
                objectives: [{
                    type: 'extract',
                    target: 'any',
                    required: 3
                }],
                rewards: {
                    exp: 250,
                    gold: 600,
                    skillPoints: 1
                }
            }
        };
        
        const template = templates[type] || templates.hunt;
        
        return {
            ...template,
            id: Date.now() + Math.random(),
            type: 'daily',
            expiresAt: this.dailyResetTime
        };
    }
    
    getNextResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return tomorrow.getTime();
    }
    
    checkDailyReset() {
        const now = Date.now();
        
        if (now >= this.dailyResetTime) {
            // Réinitialiser les quêtes quotidiennes
            this.generateDailyQuests();
            this.dailyResetTime = this.getNextResetTime();
            
            // Notification
            UI.Notifications.show('Nouvelles quêtes quotidiennes disponibles!', 'info');
        }
        
        // Vérifier à nouveau dans 1 minute
        setTimeout(() => this.checkDailyReset(), 60000);
    }
    
    checkAchievements() {
        const achievementChecks = {
            'first_kill': () => Player.totalKills >= 1,
            'dungeon_master': () => Player.completedDungeons >= 10,
            'shadow_collector': () => ShadowArmySystem.getSoldierCount() >= 20,
            'wealthy': () => InventorySystem.getGold() >= 100000,
            'max_level': () => EvolutionSystem.level >= 100,
            'rank_sss': () => EvolutionSystem.rank === 'SSS'
        };
        
        Object.entries(achievementChecks).forEach(([id, check]) => {
            if (!this.achievements.includes(id) && check()) {
                this.unlockAchievement(id);
            }
        });
    }
    
    unlockAchievement(achievementId) {
        this.achievements.push(achievementId);
        
        const rewards = this.getAchievementReward(achievementId);
        
        // Notification spéciale
        UI.Notifications.show(`Haut-fait débloqué: ${achievementId}`, 'achievement');
        
        // Donner les récompenses
        if (rewards) {
            this.giveQuestRewards({ rewards: rewards });
        }
        
        this.save();
    }
    
    getAchievementReward(achievementId) {
        const rewards = {
            'first_kill': { exp: 100, gold: 500 },
            'dungeon_master': { exp: 1000, gold: 5000, skillPoints: 5 },
            'shadow_collector': { exp: 500, gold: 2000 },
            'wealthy': { exp: 1000, gold: 10000 },
            'max_level': { exp: 0, gold: 100000, skillPoints: 20 },
            'rank_sss': { exp: 0, gold: 500000, skillPoints: 50 }
        };
        
        return rewards[achievementId];
    }
    
    save() {
        const data = {
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            failedQuests: this.failedQuests,
            dailyQuests: this.dailyQuests,
            achievements: this.achievements,
            dailyResetTime: this.dailyResetTime
        };
        
        SaveManager.save('quests', data);
    }
    
    loadFromSave() {
        const data = SaveManager.load('quests');
        if (data) {
            this.activeQuests = data.activeQuests || [];
            this.completedQuests = data.completedQuests || [];
            this.failedQuests = data.failedQuests || [];
            this.dailyQuests = data.dailyQuests || [];
            this.achievements = data.achievements || [];
            this.dailyResetTime = data.dailyResetTime || this.getNextResetTime();
            
            // Générer les quêtes quotidiennes si vide
            if (this.dailyQuests.length === 0) {
                this.generateDailyQuests();
            }
        }
    }
}

window.QuestSystem = new QuestSystem();
