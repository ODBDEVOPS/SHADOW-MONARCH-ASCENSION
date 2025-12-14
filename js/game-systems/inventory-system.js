class InventorySystem {
    constructor() {
        this.items = [];
        this.equipped = {
            weapon: null,
            armor: null,a
            helmet: null,
            boots: null,
            accessory1: null,
            accessory2: null
        };
        this.gold = 0;
        this.capacity = 50; // Augmente avec les sacs/compétences
        
        this.loadFromSave();
    }
    
    addItem(item) {
        if (this.items.length >= this.capacity) {
            UI.Notifications.show('Inventaire plein!', 'warning');
            return false;
        }
        
        // Si l'item est empilable, chercher une pile existante
        if (item.stackable) {
            const existing = this.items.find(i => 
                i.id === item.id && i.quantity < i.maxStack
            );
            
            if (existing) {
                existing.quantity += item.quantity || 1;
                this.save();
                return true;
            }
        }
        
        // Sinon, ajouter un nouvel item
        item.id = item.id || Date.now() + Math.random();
        item.quantity = item.quantity || 1;
        
        this.items.push(item);
        
        // Notification
        if (item.rarity === 'epic' || item.rarity === 'legendary') {
            UI.Notifications.show(`Item rare obtenu: ${item.name}`, 'epic');
        }
        
        this.save();
        return true;
    }
    
    removeItem(itemId, quantity = 1) {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index === -1) return false;
        
        const item = this.items[index];
        
        if (item.stackable && item.quantity > quantity) {
            item.quantity -= quantity;
        } else {
            this.items.splice(index, 1);
        }
        
        this.save();
        return true;
    }
    
    equipItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item || !item.equippable) return false;
        
        const slot = item.slot;
        const current = this.equipped[slot];
        
        // Déséquiper l'item actuel
        if (current) {
            this.unequipItem(slot);
        }
        
        // Équiper le nouvel item
        this.equipped[slot] = item;
        
        // Retirer de l'inventaire
        this.removeItem(itemId);
        
        // Appliquer les bonus
        this.applyItemBonuses(item);
        
        // Mettre à jour l'UI
        UI.InventoryUI.updateEquipped();
        
        // Notification
        UI.Notifications.show(`${item.name} équipé`, 'success');
        
        this.save();
        return true;
    }
    
    unequipItem(slot) {
        const item = this.equipped[slot];
        if (!item) return false;
        
        // Retirer les bonus
        this.removeItemBonuses(item);
        
        // Remettre dans l'inventaire
        this.addItem(item);
        
        // Vider le slot
        this.equipped[slot] = null;
        
        // Mettre à jour l'UI
        UI.InventoryUI.updateEquipped();
        
        this.save();
        return true;
    }
    
    applyItemBonuses(item) {
        if (!item.bonuses) return;
        
        Object.entries(item.bonuses).forEach(([stat, value]) => {
            if (EvolutionSystem.stats[stat]) {
                EvolutionSystem.stats[stat] += value;
            } else if (stat === 'health') {
                Player.maxHealth += value;
            } else if (stat === 'mana') {
                Player.maxMana += value;
            }
        });
    }
    
    removeItemBonuses(item) {
        if (!item.bonuses) return;
        
        Object.entries(item.bonuses).forEach(([stat, value]) => {
            if (EvolutionSystem.stats[stat]) {
                EvolutionSystem.stats[stat] -= value;
            } else if (stat === 'health') {
                Player.maxHealth -= value;
            } else if (stat === 'mana') {
                Player.maxMana -= value;
            }
        });
    }
    
    useItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item || !item.usable) return false;
        
        // Appliquer l'effet
        switch (item.type) {
            case 'potion':
                this.usePotion(item);
                break;
            case 'scroll':
                this.useScroll(item);
                break;
            case 'consumable':
                this.useConsumable(item);
                break;
        }
        
        // Dépenser l'item
        this.removeItem(itemId);
        
        return true;
    }
    
    usePotion(potion) {
        if (potion.effect === 'heal') {
            const amount = potion.value || 50;
            Player.heal(amount);
            UI.Notifications.show(`Soin de ${amount} PV`, 'heal');
        } else if (potion.effect === 'mana') {
            const amount = potion.value || 30;
            Player.restoreMana(amount);
            UI.Notifications.show(`Restauration de ${amount} PM`, 'mana');
        }
    }
    
    useScroll(scroll) {
        if (scroll.effect === 'teleport') {
            // Téléportation vers un donjon connu
            WorldState.teleportTo(scroll.target);
        } else if (scroll.effect === 'summon') {
            // Invocation d'un soldat temporaire
            ShadowArmySystem.summonTemporarySoldier(scroll.duration);
        }
    }
    
    useConsumable(consumable) {
        // Appliquer des buffs temporaires
        if (consumable.buffs) {
            Player.addBuffs(consumable.buffs, consumable.duration || 300);
        }
    }
    
    addGold(amount) {
        this.gold += amount;
        UI.Notifications.show(`+${amount} or`, 'gold');
        this.save();
    }
    
    removeGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }
    
    getGold() {
        return this.gold;
    }
    
    save() {
        const data = {
            items: this.items,
            equipped: this.equipped,
            gold: this.gold,
            capacity: this.capacity
        };
        
        SaveManager.save('inventory', data);
    }
    
    loadFromSave() {
        const data = SaveManager.load('inventory');
        if (data) {
            this.items = data.items || [];
            this.equipped = data.equipped || this.equipped;
            this.gold = data.gold || 0;
            this.capacity = data.capacity || 50;
            
            // Réappliquer les bonus des équipements
            Object.values(this.equipped).forEach(item => {
                if (item) this.applyItemBonuses(item);
            });
        }
    }
    
    // Génération d'items pour les récompenses de donjon
    generateDungeonReward(dungeonRank, difficulty) {
        const rewards = [];
        
        // Or
        const goldAmount = this.calculateGoldReward(dungeonRank, difficulty);
        rewards.push({ type: 'gold', amount: goldAmount });
        
        // Items
        const itemCount = 1 + Math.floor(difficulty / 2);
        for (let i = 0; i < itemCount; i++) {
            const item = this.generateRandomItem(dungeonRank, difficulty);
            if (item) rewards.push(item);
        }
        
        return rewards;
    }
    
    calculateGoldReward(rank, difficulty) {
        const baseGold = {
            'E': 100,
            'D': 250,
            'C': 500,
            'B': 1000,
            'A': 2500,
            'S': 5000,
            'SS': 10000,
            'SSS': 25000
        };
        
        const multiplier = {
            'normal': 1,
            'hard': 1.5,
            'hell': 3,
            'real': 10
        };
        
        return Math.floor((baseGold[rank] || 100) * (multiplier[difficulty] || 1));
    }
    
    generateRandomItem(rank, difficulty) {
        const rarityChances = this.getRarityChances(rank, difficulty);
        const itemTypes = ['weapon', 'armor', 'consumable', 'material'];
        const slots = ['weapon', 'armor', 'helmet', 'boots', 'accessory'];
        
        // Choisir une rareté
        const rand = Math.random();
        let cumulative = 0;
        let chosenRarity = 'common';
        
        for (const [rarity, chance] of Object.entries(rarityChances)) {
            cumulative += chance;
            if (rand <= cumulative) {
                chosenRarity = rarity;
                break;
            }
        }
        
        // Créer l'item
        const item = {
            name: `${chosenRarity} item`,
            type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
            rarity: chosenRarity,
            value: this.calculateItemValue(chosenRarity, rank)
        };
        
        // Si c'est un équipement
        if (item.type === 'weapon' || item.type === 'armor') {
            item.slot = item.type === 'weapon' ? 'weapon' : 
                        slots[Math.floor(Math.random() * (slots.length - 1)) + 1];
            item.equippable = true;
            item.bonuses = this.generateItemBonuses(chosenRarity, item.slot);
        } else {
            item.usable = true;
            item.stackable = true;
            item.maxStack = 99;
        }
        
        return item;
    }
    
    getRarityChances(rank, difficulty) {
        const baseChances = {
            'E': { common: 0.9, uncommon: 0.1 },
            'D': { common: 0.8, uncommon: 0.2 },
            'C': { common: 0.7, uncommon: 0.25, rare: 0.05 },
            'B': { common: 0.6, uncommon: 0.3, rare: 0.1 },
            'A': { common: 0.5, uncommon: 0.3, rare: 0.15, epic: 0.05 },
            'S': { common: 0.4, uncommon: 0.3, rare: 0.2, epic: 0.1 },
            'SS': { common: 0.3, uncommon: 0.3, rare: 0.2, epic: 0.15, legendary: 0.05 },
            'SSS': { common: 0.2, uncommon: 0.3, rare: 0.2, epic: 0.2, legendary: 0.1 }
        };
        
        const difficultyMultiplier = {
            'normal': 1,
            'hard': 1.2,
            'hell': 1.5,
            'real': 2
        };
        
        const multiplier = difficultyMultiplier[difficulty] || 1;
        const chances = baseChances[rank] || baseChances.E;
        
        // Ajuster les chances avec la difficulté
        const adjusted = {};
        Object.entries(chances).forEach(([rarity, chance]) => {
            if (rarity === 'common') {
                adjusted[rarity] = chance / multiplier;
            } else {
                adjusted[rarity] = chance * multiplier;
            }
        });
        
        // Normaliser
        const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
        Object.keys(adjusted).forEach(key => {
            adjusted[key] /= total;
        });
        
        return adjusted;
    }
    
    calculateItemValue(rarity, rank) {
        const baseValues = {
            'common': 50,
            'uncommon': 150,
            'rare': 500,
            'epic': 1500,
            'legendary': 5000
        };
        
        const rankMultiplier = {
            'E': 1,
            'D': 1.5,
            'C': 2.5,
            'B': 4,
            'A': 6,
            'S': 9,
            'SS': 13,
            'SSS': 18
        };
        
        return Math.floor((baseValues[rarity] || 50) * (rankMultiplier[rank] || 1));
    }
    
    generateItemBonuses(rarity, slot) {
        const bonuses = {};
        const statOptions = ['strength', 'agility', 'endurance', 'intelligence', 'perception'];
        
        // Nombre de bonus selon la rareté
        const bonusCount = {
            'common': 1,
            'uncommon': 1,
            'rare': 2,
            'epic': 3,
            'legendary': 4
        };
        
        const count = bonusCount[rarity] || 1;
        
        for (let i = 0; i < count; i++) {
            const stat = statOptions[Math.floor(Math.random() * statOptions.length)];
            const value = this.calculateBonusValue(rarity);
            
            bonuses[stat] = (bonuses[stat] || 0) + value;
        }
        
        // Bonus spécifiques au slot
        switch (slot) {
            case 'weapon':
                bonuses.damage = bonuses.damage || this.calculateBonusValue(rarity) * 2;
                break;
            case 'armor':
                bonuses.defense = bonuses.defense || this.calculateBonusValue(rarity) * 2;
                break;
            case 'helmet':
                bonuses.health = bonuses.health || this.calculateBonusValue(rarity) * 10;
                break;
            case 'boots':
                bonuses.speed = bonuses.speed || this.calculateBonusValue(rarity) * 0.1;
                break;
        }
        
        return bonuses;
    }
    
    calculateBonusValue(rarity) {
        const values = {
            'common': { min: 1, max: 3 },
            'uncommon': { min: 2, max: 5 },
            'rare': { min: 3, max: 8 },
            'epic': { min: 5, max: 12 },
            'legendary': { min: 8, max: 20 }
        };
        
        const range = values[rarity] || values.common;
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
}

