class ShadowArmySystem {
    constructor() {
        this.soldiers = new Map();
        this.maxSoldiers = 10;
        this.generals = [];
        this.formations = {
            default: 'line',
            available: ['line', 'circle', 'wedge', 'square']
        };
        
        this.load();
    }
    
    extractSoldier(enemy) {
        if (this.soldiers.size >= this.maxSoldiers) {
            UI.Notifications.show('Limite de soldats atteinte!', 'warning');
            return null;
        }
        
        // Chance d'extraction basée sur le rang et la compétence
        const baseChance = 0.3;
        const rankBonus = EvolutionSystem.getRankMultiplier() * 0.1;
        const success = Math.random() < (baseChance + rankBonus);
        
        if (success) {
            const soldier = this.createSoldierFromEnemy(enemy);
            const soldierId = `soldier_${Date.now()}`;
            
            this.soldiers.set(soldierId, soldier);
            
            // Notification
            UI.Notifications.show(`Soldat extrait: ${soldier.name}`, 'soldier');
            
            this.save();
            return soldier;
        } else {
            UI.Notifications.show('Extraction échouée', 'warning');
            return null;
        }
    }
    
    createSoldierFromEnemy(enemy) {
        // Créer un soldat basé sur l'ennemi
        const soldierTypes = {
            'slime': { name: 'Slime d\'Ombre', type: 'infantry', rank: 'E' },
            'goblin': { name: 'Gobelin d\'Ombre', type: 'infantry', rank: 'D' },
            'wolf': { name: 'Loup d\'Ombre', type: 'cavalry', rank: 'C' },
            'mage': { name: 'Mage d\'Ombre', type: 'mage', rank: 'B' },
            'knight': { name: 'Chevalier d\'Ombre', type: 'elite', rank: 'A' }
        };
        
        const enemyType = enemy.type || 'slime';
        const template = soldierTypes[enemyType] || soldierTypes.slime;
        
        return {
            id: `soldier_${Date.now()}`,
            name: template.name,
            type: template.type,
            rank: template.rank,
            level: 1,
            exp: 0,
            stats: this.generateSoldierStats(template.rank),
            skills: [],
            equipment: null,
            loyalty: 100,
            createdAt: Date.now()
        };
    }
    
    generateSoldierStats(rank) {
        const baseStats = {
            health: 50,
            attack: 10,
            defense: 5,
            speed: 5
        };
        
        const rankMultipliers = {
            'E': 1.0,
            'D': 1.5,
            'C': 2.0,
            'B': 3.0,
            'A': 4.0,
            'S': 6.0
        };
        
        const multiplier = rankMultipliers[rank] || 1.0;
        
        return {
            health: Math.floor(baseStats.health * multiplier),
            attack: Math.floor(baseStats.attack * multiplier),
            defense: Math.floor(baseStats.defense * multiplier),
            speed: Math.floor(baseStats.speed * multiplier)
        };
    }
    
    levelUpSoldier(soldierId) {
        const soldier = this.soldiers.get(soldierId);
        if (!soldier) return;
        
        soldier.level++;
        soldier.exp = 0;
        
        // Augmenter les stats
        soldier.stats.health += 10;
        soldier.stats.attack += 2;
        soldier.stats.defense += 1;
        
        // Évolution possible
        this.checkSoldierEvolution(soldier);
        
        // Notification
        UI.Notifications.show(`${soldier.name} niveau ${soldier.level}!`, 'soldier');
        
        this.save();
    }
    
    checkSoldierEvolution(soldier) {
        const evolutionTable = {
            'infantry': { level: 10, evolveTo: 'elite' },
            'mage': { level: 10, evolveTo: 'archmage' },
            'cavalry': { level: 10, evolveTo: 'heavy_cavalry' }
        };
        
        const evolution = evolutionTable[soldier.type];
        if (evolution && soldier.level >= evolution.level) {
            this.evolveSoldier(soldier, evolution.evolveTo);
        }
    }
    
    evolveSoldier(soldier, newType) {
        const oldName = soldier.name;
        soldier.type = newType;
        
        // Changer le nom selon le type
        const typeNames = {
            'elite': 'Élite d\'Ombre',
            'archmage': 'Archimage d\'Ombre',
            'heavy_cavalry': 'Cavalerie Lourde d\'Ombre'
        };
        
        soldier.name = typeNames[newType] || soldier.name;
        
        // Augmenter les stats
        soldier.stats.health *= 1.5;
        soldier.stats.attack *= 1.5;
        soldier.stats.defense *= 1.5;
        
        // Notification
        UI.Notifications.show(`${oldName} a évolué en ${soldier.name}!`, 'evolution');
    }
    
    deploySoldiers(soldierIds, position) {
        const deployed = [];
        
        soldierIds.forEach(id => {
            const soldier = this.soldiers.get(id);
            if (soldier && soldier.loyalty > 0) {
                deployed.push(soldier);
                
                // Réduire la loyauté
                soldier.loyalty -= 5;
                
                // Si la loyauté atteint 0, le soldat se rebelle
                if (soldier.loyalty <= 0) {
                    this.soldierRebellion(soldier);
                }
            }
        });
        
        // Créer les soldats dans Three.js
        this.createSoldiersInScene(deployed, position);
        
        return deployed;
    }
    
    createSoldiersInScene(soldiers, position) {
        if (!window.game) return;
        
        soldiers.forEach(soldier => {
            // Créer un modèle simple pour le soldat
            const geometry = new THREE.ConeGeometry(0.5, 1, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x6d28d9,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(position);
            mesh.position.x += (Math.random() - 0.5) * 2;
            mesh.position.z += (Math.random() - 0.5) * 2;
            
            // Ajouter à la scène
            window.game.scene.add(mesh);
            
            // Stocker la référence
            soldier.mesh = mesh;
        });
    }
    
    soldierRebellion(soldier) {
        // Le soldat devient hostile
        UI.Notifications.show(`${soldier.name} s'est rebellé!`, 'warning');
        
        // Retirer du contrôle
        this.soldiers.delete(soldier.id);
        
        // Ajouter comme ennemi dans la scène
        this.convertToEnemy(soldier);
    }
    
    convertToEnemy(soldier) {
        // Convertir en ennemi (à implémenter selon le système d'ennemis)
        console.log(`Soldat rebelle: ${soldier.name}`);
    }
    
    increaseCapacity(amount) {
        this.maxSoldiers += amount;
        UI.Notifications.show(`Capacité d'armée augmentée: ${this.maxSoldiers}`, 'info');
        this.save();
    }
    
    update(deltaTime) {
        // Mettre à jour la loyauté (régénération)
        this.soldiers.forEach(soldier => {
            if (soldier.loyalty < 100) {
                soldier.loyalty += deltaTime * 0.1; // 0.1 par seconde
                soldier.loyalty = Math.min(soldier.loyalty, 100);
            }
        });
    }
    
    save() {
        const data = {
            soldiers: Array.from(this.soldiers.entries()),
            maxSoldiers: this.maxSoldiers,
            generals: this.generals,
            formations: this.formations
        };
        
        SaveManager.save('shadowArmy', data);
    }
    
    load() {
        const data = SaveManager.load('shadowArmy');
        if (data) {
            this.soldiers = new Map(data.soldiers);
            this.maxSoldiers = data.maxSoldiers;
            this.generals = data.generals;
            this.formations = data.formations;
        }
    }
    
    // Interface avec l'UI
    static updateUI() {
        if (window.UI && UI.ArmyUI) {
            UI.ArmyUI.update();
        }
    }
}
