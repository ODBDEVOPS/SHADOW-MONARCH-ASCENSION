class DungeonGenerator {
    constructor() {
        this.currentDungeon = null;
        this.dungeonTemplates = DungeonTemplates;
    }
    
    generateDungeon(dungeonId, difficulty = 'normal') {
        const template = this.dungeonTemplates[dungeonId];
        if (!template) {
            console.error(`Donjon inconnu: ${dungeonId}`);
            return null;
        }
        
        const dungeon = {
            id: dungeonId,
            name: template.name,
            difficulty: difficulty,
            seed: Date.now(),
            rooms: [],
            enemies: [],
            loot: [],
            traps: [],
            generatedAt: Date.now()
        };
        
        // Générer la disposition des salles
        dungeon.rooms = this.generateRoomLayout(template.size, dungeon.seed);
        
        // Peupler avec des ennemis
        dungeon.enemies = this.populateEnemies(dungeon.rooms, template, difficulty);
        
        // Ajouter du butin
        dungeon.loot = this.generateLoot(dungeon.rooms, template, difficulty);
        
        // Ajouter des pièges
        dungeon.traps = this.generateTraps(dungeon.rooms, template, difficulty);
        
        this.currentDungeon = dungeon;
        return dungeon;
    }
    
    generateRoomLayout(size, seed) {
        const rooms = [];
        const rng = new Math.seedrandom(seed);
        
        // Génération procédurale simple
        for (let i = 0; i < size; i++) {
            const room = {
                id: i,
                type: this.getRandomRoomType(rng),
                position: {
                    x: (i % 3) * 10,
                    y: 0,
                    z: Math.floor(i / 3) * 10
                },
                size: {
                    width: 8 + rng() * 4,
                    height: 5,
                    depth: 8 + rng() * 4
                },
                connections: [],
                cleared: false
            };
            
            rooms.push(room);
        }
        
        // Créer des connexions entre les salles
        for (let i = 0; i < rooms.length - 1; i++) {
            rooms[i].connections.push(i + 1);
        }
        
        return rooms;
    }
    
    getRandomRoomType(rng) {
        const types = [
            'entrance', 'corridor', 'chamber', 'treasure', 'boss',
            'library', 'armory', 'prison', 'ritual', 'garden'
        ];
        
        return types[Math.floor(rng() * types.length)];
    }
    
    populateEnemies(rooms, template, difficulty) {
        const enemies = [];
        const difficultyMultipliers = {
            'easy': 0.7,
            'normal': 1.0,
            'hard': 1.5,
            'nightmare': 2.5
        };
        
        const multiplier = difficultyMultipliers[difficulty] || 1.0;
        
        rooms.forEach(room => {
            if (room.type === 'boss') {
                // Boss room
                const boss = this.createBossEnemy(template.boss, multiplier);
                boss.roomId = room.id;
                enemies.push(boss);
            } else if (room.type !== 'entrance' && room.type !== 'treasure') {
                // Ennemis normaux
                const enemyCount = 2 + Math.floor(Math.random() * 3);
                
                for (let i = 0; i < enemyCount; i++) {
                    const enemyType = this.getRandomEnemyType(template.theme);
                    const enemy = this.createEnemy(enemyType, multiplier);
                    enemy.roomId = room.id;
                    enemies.push(enemy);
                }
            }
        });
        
        return enemies;
    }
    
    getRandomEnemyType(theme) {
        const themeEnemies = {
            'forest': ['slime', 'goblin', 'wolf', 'spider'],
            'cave': ['bat', 'rat', 'goblin', 'troll'],
            'ruins': ['skeleton', 'zombie', 'ghost', 'gargoyle'],
            'castle': ['knight', 'mage', 'archer', 'guard']
        };
        
        const enemies = themeEnemies[theme] || themeEnemies.forest;
        return enemies[Math.floor(Math.random() * enemies.length)];
    }
    
    createEnemy(type, multiplier = 1.0) {
        const enemyTemplates = {
            'slime': { health: 30, attack: 5, defense: 2, speed: 3 },
            'goblin': { health: 50, attack: 8, defense: 4, speed: 5 },
            'wolf': { health: 40, attack: 10, defense: 3, speed: 8 },
            'skeleton': { health: 60, attack: 12, defense: 5, speed: 4 }
        };
        
        const template = enemyTemplates[type] || enemyTemplates.slime;
        
        return {
            id: `enemy_${Date.now()}_${Math.random()}`,
            type: type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
            health: Math.floor(template.health * multiplier),
            maxHealth: Math.floor(template.health * multiplier),
            attack: Math.floor(template.attack * multiplier),
            defense: Math.floor(template.defense * multiplier),
            speed: Math.floor(template.speed * multiplier),
            level: Math.floor(multiplier * 5),
            expReward: Math.floor(10 * multiplier),
            goldReward: Math.floor(5 * multiplier),
            abilities: [],
            lootTable: this.getEnemyLootTable(type)
        };
    }
    
    createBossEnemy(bossType, multiplier = 1.0) {
        const bossTemplates = {
            'goblin_king': { 
                health: 500, 
                attack: 30, 
                defense: 15, 
                speed: 6,
                abilities: ['summon_goblins', 'power_slam']
            },
            'ancient_dragon': { 
                health: 1000, 
                attack: 50, 
                defense: 25, 
                speed: 8,
                abilities: ['fire_breath', 'wing_sweep', 'roar']
            }
        };
        
        const template = bossTemplates[bossType] || bossTemplates.goblin_king;
        
        return {
            id: `boss_${Date.now()}`,
            type: bossType,
            name: `${bossType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`,
            health: Math.floor(template.health * multiplier),
            maxHealth: Math.floor(template.health * multiplier),
            attack: Math.floor(template.attack * multiplier),
            defense: Math.floor(template.defense * multiplier),
            speed: Math.floor(template.speed * multiplier),
            level: Math.floor(multiplier * 15),
            expReward: Math.floor(100 * multiplier),
            goldReward: Math.floor(50 * multiplier),
            abilities: template.abilities,
            lootTable: this.getBossLootTable(bossType),
            isBoss: true
        };
    }
    
    getEnemyLootTable(enemyType) {
        const lootTables = {
            'slime': [
                { item: 'gel', chance: 0.5, min: 1, max: 3 },
                { item: 'potion_health', chance: 0.1, min: 1, max: 1 }
            ],
            'goblin': [
                { item: 'goblin_ear', chance: 0.7, min: 1, max: 2 },
                { item: 'coin', chance: 0.3, min: 1, max: 5 },
                { item: 'dagger_rusty', chance: 0.05, min: 1, max: 1 }
            ]
        };
        
        return lootTables[enemyType] || lootTables.slime;
    }
    
    getBossLootTable(bossType) {
        return [
            { item: 'boss_token', chance: 1.0, min: 1, max: 1 },
            { item: 'rare_equipment', chance: 0.8, min: 1, max: 1 },
            { item: 'skill_book', chance: 0.5, min: 1, max: 1 },
            { item: 'crystal_mana', chance: 1.0, min: 3, max: 10 }
        ];
    }
    
    generateLoot(rooms, template, difficulty) {
        const loot = [];
        const difficultyMultipliers = {
            'easy': 0.5,
            'normal': 1.0,
            'hard': 1.5,
            'nightmare': 2.0
        };
        
        const multiplier = difficultyMultipliers[difficulty] || 1.0;
        
        rooms.forEach(room => {
            if (room.type === 'treasure' || room.type === 'boss') {
                const lootCount = 1 + Math.floor(Math.random() * 3);
                
                for (let i = 0; i < lootCount; i++) {
                    const lootItem = this.createLootItem(template.lootLevel, multiplier);
                    lootItem.roomId = room.id;
                    loot.push(lootItem);
                }
            }
        });
        
        return loot;
    }
    
    createLootItem(lootLevel, multiplier) {
        const lootTypes = [
            { type: 'gold', min: 10, max: 50 },
            { type: 'equipment', rarity: 'common' },
            { type: 'consumable', item: 'potion_health' },
            { type: 'material', material: 'iron_ore' }
        ];
        
        const selectedType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
        
        return {
            id: `loot_${Date.now()}_${Math.random()}`,
            type: selectedType.type,
            ...selectedType,
            quantity: Math.floor((Math.random() * (selectedType.max - selectedType.min) + selectedType.min) * multiplier)
        };
    }
    
    generateTraps(rooms, template, difficulty) {
        const traps = [];
        
        rooms.forEach(room => {
            if (room.type === 'corridor' || room.type === 'chamber') {
                if (Math.random() < 0.3) { // 30% de chance de piège
                    const trap = this.createTrap(template.trapLevel, difficulty);
                    trap.roomId = room.id;
                    traps.push(trap);
                }
            }
        });
        
        return traps;
    }
    
    createTrap(trapLevel, difficulty) {
        const trapTypes = [
            { type: 'spike', damage: 10 * trapLevel, detectionDC: 10 + trapLevel },
            { type: 'poison', damage: 5 * trapLevel, duration: 10, detectionDC: 12 + trapLevel },
            { type: 'pit', damage: 15 * trapLevel, detectionDC: 8 + trapLevel },
            { type: 'arrow', damage: 8 * trapLevel, detectionDC: 15 + trapLevel }
        ];
        
        const selectedType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
        
        return {
            id: `trap_${Date.now()}`,
            ...selectedType,
            difficulty: difficulty,
            triggered: false
        };
    }
    
    // Fonction pour instancier le donjon dans Three.js
    instantiateDungeon(dungeon) {
        if (!window.game) return;
        
        // Créer le donjon dans la scène Three.js
        dungeon.rooms.forEach(room => {
            this.createRoomMesh(room);
        });
        
        // Créer les ennemis
        dungeon.enemies.forEach(enemy => {
            this.createEnemyMesh(enemy);
        });
        
        // Créer le butin
        dungeon.loot.forEach(loot => {
            this.createLootMesh(loot);
        });
    }
    
    createRoomMesh(room) {
        const geometry = new THREE.BoxGeometry(room.size.width, room.size.height, room.size.depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(room.position.x, room.position.y, room.position.z);
        
        window.game.scene.add(mesh);
        room.mesh = mesh;
    }
    
    createEnemyMesh(enemy) {
        // Créer un modèle simple pour l'ennemi
        const geometry = new THREE.ConeGeometry(0.5, 1, 8);
        const color = enemy.isBoss ? 0xff0000 : 0x00ff00;
        const material = new THREE.MeshBasicMaterial({ color: color });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Positionner dans la salle correspondante
        const room = this.currentDungeon.rooms.find(r => r.id === enemy.roomId);
        if (room) {
            mesh.position.copy(room.position);
            mesh.position.x += (Math.random() - 0.5) * (room.size.width - 2);
            mesh.position.z += (Math.random() - 0.5) * (room.size.depth - 2);
            mesh.position.y = 1;
        }
        
        window.game.scene.add(mesh);
        enemy.mesh = mesh;
    }
    
    createLootMesh(loot) {
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffd700, // or
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        const room = this.currentDungeon.rooms.find(r => r.id === loot.roomId);
        if (room) {
            mesh.position.copy(room.position);
            mesh.position.x += (Math.random() - 0.5) * (room.size.width - 1);
            mesh.position.z += (Math.random() - 0.5) * (room.size.depth - 1);
            mesh.position.y = 0.5;
        }
        
        // Animation de rotation
        mesh.userData = { rotationSpeed: 0.01 };
        
        window.game.scene.add(mesh);
        loot.mesh = mesh;
    }
    
    update() {
        // Animer le butin (rotation)
        if (this.currentDungeon) {
            this.currentDungeon.loot.forEach(loot => {
                if (loot.mesh) {
                    loot.mesh.rotation.y += loot.mesh.userData.rotationSpeed;
                }
            });
        }
    }
}

// Templates de donjons
const DungeonTemplates = {
    'dark_forest': {
        name: 'Forêt Sombre',
        theme: 'forest',
        size: 9,
        boss: 'goblin_king',
        lootLevel: 1,
        trapLevel: 1,
        recommendedLevel: 5,
        description: 'Une forêt maudite peuplée de créatures corrompues.'
    },
    'ancient_ruins': {
        name: 'Ruines Anciennes',
        theme: 'ruins',
        size: 12,
        boss: 'ancient_dragon',
        lootLevel: 3,
        trapLevel: 2,
        recommendedLevel: 15,
        description: 'Des ruines anciennes remplies de pièges et de gardiens morts-vivants.'
    },
    'crystal_cave': {
        name: 'Caverne de Cristal',
        theme: 'cave',
        size: 15,
        boss: 'crystal_golem',
        lootLevel: 4,
        trapLevel: 3,
        recommendedLevel: 25,
        description: 'Une caverne scintillante remplie de cristaux de mana et de créatures de pierre.'
    }
};
