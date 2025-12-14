class WorldState {
    constructor() {
        this.discoveredDungeons = [];
        this.clearedDungeons = [];
        this.currentLocation = 'city';
        this.gameTime = 0; // Temps de jeu en secondes
        this.reputation = {
            huntersGuild: 0,
            merchantsGuild: 0,
            shadowOrder: 0
        };
        this.worldEvents = [];
        this.randomEncounters = [];
        
        this.loadFromSave();
        this.startGameTime();
    }
    
    startGameTime() {
        // Incrémenter le temps de jeu
        setInterval(() => {
            this.gameTime++;
            
            // Déclencher des événements basés sur le temps
            this.checkTimedEvents();
        }, 1000);
    }
    
    discoverDungeon(dungeon) {
        if (!this.discoveredDungeons.find(d => d.id === dungeon.id)) {
            this.discoveredDungeons.push({
                ...dungeon,
                discoveredAt: Date.now(),
                cleared: false,
                clearedTimes: 0,
                bestTime: null,
                highestDifficulty: 'normal'
            });
            
            UI.Notifications.show(`Donjon découvert: ${dungeon.name}`, 'info');
            this.save();
        }
    }
    
    clearDungeon(dungeonId, difficulty, clearTime) {
        const dungeon = this.discoveredDungeons.find(d => d.id === dungeonId);
        if (!dungeon) return false;
        
        dungeon.cleared = true;
        dungeon.clearedTimes++;
        
        if (!dungeon.bestTime || clearTime < dungeon.bestTime) {
            dungeon.bestTime = clearTime;
        }
        
        const difficultyOrder = ['normal', 'hard', 'hell', 'real'];
        const currentIndex = difficultyOrder.indexOf(dungeon.highestDifficulty);
        const newIndex = difficultyOrder.indexOf(difficulty);
        
        if (newIndex > currentIndex) {
            dungeon.highestDifficulty = difficulty;
        }
        
        if (!this.clearedDungeons.includes(dungeonId)) {
            this.clearedDungeons.push(dungeonId);
        }
        
        // Récompense de premier clear
        if (dungeon.clearedTimes === 1) {
            this.giveFirstClearRewards(dungeon);
        }
        
        this.save();
        return true;
    }
    
    giveFirstClearRewards(dungeon) {
        const rewards = {
            exp: dungeon.rank === 'S' ? 10000 : dungeon.rank === 'A' ? 5000 : 1000,
            gold: dungeon.rank === 'S' ? 50000 : dungeon.rank === 'A' ? 25000 : 5000,
            items: [{
                type: 'accessory',
                name: `Medaille de ${dungeon.name}`,
                rarity: 'rare',
                bonuses: { perception: 5 }
            }]
        };
        
        EvolutionSystem.gainExp(rewards.exp);
        InventorySystem.addGold(rewards.gold);
        rewards.items.forEach(item => InventorySystem.addItem(item));
        
        UI.Notifications.show(`Premier clear de ${dungeon.name}!`, 'epic');
    }
    
    changeLocation(location) {
        const oldLocation = this.currentLocation;
        this.currentLocation = location;
        
        // Déclencher des événements de changement de location
        this.onLocationChange(oldLocation, location);
        
        this.save();
    }
    
    onLocationChange(oldLocation, newLocation) {
        // Événements spécifiques selon les locations
        if (newLocation === 'city' && oldLocation !== 'city') {
            // Retour en ville
            Player.heal(Player.maxHealth);
            Player.restoreMana(Player.maxMana);
            
            UI.Notifications.show('Santé et mana restaurés', 'heal');
        }
        
        // Rencontres aléatoires
        if (newLocation === 'wilderness' && Math.random() < 0.3) {
            this.triggerRandomEncounter();
        }
    }
    
    triggerRandomEncounter() {
        const encounters = [
            {
                type: 'treasure',
                description: 'Vous trouvez un coffre au trésor!',
                action: () => this.openTreasureChest()
            },
            {
                type: 'ambush',
                description: 'Des monstres vous attaquent!',
                action: () => this.startAmbush()
            },
            {
                type: 'merchant',
                description: 'Un marchand itinérant vous propose ses marchandises',
                action: () => this.showTravelingMerchant()
            },
            {
                type: 'event',
                description: 'Un événement mystérieux se produit...',
                action: () => this.triggerMysteryEvent()
            }
        ];
        
        const encounter = encounters[Math.floor(Math.random() * encounters.length)];
        this.randomEncounters.push({
            ...encounter,
            triggeredAt: Date.now(),
            location: this.currentLocation
        });
        
        // Afficher l'encounter
        UI.WorldUI.showEncounter(encounter);
    }
    
    openTreasureChest() {
        const gold = 100 + Math.floor(Math.random() * 400);
        InventorySystem.addGold(gold);
        
        const items = [];
        if (Math.random() < 0.5) {
            items.push(InventorySystem.generateRandomItem('C', 'normal'));
        }
        
        UI.Notifications.show(`Coffre ouvert: ${gold} or trouvé`, 'gold');
        items.forEach(item => InventorySystem.addItem(item));
    }
    
    startAmbush() {
        // Générer des ennemis aléatoires
        const enemyCount = 2 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < enemyCount; i++) {
            // Créer un ennemi
            CombatSystem.spawnRandomEnemy();
        }
        
        UI.Notifications.show(`Embuscade! ${enemyCount} ennemis apparaissent`, 'warning');
    }
    
    showTravelingMerchant() {
        // Afficher une boutique temporaire
        const items = [];
        for (let i = 0; i < 5; i++) {
            items.push(InventorySystem.generateRandomItem('B', 'normal'));
        }
        
        UI.MerchantUI.showTravelingMerchant(items);
    }
    
    triggerMysteryEvent() {
        const events = [
            {
                name: 'Portail instable',
                effect: 'Un portail dimensionnel instable apparaît',
                action: () => {
                    // Donjon éphémère
                    const dungeon = DungeonGenerator.generateRandomDungeon();
                    dungeon.expiresIn = 300; // 5 minutes
                    this.discoveredDungeons.push(dungeon);
                    
                    UI.Notifications.show('Un donjon éphémère est apparu!', 'epic');
                }
            },
            {
                name: 'Bénédiction ancienne',
                effect: 'Une puissance ancienne vous bénit',
                action: () => {
                    // Buff temporaire
                    Player.addBuffs({
                        damage: 1.5,
                        defense: 1.5
                    }, 600); // 10 minutes
                    
                    UI.Notifications.show('Vous recevez une bénédiction ancienne', 'buff');
                }
            },
            {
                name: 'Malédiction',
                effect: 'Une malédiction vous affecte',
                action: () => {
                    // Debuff temporaire
                    Player.addDebuffs({
                        damage: 0.7,
                        speed: 0.8
                    }, 300); // 5 minutes
                    
                    UI.Notifications.show('Vous êtes maudit!', 'debuff');
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event.action();
    }
    
    checkTimedEvents() {
        // Vérifier les événements programmés
        this.worldEvents.forEach((event, index) => {
            if (event.triggerTime <= Date.now() && !event.triggered) {
                this.triggerWorldEvent(event);
                event.triggered = true;
            }
        });
        
        // Nettoyer les événements déclenchés
        this.worldEvents = this.worldEvents.filter(e => !e.triggered || e.persistent);
    }
    
    triggerWorldEvent(event) {
        switch (event.type) {
            case 'invasion':
                this.startCityInvasion(event);
                break;
            case 'festival':
                this.startFestival(event);
                break;
            case 'double_exp':
                this.startDoubleExp(event);
                break;
            case 'boss_spawn':
                this.spawnWorldBoss(event);
                break;
        }
    }
    
    startCityInvasion(event) {
        // Invasion de monstres dans la ville
        UI.Notifications.show('INVASION! Des monstres attaquent la ville!', 'emergency');
        
        // Spawn des ennemis spéciaux
        for (let i = 0; i < 10; i++) {
            CombatSystem.spawnInvasionEnemy();
        }
        
        // Quête d'invasion
        QuestSystem.addQuest({
            title: 'Défense de la ville',
            description: 'Protégez la ville des envahisseurs',
            objectives: [
                { type: 'kill', target: 'invader', required: 20 }
            ],
            rewards: {
                exp: 5000,
                gold: 20000,
                reputation: { huntersGuild: 100 }
            },
            timeLimit: 600 // 10 minutes
        });
    }
    
    startFestival(event) {
        // Festival dans la ville
        UI.Notifications.show('Festival en cours! Récompenses bonus disponibles', 'festival');
        
        // Bonus temporaire
        Player.addBuffs({
            expGain: 1.5,
            goldGain: 1.5
        }, event.duration || 3600);
    }
    
    startDoubleExp(event) {
        // Double EXP
        UI.Notifications.show('Double EXP actif!', 'buff');
        
        EvolutionSystem.expMultiplier = 2;
        
        setTimeout(() => {
            EvolutionSystem.expMultiplier = 1;
            UI.Notifications.show('Double EXP terminé', 'info');
        }, event.duration || 3600);
    }
    
    spawnWorldBoss(event) {
        // Boss mondial
        UI.Notifications.show('Un boss mondial est apparu!', 'boss');
        
        // Créer le boss
        const boss = CombatSystem.spawnWorldBoss(event.bossType);
        
        // Quête de boss
        QuestSystem.addQuest({
            title: `Défaite de ${boss.name}`,
            description: 'Vaincre le boss mondial',
            objectives: [
                { type: 'kill', target: boss.id, required: 1 }
            ],
            rewards: {
                exp: 10000,
                gold: 50000,
                items: [{ type: 'legendary', name: `${boss.name} Trophy` }]
            },
            timeLimit: 1800 // 30 minutes
        });
    }
    
    updateReputation(faction, amount) {
        this.reputation[faction] = (this.reputation[faction] || 0) + amount;
        
        // Vérifier les niveaux de réputation
        this.checkReputationLevels(faction);
        
        this.save();
    }
    
    checkReputationLevels(faction) {
        const levels = [
            { threshold: -1000, name: 'Détesté' },
            { threshold: -500, name: 'Méfiant' },
            { threshold: 0, name: 'Neutre' },
            { threshold: 500, name: 'Accepté' },
            { threshold: 1000, name: 'Respecté' },
            { threshold: 2000, name: 'Héroïque' },
            { threshold: 5000, name: 'Légendaire' }
        ];
        
        const currentRep = this.reputation[faction];
        let currentLevel = levels[0];
        
        for (const level of levels) {
            if (currentRep >= level.threshold) {
                currentLevel = level;
            } else {
                break;
            }
        }
        
        // Débloquer des avantages selon le niveau
        this.unlockReputationBenefits(faction, currentLevel.name);
    }
    
    unlockReputationBenefits(faction, level) {
        // Avantages selon la faction et le niveau
        const benefits = {
            huntersGuild: {
                'Accepté': 'Accès aux quêtes de rang B',
                'Respecté': 'Accès aux quêtes de rang A',
                'Héroïque': 'Accès aux quêtes de rang S',
                'Légendaire': 'Titre de Maître Chasseur'
            },
            merchantsGuild: {
                'Accepté': 'Réduction de 10%',
                'Respecté': 'Réduction de 20%',
                'Héroïque': 'Accès aux objets exclusifs',
                'Légendaire': 'Tous les objets à moitié prix'
            },
            shadowOrder: {
                'Accepté': 'Nouvelles compétences d\'ombre',
                'Respecté': 'Capacité d\'ombre améliorée',
                'Héroïque': 'Transformation d\'ombre',
                'Légendaire': 'Pouvoir de Monarque de l\'Ombre'
            }
        };
        
        const factionBenefits = benefits[faction];
        if (factionBenefits && factionBenefits[level]) {
            UI.Notifications.show(`${faction}: ${level} - ${factionBenefits[level]}`, 'reputation');
        }
    }
    
    save() {
        const data = {
            discoveredDungeons: this.discoveredDungeons,
            clearedDungeons: this.clearedDungeons,
            currentLocation: this.currentLocation,
            gameTime: this.gameTime,
            reputation: this.reputation,
            worldEvents: this.worldEvents,
            randomEncounters: this.randomEncounters
        };
        
        SaveManager.save('world', data);
    }
    
    loadFromSave() {
        const data = SaveManager.load('world');
        if (data) {
            this.discoveredDungeons = data.discoveredDungeons || [];
            this.clearedDungeons = data.clearedDungeons || [];
            this.currentLocation = data.currentLocation || 'city';
            this.gameTime = data.gameTime || 0;
            this.reputation = data.reputation || this.reputation;
            this.worldEvents = data.worldEvents || [];
            this.randomEncounters = data.randomEncounters || [];
        }
    }
    
    // Méthodes utilitaires
    static formatGameTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    static getLocationName(locationId) {
        const locations = {
            'city': 'Ville d\'Astarte',
            'wilderness': 'Terres Sauvages',
            'dungeon_entrance': 'Entrée du Donjon',
            'hunters_guild': 'Guilde des Chasseurs',
            'market': 'Marché Central',
            'training_grounds': 'Terrain d\'Entraînement'
        };
        
        return locations[locationId] || locationId;
    }
}

window.WorldState = new WorldState();
