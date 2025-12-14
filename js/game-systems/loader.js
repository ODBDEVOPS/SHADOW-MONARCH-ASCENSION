class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.assets = new Map();
        this.promises = [];
        
        this.init();
    }
    
    init() {
        this.setupLoadingScreen();
    }
    
    setupLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen') || 
                             this.createLoadingScreen();
        
        this.loadingScreen = loadingScreen;
        this.progressBar = loadingScreen.querySelector('.progress-bar');
        this.loadingText = loadingScreen.querySelector('#loading-text');
    }
    
    createLoadingScreen() {
        const screen = document.createElement('div');
        screen.id = 'loading-screen';
        screen.innerHTML = `
            <div class="loading-container">
                <div class="loader"></div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                    <div id="loading-text">Chargement...</div>
                </div>
                <div class="loading-tips">
                    <p id="tip-text">Conseil: Utilisez le joystick virtuel pour vous déplacer</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(screen);
        return screen;
    }
    
    async loadAssets(assetList) {
        this.totalAssets = assetList.length;
        this.loadedAssets = 0;
        
        // Mettre à jour l'affichage
        this.updateProgress();
        
        // Charger les assets en parallèle avec limite de concurrence
        const concurrencyLimit = 4;
        const batches = [];
        
        for (let i = 0; i < assetList.length; i += concurrencyLimit) {
            batches.push(assetList.slice(i, i + concurrencyLimit));
        }
        
        for (const batch of batches) {
            await Promise.all(batch.map(asset => this.loadAsset(asset)));
        }
        
        return this.assets;
    }
    
    async loadAsset(asset) {
        try {
            let result;
            
            switch (asset.type) {
                case 'texture':
                    result = await this.loadTexture(asset.url);
                    break;
                case 'model':
                    result = await this.loadModel(asset.url);
                    break;
                case 'audio':
                    result = await this.loadAudio(asset.url);
                    break;
                case 'json':
                    result = await this.loadJSON(asset.url);
                    break;
                default:
                    result = await fetch(asset.url).then(r => r.text());
            }
            
            this.assets.set(asset.name, result);
            this.loadedAssets++;
            this.updateProgress();
            
            return result;
        } catch (error) {
            console.error(`Erreur chargement ${asset.name}:`, error);
            this.loadedAssets++;
            this.updateProgress();
            return null;
        }
    }
    
    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                resolve,
                (progress) => this.onTextureProgress(progress),
                reject
            );
        });
    }
    
    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                url,
                resolve,
                (progress) => this.onModelProgress(progress),
                reject
            );
        });
    }
    
    async loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = reject;
            
            audio.src = url;
            audio.load();
        });
    }
    
    async loadJSON(url) {
        const response = await fetch(url);
        return response.json();
    }
    
    onTextureProgress(progress) {
        if (progress.lengthComputable) {
            const percent = (progress.loaded / progress.total) * 100;
            this.updateSubProgress(percent);
        }
    }
    
    onModelProgress(progress) {
        if (progress.lengthComputable) {
            const percent = (progress.loaded / progress.total) * 100;
            this.updateSubProgress(percent);
        }
    }
    
    updateProgress() {
        if (!this.progressBar || !this.loadingText) return;
        
        const percent = (this.loadedAssets / this.totalAssets) * 100;
        this.progressBar.style.width = `${percent}%`;
        
        this.loadingText.textContent = 
            `Chargement... ${this.loadedAssets}/${this.totalAssets} (${Math.round(percent)}%)`;
        
        // Changer les conseils de chargement
        if (percent % 25 === 0) {
            this.showRandomTip();
        }
        
        // Cacher l'écran de chargement quand terminé
        if (percent >= 100) {
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 500);
        }
    }
    
    updateSubProgress(percent) {
        // Pour le progrès détaillé à l'intérieur d'un asset
        const subProgress = this.loadingScreen.querySelector('.sub-progress');
        if (subProgress) {
            subProgress.style.width = `${percent}%`;
        }
    }
    
    showRandomTip() {
        const tips = [
            "Conseil: Utilisez le joystick virtuel pour vous déplacer",
            "Conseil: Glissez avec deux doigts pour faire tourner la caméra",
            "Conseil: Appuyez longuement sur une compétence pour voir ses détails",
            "Conseil: Montez de rang pour débloquer de nouvelles capacités",
            "Conseil: Extrayez les âmes des ennemis pour créer votre armée d'ombre",
            "Conseil: Complétez les quêtes pour gagner de l'expérience et des récompenses",
            "Conseil: Améliorez vos stats dans l'interface d'évolution"
        ];
        
        const tipText = document.getElementById('tip-text');
        if (tipText) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipText.textContent = randomTip;
        }
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
            }, 300);
        }
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'flex';
            this.loadingScreen.style.opacity = '1';
        }
    }
    
    getAsset(name) {
        return this.assets.get(name);
    }
    
    clear() {
        this.assets.clear();
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
}

// Initialiser le chargeur
window.AssetLoader = new AssetLoader();
