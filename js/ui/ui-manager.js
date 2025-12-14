class UIManager {
    constructor() {
        this.currentScreen = 'game';
        this.notifications = [];
        this.maxNotifications = 5;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createNotificationContainer();
    }
    
    setupEventListeners() {
        // Bouton d'évolution
        document.getElementById('btn-evolution').addEventListener('click', () => {
            this.showEvolutionScreen();
        });
        
        // Bouton d'inventaire
        document.getElementById('btn-inventory').addEventListener('click', () => {
            this.showInventoryScreen();
        });
        
        // Bouton de quêtes
        document.getElementById('btn-quests').addEventListener('click', () => {
            this.showQuestScreen();
        });
        
        // Bouton d'armée
        document.getElementById('btn-army').addEventListener('click', () => {
            this.showArmyScreen();
        });
        
        // Fermer les écrans
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn') || 
                e.target.classList.contains('fullscreen-ui') && e.target.id) {
                this.hideAllScreens();
            }
        });
        
        // Touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllScreens();
            }
        });
    }
    
    showEvolutionScreen() {
        this.hideAllScreens();
        document.getElementById('evolution-ui').classList.add('active');
        this.currentScreen = 'evolution';
        
        // Mettre à jour les données
        EvolutionUI.update();
    }
    
    showInventoryScreen() {
        this.hideAllScreens();
        // Créer ou montrer l'écran d'inventaire
        let inventoryUI = document.getElementById('inventory-ui');
        if (!inventoryUI) {
            inventoryUI = this.createInventoryUI();
        }
        inventoryUI.classList.add('active');
        this.currentScreen = 'inventory';
    }
    
    showQuestScreen() {
        this.hideAllScreens();
        // Créer ou montrer l'écran de quêtes
        let questUI = document.getElementById('quest-ui');
        if (!questUI) {
            questUI = this.createQuestUI();
        }
        questUI.classList.add('active');
        this.currentScreen = 'quest';
    }
    
    showArmyScreen() {
        this.hideAllScreens();
        // Créer ou montrer l'écran d'armée
        let armyUI = document.getElementById('army-ui');
        if (!armyUI) {
            armyUI = this.createArmyUI();
        }
        armyUI.classList.add('active');
        this.currentScreen = 'army';
    }
    
    hideAllScreens() {
        document.querySelectorAll('.fullscreen-ui').forEach(ui => {
            ui.classList.remove('active');
        });
        this.currentScreen = 'game';
    }
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            width: 300px;
            max-height: 400px;
            overflow-y: auto;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.getElementById('ui-overlay').appendChild(container);
    }
    
    showNotification(text, type = 'info') {
        const notification = {
            id: Date.now(),
            text: text,
            type: type,
            timestamp: Date.now(),
            duration: 3000
        };
        
        this.notifications.push(notification);
        this.updateNotificationDisplay();
        
        // Supprimer après la durée
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, notification.duration);
    }
    
    updateNotificationDisplay() {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        // Trier par timestamp (plus récent en premier)
        this.notifications.sort((a, b) => b.timestamp - a.timestamp);
        
        // Garder seulement les plus récents
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }
        
        // Mettre à jour l'affichage
        container.innerHTML = '';
        
        this.notifications.forEach(notif => {
            const element = document.createElement('div');
            element.className = `notification ${notif.type}`;
            element.textContent = notif.text;
            element.style.cssText = `
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                margin-bottom: 5px;
                border-left: 4px solid ${this.getNotificationColor(notif.type)};
                border-radius: 4px;
                animation: fadeIn 0.3s;
            `;
            
            container.appendChild(element);
        });
    }
    
    getNotificationColor(type) {
        const colors = {
            'info': '#3b82f6',
            'success': '#10b981',
            'warning': '#f59e0b',
            'error': '#ef4444',
            'quest': '#8b5cf6',
            'item': '#f59e0b',
            'soldier': '#6d28d9',
            'evolution': '#00f3ff',
            'levelup': '#fbbf24'
        };
        
        return colors[type] || colors.info;
    }
    
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateNotificationDisplay();
    }
    
    createInventoryUI() {
        const ui = document.createElement('div');
        ui.id = 'inventory-ui';
        ui.className = 'fullscreen-ui';
        ui.innerHTML = `
            <div class="inventory-header">
                <h2 class="inventory-title">Inventaire</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="inventory-content">
                <div class="gold-display">
                    Or: <span id="gold-amount">${InventorySystem.gold}</span>
                </div>
                <div class="inventory-grid" id="inventory-grid">
                    <!-- Les objets seront ajoutés ici dynamiquement -->
                </div>
                <div class="equipment-slots">
                    <h3>Équipement</h3>
                    <div class="equipment-grid">
                        <div class="equipment-slot" data-slot="weapon">Arme</div>
                        <div class="equipment-slot" data-slot="armor">Armure</div>
                        <div class="equipment-slot" data-slot="accessory1">Accessoire 1</div>
                        <div class="equipment-slot" data-slot="accessory2">Accessoire 2</div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(ui);
        return ui;
    }
    
    createQuestUI() {
        const ui = document.createElement('div');
        ui.id = 'quest-ui';
        ui.className = 'fullscreen-ui';
        ui.innerHTML = `
            <div class="quest-header">
                <h2 class="quest-title">Quêtes</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="quest-content">
                <div class="quest-tabs">
                    <button class="quest-tab active" data-tab="active">Actives</button>
                    <button class="quest-tab" data-tab="available">Disponibles</button>
                    <button class="quest-tab" data-tab="completed">Terminées</button>
                </div>
                <div class="quest-list" id="quest-list">
                    <!-- Les quêtes seront ajoutées ici dynamiquement -->
                </div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(ui);
        return ui;
    }
    
    createArmyUI() {
        const ui = document.createElement('div');
        ui.id = 'army-ui';
        ui.className = 'fullscreen-ui';
        ui.innerHTML = `
            <div class="army-header">
                <h2 class="army-title">Armée d'Ombre</h2>
                <button class="close-btn">×</button>
            </div>
            <div class="army-content">
                <div class="army-stats">
                    Soldats: <span id="soldier-count">${ShadowArmySystem.soldiers.size}</span> / 
                    <span id="soldier-max">${ShadowArmySystem.maxSoldiers}</span>
                </div>
                <div class="soldier-list" id="soldier-list">
                    <!-- Les soldats seront ajoutés ici dynamiquement -->
                </div>
                <div class="army-commands">
                    <h3>Commandes</h3>
                    <div class="command-buttons">
                        <button class="command-btn" id="btn-deploy">Déployer</button>
                        <button class="command-btn" id="btn-merge">Fusionner</button>
                        <button class="command-btn" id="btn-dismiss">Renvooyer</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(ui);
        return ui;
    }
    
    update(deltaTime) {
        // Mettre à jour les éléments d'UI en temps réel
        this.updateHUD();
    }
    
    updateHUD() {
        // Mettre à jour la barre de vie
        if (Player && Player.currentHealth !== undefined) {
            const healthFill = document.querySelector('.health-fill');
            const healthText = document.querySelector('.health-text');
            
            if (healthFill && healthText) {
                const percentage = (Player.currentHealth / Player.maxHealth) * 100;
                healthFill.style.width = `${percentage}%`;
                healthText.textContent = `${Math.floor(Player.currentHealth)}/${Player.maxHealth}`;
            }
        }
        
        // Mettre à jour la barre de mana
        if (Player && Player.currentMana !== undefined) {
            const manaFill = document.querySelector('.mana-fill');
            const manaText = document.querySelector('.mana-text');
            
            if (manaFill && manaText) {
                const percentage = (Player.currentMana / Player.maxMana) * 100;
                manaFill.style.width = `${percentage}%`;
                manaText.textContent = `${Math.floor(Player.currentMana)}/${Player.maxMana}`;
            }
        }
    }
}

// Exposer au global
window.UI = new UIManager();
