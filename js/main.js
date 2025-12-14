// main.js - Point d'entrée principal

class Game {
    constructor() {
        this.isInitialized = false;
        this.isPaused = false;
        
        this.init();
    }
    
    async init() {
        // Afficher l'écran de chargement
        this.showLoadingScreen();
        
        // Initialiser les systèmes dans l'ordre
        await this.initializeSystems();
        
        // Cacher l'écran de chargement
        this.hideLoadingScreen();
        
        // Démarrer la boucle de jeu
        this.startGameLoop();
        
        this.isInitialized = true;
        console.log('Jeu initialisé avec succès');
    }
    
    async initializeSystems() {
        // 1. Système de sauvegarde
        this.saveManager = SaveManager;
        
        // 2. Système d'évolution
        this.evolutionSystem = EvolutionSystem;
        
        // 3. Système de combat
        this.combatSystem = CombatSystem;
        
        // 4. Système d'inventaire
        this.inventorySystem = new InventorySystem();
        
        // 5. Système de quêtes
        this.questSystem = new QuestSystem();
        
        // 6. Système d'armée d'ombre
        this.shadowArmySystem = new ShadowArmySystem();
        
        // 7. Three.js App
        this.threeApp = new ThreeJSApp();
        
        // Attendre que Three.js soit prêt
        await this.waitForThreeJS();
        
        // 8. Initialiser l'UI
        this.uiManager = new UIManager();
        
        // 9. Initialiser l'audio
        this.audioManager = new AudioManager();
        
        // 10. Charger les données sauvegardées
        this.loadGameData();
    }
    
    async waitForThreeJS() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.game && window.game.scene) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    loadGameData() {
        // Charger la sauvegarde ou initialiser une nouvelle partie
        const saveData = this.saveManager.load('current');
        
        if (saveData) {
            // Charger les données dans chaque système
            this.evolutionSystem.loadFromSave(saveData.evolution);
            this.inventorySystem.load(saveData.inventory);
            this.questSystem.load(saveData.quests);
            this.shadowArmySystem.load(saveData.shadowArmy);
        } else {
            // Nouvelle partie
            this.startNewGame();
        }
    }
    
    startNewGame() {
        console.log('Nouvelle partie démarrée');
        
        // Initialiser les quêtes de départ
        this.questSystem.initializeStartingQuests();
        
        // Donner l'équipement de départ
        this.inventorySystem.addItem('sword_basic');
        this.inventorySystem.addItem('potion_health', 3);
        
        // Sauvegarder
        this.saveGame();
    }
    
    saveGame() {
        const saveData = {
            evolution: this.evolutionSystem,
            inventory: this.inventorySystem,
            quests: this.questSystem,
            shadowArmy: this.shadowArmySystem,
            timestamp: Date.now()
        };
        
        this.saveManager.save('current', saveData);
        console.log('Partie sauvegardée');
    }
    
    startGameLoop() {
        const gameLoop = () => {
            if (!this.isPaused) {
                this.update();
            }
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    update() {
        const deltaTime = 1/60; // Approximation
        
        // Mettre à jour les systèmes
        if (this.threeApp) {
            this.threeApp.update(deltaTime);
        }
        
        this.questSystem.update(deltaTime);
        this.shadowArmySystem.update(deltaTime);
        
        // Mettre à jour l'UI
        if (this.uiManager) {
            this.uiManager.update(deltaTime);
        }
    }
    
    showLoadingScreen() {
        // Créer ou afficher l'écran de chargement
        let loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) {
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.innerHTML = `
                <div class="loader"></div>
                <div id="loading-text">Chargement...</div>
            `;
            document.body.appendChild(loadingScreen);
        }
        loadingScreen.style.display = 'flex';
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
    
    pause() {
        this.isPaused = true;
        this.audioManager.pauseAll();
    }
    
    resume() {
        this.isPaused = false;
        this.audioManager.resumeAll();
    }
    
    // Gestion des événements globaux
    setupEventListeners() {
        // Pause quand l'app perd le focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Sauvegarde avant fermeture
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }
}

// Démarrer le jeu quand la page est chargée
window.addEventListener('load', () => {
    window.mainGame = new Game();
});
