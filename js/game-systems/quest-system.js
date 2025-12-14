class QuestSystem {
    constructor() {
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.failedQuests = new Set();
        
        this.questDatabase = QuestDatabase;
        
        this.load();
    }
    
    startQuest(questId) {
        if (this.activeQuests.has(questId) || 
            this.completedQuests.has(questId) || 
            this.failedQuests.has(questId)) {
            return false;
        }
        
        const questTemplate = this.questDatabase[questId];
        if (!questTemplate) return false;
        
        const quest = {
            ...questTemplate,
            progress: {},
            startedAt: Date.now(),
            objectives: questTemplate.objectives.map(obj => ({...obj, current: 0}))
        };
        
        this.activeQuests.set(questId, quest);
        
        // Notification
        UI.Notifications.show(`Quête commencée: ${quest.name}`, 'quest');
        
        this.save();
        return true;
    }
    
    updateQuestProgress(questId, objectiveIndex, amount = 1) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return;
        
        const objective = quest.objectives[objectiveIndex];
        if (!objective) return;
        
        objective.current += amount;
        objective.current = Math.min(objective.current, objective.required);
        
        // Vérifier si l'objectif est terminé
        if (objective.current >= objective.required) {
            objective.completed = true;
            this.checkQuestCompletion(questId);
        }
        
        this.save();
        QuestUI.updateQuest(questId);
    }
    
    checkQuestCompletion(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return;
        
        const allCompleted = quest.objectives.every(obj => obj.completed);
        
        if (allCompleted) {
            this.completeQuest(questId);
        }
    }
    
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return;
        
        // Donner les récompenses
        this.giveQuestRewards(quest);
        
        // Marquer comme complétée
        this.activeQuests.delete(questId);
        this.completedQuests.add(questId);
        
        // Notification
        UI.Notifications.show(`Quête terminée: ${quest.name}`, 'quest');
        
        // Débloquer de nouvelles quêtes si nécessaire
        this.unlockNextQuests(questId);
        
        this.save();
    }
    
    giveQuestRewards(quest) {
        if (quest.rewards) {
            // Expérience
            if (quest.rewards.exp) {
                EvolutionSystem.gainExp(quest.rewards.exp);
            }
            
            // Or
            if (quest.rewards.gold) {
                InventorySystem.gold += quest.rewards.gold;
            }
            
            // Items
            if (quest.rewards.items) {
                quest.rewards.items.forEach(item => {
                    InventorySystem.addItem(item.id, item.quantity);
                });
            }
            
            // Compétences
            if (quest.rewards.skills) {
                quest.rewards.skills.forEach(skillId => {
                    EvolutionSystem.skills.active.push(skillId);
                });
            }
        }
    }
    
    unlockNextQuests(questId) {
        const quest = this.questDatabase[questId];
        if (quest.unlocks) {
            quest.unlocks.forEach(nextQuestId => {
                if (!this.isQuestAvailable(nextQuestId)) {
                    // La quête devient disponible
                    this.questDatabase[nextQuestId].available = true;
                }
            });
        }
    }
    
    isQuestAvailable(questId) {
        const quest = this.questDatabase[questId];
        if (!quest) return false;
        
        // Vérifier les prérequis
        if (quest.requirements) {
            if (quest.requirements.level && 
                EvolutionSystem.level < quest.requirements.level) {
                return false;
            }
            
            if (quest.requirements.quests) {
                const requiredQuests = quest.requirements.quests;
                const hasAllQuests = requiredQuests.every(qId => 
                    this.completedQuests.has(qId)
                );
                if (!hasAllQuests) return false;
            }
        }
        
        return quest.available !== false;
    }
    
    failQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return;
        
        // Échec (par exemple, temps écoulé)
        this.activeQuests.delete(questId);
        this.failedQuests.add(questId);
        
        // Notification
        UI.Notifications.show(`Quête échouée: ${quest.name}`, 'quest');
        
        this.save();
    }
    
    initializeStartingQuests() {
        // Commencer les quêtes de départ
        Object.keys(this.questDatabase).forEach(questId => {
            const quest = this.questDatabase[questId];
            if (quest.startingQuest) {
                this.startQuest(questId);
            }
        });
    }
    
    update(deltaTime) {
        // Vérifier les quêtes avec limite de temps
        this.activeQuests.forEach((quest, questId) => {
            if (quest.timeLimit) {
                const elapsed = Date.now() - quest.startedAt;
                if (elapsed > quest.timeLimit) {
                    this.failQuest(questId);
                }
            }
        });
    }
    
    save() {
        const data = {
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: Array.from(this.completedQuests),
            failedQuests: Array.from(this.failedQuests)
        };
        
        SaveManager.save('quests', data);
    }
    
    load() {
        const data = SaveManager.load('quests');
        if (data) {
            this.activeQuests = new Map(data.activeQuests);
            this.completedQuests = new Set(data.completedQuests);
            this.failedQuests = new Set(data.failedQuests);
        }
    }
}

// Base de données de quêtes (exemple)
const QuestDatabase = {
    'tutorial_1': {
        name: 'Premiers Pas',
        description: 'Tuez 5 slimes dans le donjon débutant.',
        type: 'hunt',
        objectives: [
            { type: 'kill', target: 'slime', required: 5, description: 'Tuez 5 slimes' }
        ],
        rewards: {
            exp: 100,
            gold: 50,
            items: [{ id: 'potion_health', quantity: 3 }]
        },
        startingQuest: true,
        unlocks: ['tutorial_2']
    },
    'tutorial_2': {
        name: 'Extraction d\'Ombre',
        description: 'Extrayez un soldat d\'ombre d\'un ennemi vaincu.',
        type: 'special',
        requirements: {
            level: 5,
            quests: ['tutorial_1']
        },
        objectives: [
            { type: 'extract', target: 'any', required: 1, description: 'Extrayez 1 soldat d\'ombre' }
        ],
        rewards: {
            exp: 200,
            gold: 100,
            skills: ['shadow_extract']
        },
        available: false
    },
    'dungeon_clear_1': {
        name: 'Nettoyage de Donjon',
        description: 'Terminez le donjon de la Forêt Sombre.',
        type: 'dungeon',
        requirements: {
            level: 10
        },
        objectives: [
            { type: 'complete_dungeon', target: 'dark_forest', required: 1, description: 'Terminez le donjon Forêt Sombre' }
        ],
        rewards: {
            exp: 500,
            gold: 300,
            items: [{ id: 'sword_steel', quantity: 1 }]
        },
        available: false
    }
};