window.InventorySystem = new InventorySystem();

class InventorySystem {
    constructor() {
        this.items = new Map();
        this.equipment = {
            weapon: null,
            armor: null,
            accessory1: null,
            accessory2: null
        };
        this.capacity = 50;
        this.gold = 100;
        
        this.load();
    }
    
    addItem(itemId, quantity = 1) {
        const existing = this.items.get(itemId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.set(itemId, {
                id: itemId,
                quantity: quantity,
                ...ItemDatabase[itemId]
            });
        }
        
        this.save();
        UI.Notifications.show(`Obtenu: ${ItemDatabase[itemId].name} x${quantity}`, 'item');
    }
    
    removeItem(itemId, quantity = 1) {
        const existing = this.items.get(itemId);
        if (!existing) return false;
        
        if (existing.quantity > quantity) {
            existing.quantity -= quantity;
        } else {
            this.items.delete(itemId);
        }
        
        this.save();
        return true;
    }
    
    equipItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) return false;
        
        if (item.type === 'weapon') {
            this.unequip('weapon');
            this.equipment.weapon = itemId;
        } else if (item.type === 'armor') {
            this.unequip('armor');
            this.equipment.armor = itemId;
        } else if (item.type === 'accessory') {
            if (!this.equipment.accessory1) {
                this.equipment.accessory1 = itemId;
            } else if (!this.equipment.accessory2) {
                this.equipment.accessory2 = itemId;
            } else {
                // Remplacer le premier accessoire
                this.unequip('accessory1');
                this.equipment.accessory1 = itemId;
            }
        }
        
        this.applyEquipmentStats();
        this.save();
        return true;
    }
    
    unequip(slot) {
        const itemId = this.equipment[slot];
        if (!itemId) return;
        
        this.equipment[slot] = null;
        this.applyEquipmentStats();
        this.save();
    }
    
    applyEquipmentStats() {
        // Réinitialiser les bonus d'équipement
        Player.equipmentStats = {
            strength: 0,
            agility: 0,
            endurance: 0,
            intelligence: 0,
            perception: 0,
            charisma: 0
        };
        
        // Appliquer les stats de chaque équipement
        Object.values(this.equipment).forEach(itemId => {
            if (itemId) {
                const item = ItemDatabase[itemId];
                if (item.stats) {
                    Object.entries(item.stats).forEach(([stat, value]) => {
                        Player.equipmentStats[stat] += value;
                    });
                }
            }
        });
        
        // Mettre à jour le joueur
        Player.updateStats();
    }
    
    useItem(itemId) {
        const item = this.items.get(itemId);
        if (!item) return false;
        
        if (item.type === 'consumable') {
            if (item.effect) {
                this.applyItemEffect(item);
                this.removeItem(itemId, 1);
                return true;
            }
        }
        
        return false;
    }
    
    applyItemEffect(item) {
        switch (item.effect) {
            case 'heal':
                Player.heal(item.value);
                break;
            case 'mana':
                Player.restoreMana(item.value);
                break;
            case 'buff':
                Player.addBuff(item.buffType, item.value, item.duration);
                break;
        }
    }
    
    getTotalItems() {
        let total = 0;
        for (const item of this.items.values()) {
            total += item.quantity;
        }
        return total;
    }
    
    isFull() {
        return this.getTotalItems() >= this.capacity;
    }
    
    save() {
        const data = {
            items: Array.from(this.items.entries()),
            equipment: this.equipment,
            capacity: this.capacity,
            gold: this.gold
        };
        
        SaveManager.save('inventory', data);
    }
    
    load() {
        const data = SaveManager.load('inventory');
        if (data) {
            this.items = new Map(data.items);
            this.equipment = data.equipment;
            this.capacity = data.capacity;
            this.gold = data.gold;
            
            this.applyEquipmentStats();
        }
    }
    
    // Interface avec l'UI
    static updateUI() {
        if (window.UI && UI.InventoryUI) {
            UI.InventoryUI.update();
        }
    }
}

// Base de données d'objets (exemple)
const ItemDatabase = {
    'sword_basic': {
        name: 'Épée Rouillée',
        type: 'weapon',
        rarity: 'common',
        stats: { strength: 3 },
        description: 'Une vieille épée rouillée mais qui peut encore servir.'
    },
    'armor_leather': {
        name: 'Armure de Cuir',
        type: 'armor',
        rarity: 'common',
        stats: { endurance: 5 },
        description: 'Armure légère en cuir.'
    },
    'potion_health': {
        name: 'Potion de Vie',
        type: 'consumable',
        rarity: 'common',
        effect: 'heal',
        value: 50,
        description: 'Restaure 50 PV.'
    },
    'potion_mana': {
        name: 'Potion de Mana',
        type: 'consumable',
        rarity: 'common',
        effect: 'mana',
        value: 30,
        description: 'Restaure 30 PM.'
    },
    'ring_strength': {
        name: 'Anneau de Force',
        type: 'accessory',
        rarity: 'uncommon',
        stats: { strength: 5, agility: 2 },
        description: 'Un anneau qui augmente la force et l\'agilité.'
    }
};
