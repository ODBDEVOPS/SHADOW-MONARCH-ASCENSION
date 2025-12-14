class SaveManager {
    constructor() {
        this.saveSlots = 3;
        this.autoSaveInterval = 30000; // 30 secondes
        this.backupCount = 5;
        
        this.init();
    }
    
    init() {
        // Vérifier le stockage disponible
        this.checkStorage();
        
        // Nettoyer les sauvegardes corrompues
        this.cleanCorruptedSaves();
        
        // Démarrer l'autosave
        this.startAutoSave();
        
        // Gérer les événements de fermeture
        this.setupBeforeUnload();
    }
    
    checkStorage() {
        try {
            // Tester le localStorage
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            console.warn('localStorage non disponible, utilisation de fallback');
            this.useFallbackStorage();
            return false;
        }
    }
    
    useFallbackStorage() {
        // Fallback: IndexedDB ou cookies
        if ('indexedDB' in window) {
            this.useIndexedDB();
        } else {
            this.useCookies();
        }
    }
    
    async useIndexedDB() {
        const dbName = 'ShadowMonarchSaves';
        const dbVersion = 1;
        
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('saves')) {
                db.createObjectStore('saves', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log('IndexedDB initialisé');
        };
        
        request.onerror = (event) => {
            console.error('Erreur IndexedDB:', event.target.error);
        };
    }
    
    save(key, data) {
        const saveData = {
            data: data,
            timestamp: Date.now(),
            version: '1.0.0'
        };
        
        try {
            // Essayer localStorage d'abord
            localStorage.setItem(`sm_${key}`, JSON.stringify(saveData));
            
            // Sauvegarde de secours dans IndexedDB si disponible
            if (this.db) {
                this.saveToIndexedDB(key, saveData);
            }
            
            console.log(`Sauvegarde réussie: ${key}`);
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
            this.compactSaves();
            return false;
        }
    }
    
    async saveToIndexedDB(key, data) {
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');
            
            const request = store.put({
                id: key,
                ...data
            });
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    load(key) {
        try {
            // Essayer localStorage
            const saved = localStorage.getItem(`sm_${key}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                
                // Vérifier la version
                if (this.checkVersion(parsed.version)) {
                    return parsed.data;
                } else {
                    // Migration de version
                    return this.migrateSave(parsed.data, parsed.version);
                }
            }
            
            // Essayer IndexedDB
            if (this.db) {
                return this.loadFromIndexedDB(key);
            }
            
            return null;
        } catch (e) {
            console.error('Erreur chargement:', e);
            return null;
        }
    }
    
    async loadFromIndexedDB(key) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readonly');
            const store = transaction.objectStore('saves');
            
            const request = store.get(key);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    checkVersion(savedVersion) {
        const currentVersion = '1.0.0';
        
        // Logique simple de vérification de version
        const savedParts = savedVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);
        
        return savedParts[0] === currentParts[0]; // Même version majeure
    }
    
    migrateSave(data, oldVersion) {
        console.log(`Migration sauvegarde depuis ${oldVersion}`);
        
        // Migration simple - à étendre selon les besoins
        if (oldVersion === '0.9.0') {
            // Ajouter de nouveaux champs
            data.stats = data.stats || EvolutionSystem.stats;
            data.skills = data.skills || EvolutionSystem.skills;
        }
        
        return data;
    }
    
    autoSave() {
        console.log('Autosave en cours...');
        
        // Sauvegarder tous les systèmes
        const saveData = {
            evolution: EvolutionSystem,
            player: Player,
            inventory: InventorySystem,
            shadowArmy: ShadowArmySystem,
            quests: QuestSystem,
            world: WorldState,
            timestamp: Date.now()
        };
        
        this.save('autosave', saveData);
        
        // Rotation des autosaves
        this.rotateAutoSaves();
    }
    
    rotateAutoSaves() {
        // Garder les 5 dernières autosaves
        for (let i = this.backupCount - 1; i > 0; i--) {
            const oldKey = `autosave_${i}`;
            const newKey = `autosave_${i + 1}`;
            
            const oldData = localStorage.getItem(`sm_${oldKey}`);
            if (oldData) {
                localStorage.setItem(`sm_${newKey}`, oldData);
            }
        }
        
        // Copier la dernière autosave comme backup 1
        const current = localStorage.getItem('sm_autosave');
        if (current) {
            localStorage.setItem('sm_autosave_1', current);
        }
    }
    
    startAutoSave() {
        setInterval(() => this.autoSave(), this.autoSaveInterval);
        
        // Également sauvegarder quand le jeu perd le focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.autoSave();
            }
        });
    }
    
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            this.autoSave();
            
            // Certains navigateurs nécessitent un retour
            e.preventDefault();
            e.returnValue = '';
        });
    }
    
    exportSave(slot = 1) {
        const data = this.load(`slot_${slot}`) || this.load('autosave');
        
        if (!data) {
            alert('Aucune sauvegarde à exporter');
            return;
        }
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `shadow_monarch_save_${slot}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validation basique
                    if (!data.evolution || !data.player) {
                        throw new Error('Format de sauvegarde invalide');
                    }
                    
                    // Sauvegarder
                    this.save('imported', data);
                    
                    // Charger dans le jeu
                    this.loadImportedSave(data);
                    
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
    
    loadImportedSave(data) {
        // Charger les données dans chaque système
        if (data.evolution) {
            Object.assign(EvolutionSystem, data.evolution);
        }
        
        if (data.player) {
            Object.assign(Player, data.player);
        }
        
        // etc...
        
        console.log('Sauvegarde importée avec succès');
        UI.Notifications.show('Sauvegarde importée!', 'success');
    }
    
    deleteSave(slot) {
        localStorage.removeItem(`sm_slot_${slot}`);
        
        if (this.db) {
            this.deleteFromIndexedDB(`slot_${slot}`);
        }
        
        UI.Notifications.show(`Sauvegarde ${slot} supprimée`, 'info');
    }
    
    async deleteFromIndexedDB(key) {
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['saves'], 'readwrite');
            const store = transaction.objectStore('saves');
            
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
    
    getSaveInfo() {
        const info = {
            slots: [],
            totalSize: 0,
            lastSave: null
        };
        
        // Analyser toutes les sauvegardes
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('sm_')) {
                const data = localStorage.getItem(key);
                const size = new Blob([data]).size;
                
                info.totalSize += size;
                
                if (key === 'sm_autosave') {
                    const parsed = JSON.parse(data);
                    info.lastSave = new Date(parsed.timestamp);
                }
                
                if (key.startsWith('sm_slot_')) {
                    const slot = key.replace('sm_slot_', '');
                    info.slots.push({
                        slot: parseInt(slot),
                        size: size,
                        exists: true
                    });
                }
            }
        }
        
        return info;
    }
    
    cleanCorruptedSaves() {
        // Nettoyer les sauvegardes corrompues
        const corrupted = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('sm_')) {
                try {
                    JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    corrupted.push(key);
                }
            }
        }
        
        corrupted.forEach(key => {
            console.warn(`Suppression sauvegarde corrompue: ${key}`);
            localStorage.removeItem(key);
        });
    }
    
    compactSaves() {
        // Tenter de libérer de l'espace
        if (this.isStorageFull()) {
            // Supprimer les vieilles autosaves
            for (let i = this.backupCount; i > 3; i--) {
                localStorage.removeItem(`sm_autosave_${i}`);
            }
            
            // Nettoyer les logs
            localStorage.removeItem('sm_game_log');
            
            UI.Notifications.show('Stockage nettoyé', 'warning');
        }
    }
    
    isStorageFull() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return false;
        } catch (e) {
            return e.name === 'QuotaExceededError';
        }
    }
    
    // Fonctions utilitaires
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    static formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}

window.SaveManager = new SaveManager();
