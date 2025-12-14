# **SHADOW MONARCH ASCENSION - MOBILE AVEC THREE.JS & JAVASCRIPT**

## **🎯 ARCHITECTURE MOBILE THREE.JS**

### **Stack Technique Mobile**
```
Moteur 3D: Three.js r158+
UI: HTML5/CSS3 + Touch Events
État: JavaScript (ES6+) 
Sauvegarde: localStorage/IndexedDB
Performance: WebGL 2.0 + Web Workers
```

---

## **📁 STRUCTURE DU PROJET**
```
shadow-monarch-mobile/
├── index.html
├── css/
│   ├── style.css
│   ├── ui-evolution.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── three-app.js
│   ├── game-systems/
│   │   ├── evolution-system.js
│   │   ├── combat-system.js
│   │   ├── inventory-system.js
│   │   └── shadow-army.js
│   ├── ui/
│   │   ├── touch-controls.js
│   │   ├── evolution-ui.js
│   │   └── notifications.js
│   ├── world/
│   │   ├── dungeon-generator.js
│   │   ├── enemy-manager.js
│   │   └── particle-system.js
│   └── utils/
│       ├── save-manager.js
│       ├── performance-monitor.js
│       └── mobile-optimizer.js
├── assets/
│   ├── models/ (glTF/glb)
│   ├── textures/
│   ├── audio/
│   └── icons/
└── service-worker.js (PWA)
```

---

## **🚀 INITIALISATION THREE.JS MOBILE**

### **1. Fichier Principal (index.html)**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Shadow Monarch Ascension</title>
    
    <!-- PWA -->
    <meta name="theme-color" content="#0a0a12">
    <link rel="manifest" href="manifest.json">
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/ui-evolution.css">
    <link rel="stylesheet" href="css/responsive.css">
    
    <!-- Three.js -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/loaders/GLTFLoader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/controls/OrbitControls.js"></script>
    
    <!-- Touch -->
    <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js"></script>
</head>
<body>
    <!-- Canvas 3D -->
    <div id="game-container">
        <canvas id="game-canvas"></canvas>
        
        <!-- Overlay UI -->
        <div id="ui-overlay">
            <!-- Barre de vie/mana -->
            <div class="hud-top">
                <div class="health-bar">
                    <div class="health-fill" style="width: 100%"></div>
                    <span class="health-text">100/100</span>
                </div>
                <div class="mana-bar">
                    <div class="mana-fill" style="width: 100%"></div>
                    <span class="mana-text">50/50</span>
                </div>
            </div>
            
            <!-- Contrôles tactiles -->
            <div class="touch-controls">
                <div class="joystick-area" id="move-joystick">
                    <div class="joystick-base"></div>
                    <div class="joystick-thumb"></div>
                </div>
                
                <div class="action-buttons">
                    <button class="skill-btn" data-skill="1">⚔️</button>
                    <button class="skill-btn" data-skill="2">🛡️</button>
                    <button class="skill-btn" data-skill="3">🔥</button>
                    <button class="skill-btn" data-skill="4">💨</button>
                    <button class="skill-btn special" data-skill="ult">✨</button>
                </div>
            </div>
            
            <!-- Boutons UI -->
            <div class="ui-buttons">
                <button id="btn-evolution" class="ui-btn">📊 Système</button>
                <button id="btn-inventory" class="ui-btn">🎒</button>
                <button id="btn-quests" class="ui-btn">📜</button>
                <button id="btn-army" class="ui-btn">👥</button>
            </div>
        </div>
        
        <!-- Interface d'évolution (cachée par défaut) -->
        <div id="evolution-ui" class="fullscreen-ui">
            <!-- Détails dans evolution-ui.js -->
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="js/utils/performance-monitor.js"></script>
    <script src="js/utils/mobile-optimizer.js"></script>
    <script src="js/utils/save-manager.js"></script>
    <script src="js/game-systems/evolution-system.js"></script>
    <script src="js/game-systems/combat-system.js"></script>
    <script src="js/ui/touch-controls.js"></script>
    <script src="js/ui/evolution-ui.js"></script>
    <script src="js/three-app.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### **2. Initialisation Three.js Mobile Optimisé (three-app.js)**
```javascript
class ThreeJSApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mixers = [];
        this.clock = new THREE.Clock();
        this.player = null;
        this.enemies = [];
        this.shadowSoldiers = [];
        
        this.init();
    }
    
    init() {
        // Détection mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.isLowEnd = this.checkLowEndDevice();
        
        // Créer le renderer optimisé pour mobile
        this.createRenderer();
        
        // Créer la scène
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a12, 10, 50);
        
        // Configuration de la caméra pour mobile
        this.setupCamera();
        
        // Éclairage adaptatif
        this.setupLighting();
        
        // Charger les assets
        this.loadAssets();
        
        // Initialiser les contrôles tactiles
        this.initTouchControls();
        
        // Démarrer la boucle de rendu
        this.animate();
        
        // Gestion de la pause quand l'app est en arrière-plan
        this.setupVisibilityHandler();
    }
    
    createRenderer() {
        const canvas = document.getElementById('game-canvas');
        
        // Paramètres WebGL optimisés pour mobile
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: !this.isLowEnd, // Désactiver antialias sur mobile bas de gamme
            alpha: false,
            powerPreference: 'high-performance',
            precision: this.isLowEnd ? 'mediump' : 'highp'
        });
        
        // Taille adaptative
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Configuration du renderer
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.shadowMap.enabled = !this.isLowEnd;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Optimisations
        this.renderer.autoClear = true;
        this.renderer.sortObjects = true;
    }
    
    setupCamera() {
        // Caméra adaptée au mobile (vue à la 3ème personne)
        const aspect = window.innerWidth / window.innerHeight;
        
        if (this.isMobile) {
            // Vue plus proche sur mobile
            this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
            this.camera.position.set(0, 5, 10);
        } else {
            this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
            this.camera.position.set(0, 8, 15);
        }
        
        // Contrôles simplifiés pour mobile
        if (!this.isMobile) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
        }
    }
    
    setupLighting() {
        // Éclairage performant pour mobile
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x6d28d9, 1);
        directionalLight.position.set(5, 10, 7);
        if (!this.isLowEnd) {
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 512;
            directionalLight.shadow.mapSize.height = 512;
        }
        this.scene.add(directionalLight);
        
        // Lumière spéciale pour l'atmosphère Solo Leveling
        const purpleLight = new THREE.PointLight(0x6d28d9, 0.5, 30);
        purpleLight.position.set(0, 5, 0);
        this.scene.add(purpleLight);
    }
    
    async loadAssets() {
        const loader = new THREE.GLTFLoader();
        
        try {
            // Charger le joueur (modèle bas poly pour mobile)
            const playerModel = await loader.loadAsync('assets/models/player.glb');
            this.player = this.setupPlayer(playerModel.scene);
            this.scene.add(this.player);
            
            // Charger les ennemis de base
            const enemyModel = await loader.loadAsync('assets/models/enemy_basic.glb');
            this.enemyTemplate = enemyModel.scene;
            
            // Charger l'environnement
            const dungeonModel = await loader.loadAsync('assets/models/dungeon_simple.glb');
            this.scene.add(dungeonModel.scene);
            
            // Optimiser les modèles pour mobile
            this.optimizeModels();
            
        } catch (error) {
            console.error('Erreur chargement assets:', error);
            this.useFallbackModels();
        }
    }
    
    setupPlayer(model) {
        // Configuration du joueur
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !this.isLowEnd;
                child.receiveShadow = !this.isLowEnd;
                
                // Optimisation matériaux
                if (child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        roughness: 0.7,
                        metalness: 0.3
                    });
                }
            }
        });
        
        model.scale.set(0.8, 0.8, 0.8);
        model.position.set(0, 0, 0);
        
        // Animation mixer
        const mixer = new THREE.AnimationMixer(model);
        this.mixers.push(mixer);
        
        return model;
    }
    
    initTouchControls() {
        // Joystick virtuel
        const joystick = new VirtualJoystick({
            container: document.getElementById('move-joystick'),
            onMove: (vector) => this.handlePlayerMovement(vector)
        });
        
        // Boutons de compétences
        document.querySelectorAll('.skill-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const skillId = e.target.dataset.skill;
                CombatSystem.useSkill(skillId);
            });
        });
        
        // Gestes tactiles
        const hammer = new Hammer(document.getElementById('game-canvas'));
        hammer.get('pinch').set({ enable: true });
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        
        // Zoom pinch
        hammer.on('pinch', (e) => {
            this.camera.zoom = THREE.MathUtils.clamp(
                this.camera.zoom * e.scale, 
                0.5, 
                3
            );
            this.camera.updateProjectionMatrix();
        });
        
        // Rotation avec 2 doigts
        hammer.on('pan', (e) => {
            if (e.pointers.length === 2) {
                this.camera.rotation.y += e.deltaX * 0.01;
            }
        });
    }
    
    handlePlayerMovement(vector) {
        if (!this.player) return;
        
        // Déplacement basé sur le joystick
        const moveSpeed = 0.1;
        this.player.position.x += vector.x * moveSpeed;
        this.player.position.z += vector.y * moveSpeed;
        
        // Rotation vers la direction
        if (vector.length() > 0.1) {
            const angle = Math.atan2(vector.x, vector.y);
            this.player.rotation.y = angle;
        }
    }
    
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        // Ajuster l'UI pour le mobile
        this.updateUILayout();
    }
    
    updateUILayout() {
        // Adaptation responsive de l'UI
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Mettre à jour les animations
        this.mixers.forEach(mixer => mixer.update(delta));
        
        // Mettre à jour les contrôles
        if (this.controls) this.controls.update();
        
        // Animation des effets
        this.updateEffects(delta);
        
        // Rendu
        this.renderer.render(this.scene, this.camera);
        
        // Monitoring des performances
        PerformanceMonitor.tick();
    }
    
    updateEffects(delta) {
        // Mettre à jour les particules, ombres, etc.
        if (this.player) {
            // Effet de respiration/pulsation
            const scale = 1 + Math.sin(Date.now() * 0.001) * 0.02;
            this.player.scale.setScalar(scale);
        }
    }
    
    checkLowEndDevice() {
        // Détection d'appareil bas de gamme
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) return true;
        
        const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const gpu = gl.getParameter(gl.RENDERER);
        
        return maxSize < 4096 || /mali|adreno|powerVR/i.test(gpu) && 
               /300|400|500|t6|t7/i.test(gpu);
    }
    
    setupVisibilityHandler() {
        // Gérer la pause quand l'app n'est pas visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
    }
    
    pauseGame() {
        // Sauvegarder automatiquement
        SaveManager.autoSave();
        
        // Économiser la batterie
        this.renderer.setAnimationLoop(null);
    }
    
    resumeGame() {
        this.renderer.setAnimationLoop(() => this.animate());
    }
    
    optimizeModels() {
        // Simplifier les géométries pour mobile
        this.scene.traverse((child) => {
            if (child.isMesh) {
                // Réduire le nombre de polygones si nécessaire
                if (child.geometry && child.geometry.attributes.position.count > 5000) {
                    this.simplifyGeometry(child);
                }
                
                // Textures de basse résolution sur mobile bas de gamme
                if (this.isLowEnd && child.material && child.material.map) {
                    child.material.map.minFilter = THREE.LinearFilter;
                }
            }
        });
    }
    
    simplifyGeometry(mesh) {
        // Simplification basique (à remplacer par un vrai algorithme si besoin)
        if (mesh.geometry.index) {
            mesh.geometry = mesh.geometry.toNonIndexed();
        }
    }
    
    useFallbackModels() {
        // Modèles de fallback géométriques basiques
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x6d28d9 });
        this.player = new THREE.Mesh(geometry, material);
        this.scene.add(this.player);
    }
}

// Initialiser quand la page est prête
window.addEventListener('load', () => {
    window.game = new ThreeJSApp();
});
```

---

## **📱 SYSTÈME D'ÉVOLUTION POUR MOBILE (evolution-system.js)**

```javascript
class EvolutionSystem {
    constructor() {
        this.rank = 'E';
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        
        this.stats = {
            strength: 10,
            agility: 10,
            endurance: 10,
            intelligence: 10,
            perception: 10,
            charisma: 10,
            availablePoints: 0
        };
        
        this.skills = {
            active: [],
            passive: []
        };
        
        this.loadFromSave();
    }
    
    gainExp(amount) {
        this.exp += amount;
        
        // Notification visuelle
        UI.Notifications.showExpGain(amount);
        
        // Vérifier le niveau
        while (this.exp >= this.expToNext) {
            this.levelUp();
        }
        
        this.save();
    }
    
    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = Math.floor(this.expToNext * 1.5);
        
        // Points de stats
        this.stats.availablePoints += 5;
        
        // Vérifier l'évolution de rang
        this.checkRankUp();
        
        // Effets visuels
        this.playLevelUpEffects();
        
        // Notification
        UI.Notifications.show(`Niveau ${this.level} atteint!`, 'levelup');
        
        // Sauvegarder
        this.save();
        
        // Mettre à jour l'UI
        UI.EvolutionUI.update();
    }
    
    checkRankUp() {
        const rankThresholds = {
            'E': 1,
            'D': 10,
            'C': 25,
            'B': 40,
            'A': 60,
            'S': 80,
            'SS': 100,
            'SSS': 120
        };
        
        const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        const currentRankIndex = rankOrder.indexOf(this.rank);
        
        for (let i = currentRankIndex + 1; i < rankOrder.length; i++) {
            const targetRank = rankOrder[i];
            if (this.level >= rankThresholds[targetRank]) {
                this.evolveToRank(targetRank);
                break;
            }
        }
    }
    
    evolveToRank(newRank) {
        const oldRank = this.rank;
        this.rank = newRank;
        
        // Effets spéciaux selon le rang
        const rankEffects = {
            'D': () => this.unlockShadowExtraction(),
            'B': () => this.unlockShadowArmy(),
            'A': () => this.unlockEvolutionUI(),
            'S': () => this.unlockShadowMonarchPowers()
        };
        
        if (rankEffects[newRank]) {
            rankEffects[newRank]();
        }
        
        // Animation d'évolution
        this.playEvolutionAnimation(oldRank, newRank);
        
        // Notification
        UI.Notifications.show(`Évolution au rang ${newRank}!`, 'evolution');
        
        // Débloquer de nouvelles interfaces
        UI.EvolutionUI.unlockNewFeatures(newRank);
    }
    
    unlockShadowExtraction() {
        // Débloquer la capacité d'extraire des soldats d'ombre
        CombatSystem.enableExtraction = true;
        UI.SkillsUI.addSkill('Extraction', 'Passive', 'Extraire l\'âme des ennemis vaincus');
    }
    
    unlockShadowArmy() {
        // Débloquer l'armée d'ombre
        ShadowArmySystem.unlock();
        UI.ArmyUI.unlock();
    }
    
    unlockEvolutionUI() {
        // Interface d'évolution complète
        UI.EvolutionUI.unlockAdvancedFeatures();
    }
    
    unlockShadowMonarchPowers() {
        // Pouvoirs de Monarque de l'Ombre
        CombatSystem.unlockUltimateSkills();
        ShadowArmySystem.increaseCapacity(100);
    }
    
    allocateStat(stat, points = 1) {
        if (this.stats.availablePoints >= points) {
            this.stats[stat] += points;
            this.stats.availablePoints -= points;
            
            // Appliquer les bonus
            this.applyStatBonuses(stat, points);
            
            // Sauvegarder
            this.save();
            
            return true;
        }
        return false;
    }
    
    applyStatBonuses(stat, points) {
        const bonuses = {
            strength: () => CombatSystem.updateDamage(1.1 * points),
            agility: () => CombatSystem.updateAttackSpeed(0.05 * points),
            endurance: () => Player.updateMaxHealth(10 * points),
            intelligence: () => Player.updateMaxMana(5 * points),
            charisma: () => ShadowArmySystem.updateSoldierLimit(2 * points)
        };
        
        if (bonuses[stat]) bonuses[stat]();
    }
    
    playLevelUpEffects() {
        // Effets Three.js
        if (window.game && window.game.player) {
            const particles = this.createLevelUpParticles();
            window.game.scene.add(particles);
            
            // Animation de scale
            const originalScale = window.game.player.scale.clone();
            window.game.player.scale.multiplyScalar(1.2);
            
            setTimeout(() => {
                window.game.player.scale.copy(originalScale);
            }, 300);
        }
        
        // Son
        AudioManager.play('levelup');
        
        // Vibration (si supporté)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
    
    createLevelUpParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 100;
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2;
            positions[i + 1] = Math.random() * 3;
            positions[i + 2] = (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00f3ff,
            size: 0.1,
            transparent: true
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.position.copy(window.game.player.position);
        
        // Animation
        const animate = () => {
            particles.position.y += 0.05;
            particles.material.opacity -= 0.02;
            
            if (particles.material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(particles);
            }
        };
        
        animate();
        
        return particles;
    }
    
    playEvolutionAnimation(oldRank, newRank) {
        // Animation d'évolution spectaculaire
        const colors = {
            'E': 0x666666,
            'D': 0x00aaff,
            'C': 0x00ff88,
            'B': 0xffaa00,
            'A': 0xff5500,
            'S': 0xff0066,
            'SS': 0xaa00ff,
            'SSS': 0xffffff
        };
        
        const oldColor = colors[oldRank];
        const newColor = colors[newRank];
        
        // Flash de couleur
        if (window.game && window.game.player) {
            const flashMaterial = new THREE.MeshBasicMaterial({
                color: newColor,
                transparent: true,
                opacity: 0.5
            });
            
            const originalMaterials = [];
            window.game.player.traverse((child) => {
                if (child.isMesh) {
                    originalMaterials.push(child.material);
                    child.material = flashMaterial;
                }
            });
            
            // Restaurer après animation
            setTimeout(() => {
                window.game.player.traverse((child, i) => {
                    if (child.isMesh) {
                        child.material = originalMaterials[i];
                    }
                });
            }, 1000);
        }
        
        // Effets de particules
        this.createEvolutionParticles(newColor);
        
        // Son d'évolution
        AudioManager.play('evolution');
        
        // Vibration longue
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }
    }
    
    createEvolutionParticles(color) {
        // Système de particules pour l'évolution
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colorsArray = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            // Position aléatoire en sphère
            const radius = 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.cos(phi);
            positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Couleur
            const rgb = new THREE.Color(color);
            colorsArray[i] = rgb.r;
            colorsArray[i + 1] = rgb.g;
            colorsArray[i + 2] = rgb.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 1
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.position.copy(window.game.player.position);
        window.game.scene.add(particles);
        
        // Animation d'expansion
        let scale = 1;
        const animate = () => {
            scale += 0.1;
            particles.scale.setScalar(scale);
            material.opacity -= 0.02;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(particles);
            }
        };
        
        animate();
    }
    
    save() {
        const data = {
            rank: this.rank,
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            stats: this.stats,
            skills: this.skills,
            timestamp: Date.now()
        };
        
        SaveManager.save('evolution', data);
    }
    
    loadFromSave() {
        const data = SaveManager.load('evolution');
        if (data) {
            Object.assign(this, data);
            
            // S'assurer que les propriétés existent
            this.stats = data.stats || this.stats;
            this.skills = data.skills || this.skills;
            
            console.log('Chargement évolution:', this.rank, 'Niveau', this.level);
        }
    }
    
    getRankMultiplier() {
        const multipliers = {
            'E': 1.0,
            'D': 1.5,
            'C': 2.0,
            'B': 3.0,
            'A': 5.0,
            'S': 8.0,
            'SS': 12.0,
            'SSS': 20.0
        };
        return multipliers[this.rank] || 1.0;
    }
    
    getRankColor() {
        const colors = {
            'E': '#666666',
            'D': '#00aaff',
            'C': '#00ff88',
            'B': '#ffaa00',
            'A': '#ff5500',
            'S': '#ff0066',
            'SS': '#aa00ff',
            'SSS': '#ffffff'
        };
        return colors[this.rank] || '#666666';
    }
}

// Singleton global
window.EvolutionSystem = new EvolutionSystem();
```

---

## **🎮 SYSTÈME DE COMBAT MOBILE (combat-system.js)**

```javascript
class CombatSystem {
    constructor() {
        this.enableExtraction = false;
        this.skills = {};
        this.cooldowns = new Map();
        
        this.initSkills();
        this.setupTouchGestures();
    }
    
    initSkills() {
        // Compétences de base
        this.skills = {
            1: { 
                name: 'Slash', 
                damage: 15, 
                cooldown: 1, 
                mana: 5,
                type: 'physical',
                gesture: 'tap'
            },
            2: { 
                name: 'Shield', 
                damage: 0, 
                cooldown: 3, 
                mana: 10,
                type: 'defensive',
                gesture: 'swipe_up'
            },
            3: { 
                name: 'Fireball', 
                damage: 25, 
                cooldown: 2, 
                mana: 15,
                type: 'magic',
                gesture: 'swipe_right'
            },
            4: { 
                name: 'Dash', 
                damage: 0, 
                cooldown: 2, 
                mana: 8,
                type: 'movement',
                gesture: 'swipe_left'
            },
            ult: { 
                name: 'Shadow Extraction', 
                damage: 50, 
                cooldown: 10, 
                mana: 30,
                type: 'ultimate',
                gesture: 'pinch',
                requirement: 'rank_D'
            }
        };
    }
    
    setupTouchGestures() {
        const canvas = document.getElementById('game-canvas');
        const hammer = new Hammer(canvas);
        
        // Gestes de combat
        hammer.on('tap', (e) => {
            if (this.canUseSkill(1)) {
                this.useSkill(1, e.center);
            }
        });
        
        hammer.on('swipeup', (e) => {
            if (this.canUseSkill(2)) {
                this.useSkill(2, e.center);
            }
        });
        
        hammer.on('swiperight', (e) => {
            if (this.canUseSkill(3)) {
                this.useSkill(3, e.center);
            }
        });
        
        hammer.on('swipeleft', (e) => {
            if (this.canUseSkill(4)) {
                this.useSkill(4, e.center);
            }
        });
        
        hammer.on('pinch', (e) => {
            if (this.canUseSkill('ult')) {
                this.useSkill('ult', e.center);
            }
        });
    }
    
    canUseSkill(skillId) {
        const skill = this.skills[skillId];
        if (!skill) return false;
        
        // Vérifier les prérequis
        if (skill.requirement) {
            if (skill.requirement === 'rank_D' && EvolutionSystem.rank !== 'D') {
                return false;
            }
        }
        
        // Vérifier le cooldown
        if (this.cooldowns.has(skillId)) {
            const remaining = this.cooldowns.get(skillId) - Date.now();
            if (remaining > 0) return false;
        }
        
        // Vérifier le mana
        if (Player.currentMana < skill.mana) return false;
        
        return true;
    }
    
    useSkill(skillId, touchPosition) {
        const skill = this.skills[skillId];
        
        // Appliquer le cooldown
        this.cooldowns.set(skillId, Date.now() + skill.cooldown * 1000);
        
        // Consommer le mana
        Player.useMana(skill.mana);
        
        // Animation
        this.playSkillAnimation(skill, touchPosition);
        
        // Appliquer les effets
        this.applySkillEffects(skill);
        
        // Mettre à jour l'UI des cooldowns
        UI.SkillsUI.updateCooldown(skillId, skill.cooldown);
        
        // Vibrer
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    playSkillAnimation(skill, position) {
        if (!window.game) return;
        
        const screenToWorld = this.screenToWorld(position.x, position.y);
        
        switch (skill.type) {
            case 'physical':
                this.createSlashEffect(screenToWorld);
                break;
            case 'magic':
                this.createMagicEffect(screenToWorld, skill.name);
                break;
            case 'ultimate':
                this.createUltimateEffect(screenToWorld);
                break;
        }
    }
    
    screenToWorld(screenX, screenY) {
        // Convertir les coordonnées écran en coordonnées monde
        const vector = new THREE.Vector3();
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        
        vector.x = ((screenX - rect.left) / rect.width) * 2 - 1;
        vector.y = -((screenY - rect.top) / rect.height) * 2 + 1;
        vector.z = 0.5;
        
        vector.unproject(window.game.camera);
        
        const dir = vector.sub(window.game.camera.position).normalize();
        const distance = -window.game.camera.position.y / dir.y;
        const pos = window.game.camera.position.clone().add(dir.multiplyScalar(distance));
        
        return pos;
    }
    
    createSlashEffect(position) {
        // Effet visuel de coup
        const geometry = new THREE.PlaneGeometry(2, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const slash = new THREE.Mesh(geometry, material);
        slash.position.copy(position);
        slash.position.y += 1;
        slash.rotation.y = Math.random() * Math.PI * 2;
        
        window.game.scene.add(slash);
        
        // Animation
        let opacity = 0.8;
        const animate = () => {
            opacity -= 0.05;
            material.opacity = opacity;
            slash.scale.multiplyScalar(1.1);
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(slash);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
    
    createMagicEffect(position, type) {
        // Effet magique
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2;
            positions[i + 1] = Math.random() * 2;
            positions[i + 2] = (Math.random() - 0.5) * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const color = type === 'Fireball' ? 0xff5500 : 0x00aaff;
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.position.copy(position);
        
        window.game.scene.add(particles);
        
        // Animation
        let life = 1.0;
        const animate = () => {
            life -= 0.03;
            material.opacity = life;
            particles.position.y += 0.1;
            
            if (life > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
    
    createUltimateEffect(position) {
        // Effet d'extraction d'ombre
        const rings = 5;
        
        for (let i = 0; i < rings; i++) {
            setTimeout(() => {
                this.createShadowRing(position, i);
            }, i * 200);
        }
        
        // Son
        AudioManager.play('extraction');
    }
    
    createShadowRing(position, ringIndex) {
        const segments = 32;
        const geometry = new THREE.RingGeometry(1, 1.2, segments);
        const material = new THREE.MeshBasicMaterial({
            color: 0x6d28d9,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(geometry, material);
        ring.position.copy(position);
        ring.position.y = 0.5;
        ring.rotation.x = Math.PI / 2;
        
        window.game.scene.add(ring);
        
        // Animation
        let scale = 0.1;
        let opacity = 0.7;
        
        const animate = () => {
            scale += 0.1;
            opacity -= 0.02;
            
            ring.scale.setScalar(scale);
            material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                window.game.scene.remove(ring);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
    
    applySkillEffects(skill) {
        // Dégâts aux ennemis proches
        if (skill.damage > 0) {
            this.damageNearbyEnemies(skill.damage, skill.type);
        }
        
        // Effets spéciaux
        switch (skill.name) {
            case 'Shield':
                Player.addShield(30);
                break;
            case 'Dash':
                Player.dash();
                break;
            case 'Shadow Extraction':
                if (this.enableExtraction) {
                    this.attemptExtraction();
                }
                break;
        }
    }
    
    damageNearbyEnemies(baseDamage, type) {
        const multiplier = EvolutionSystem.getRankMultiplier();
        const damage = baseDamage * multiplier;
        
        // Vérifier les ennemis dans un rayon
        if (window.game && window.game.enemies) {
            window.game.enemies.forEach(enemy => {
                const distance = enemy.position.distanceTo(window.game.player.position);
                if (distance < 5) {
                    enemy.takeDamage(damage, type);
                }
            });
        }
    }
    
    attemptExtraction() {
        // Tenter d'extraire un soldat d'ombre d'un ennemi vaincu
        if (window.game && window.game.enemies) {
            const nearbyEnemies = window.game.enemies.filter(e => 
                e.position.distanceTo(window.game.player.position) < 3 && 
                e.health <= 0
            );
            
            if (nearbyEnemies.length > 0) {
                const enemy = nearbyEnemies[0];
                ShadowArmySystem.extractSoldier(enemy);
            }
        }
    }
    
    updateDamage(multiplier) {
        // Mettre à jour les dégâts basés sur les stats
        Object.values(this.skills).forEach(skill => {
            if (skill.damage) {
                skill.damage *= multiplier;
            }
        });
    }
    
    updateAttackSpeed(multiplier) {
        // Réduire les cooldowns
        Object.values(this.skills).forEach(skill => {
            skill.cooldown = Math.max(0.5, skill.cooldown * (1 - multiplier));
        });
    }
    
    unlockUltimateSkills() {
        // Débloquer des compétences ultimes au rang S
        this.skults = {
            'shadow_army': {
                name: 'Army of Shadows',
                damage: 100,
                cooldown: 30,
                mana: 50,
                type: 'summon'
            },
            'monarchs_wrath': {
                name: 'Monarch\'s Wrath',
                damage: 200,
                cooldown: 60,
                mana: 100,
                type: 'aoe'
            }
        };
    }
}

window.CombatSystem = new CombatSystem();
```

---

## **💾 SYSTÈME DE SAUVEGARDE MOBILE (save-manager.js)**

```javascript
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
```

---

## **🎨 CSS POUR MOBILE (style.css)**

```css
/* Reset mobile */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
}

body {
    overflow: hidden;
    background: #0a0a12;
    font-family: 'Rajdhani', sans-serif;
    color: #fff;
    touch-action: manipulation;
}

#game-container {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

#game-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

/* UI Overlay */
#ui-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

/* HUD */
.hud-top {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    pointer-events: none;
}

.health-bar, .mana-bar {
    width: 100%;
    height: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #333;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
}

.health-fill {
    height: 100%;
    background: linear-gradient(90deg, #ef4444, #f87171);
    border-radius: 8px;
    transition: width 0.3s ease;
}

.mana-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 8px;
    transition: width 0.3s ease;
}

.health-text, .mana-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
    text-shadow: 1px 1px 2px black;
}

/* Contrôles tactiles */
.touch-controls {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    pointer-events: auto;
}

.joystick-area {
    width: 120px;
    height: 120px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    border: 2px solid rgba(109, 40, 217, 0.7);
    position: relative;
    touch-action: none;
}

.joystick-base {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.joystick-thumb {
    width: 50px;
    height: 50px;
    background: rgba(109, 40, 217, 0.9);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skill-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #6d28d9;
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    touch-action: manipulation;
}

.skill-btn:active {
    transform: scale(0.9);
    background: rgba(109, 40, 217, 0.5);
}

.skill-btn.special {
    border-color: #00f3ff;
    background: rgba(0, 243, 255, 0.1);
}

/* UI Buttons */
.ui-buttons {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: auto;
}

.ui-btn {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid #6d28d9;
    color: white;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.ui-btn:active {
    background: rgba(109, 40, 217, 0.5);
}

/* Interface d'évolution */
.fullscreen-ui {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 10, 18, 0.95);
    backdrop-filter: blur(10px);
    display: none;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
    pointer-events: auto;
}

.fullscreen-ui.active {
    display: flex;
}

.evolution-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #6d28d9;
}

.evolution-title {
    font-size: 24px;
    color: #00f3ff;
    font-family: 'Orbitron', sans-serif;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
}

.rank-display {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
}

.rank-icon {
    font-size: 48px;
    padding: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0a0a12, #1a1a2e);
    border: 3px solid;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { box-shadow: 0 0 10px currentColor; }
    50% { box-shadow: 0 0 20px currentColor; }
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 20px 0;
}

.stat-item {
    background: rgba(26, 26, 46, 0.7);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-name {
    color: #a5a5a5;
}

.stat-value {
    color: white;
    font-weight: bold;
}

.stat-upgrade {
    background: #6d28d9;
    border: none;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

/* Responsive */
@media (orientation: portrait) {
    .touch-controls {
        flex-direction: column-reverse;
        align-items: center;
        gap: 20px;
    }
    
    .action-buttons {
        flex-direction: row;
        gap: 15px;
    }
    
    .ui-buttons {
        flex-direction: row;
        top: auto;
        bottom: 200px;
        right: 50%;
        transform: translateX(50%);
    }
}

@media (max-width: 480px) {
    .skill-btn {
        width: 50px;
        height: 50px;
        font-size: 20px;
    }
    
    .ui-btn {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
}

/* Chargement */
#loading-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0a0a12;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loader {
    width: 60px;
    height: 60px;
    border: 5px solid #333;
    border-top: 5px solid #6d28d9;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## **📱 MANIFEST PWA (manifest.json)**

```json
{
  "name": "Shadow Monarch Ascension",
  "short_name": "ShadowMonarch",
  "description": "RPG d'évolution Solo Leveling sur mobile",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a12",
  "theme_color": "#6d28d9",
  "orientation": "landscape",
  "icons": [
    {
      "src": "assets/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "prefer_related_applications": false,
  "related_applications": []
}
```

---

## **⚡ SERVICE WORKER (service-worker.js)**

```javascript
const CACHE_NAME = 'shadow-monarch-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/ui-evolution.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/three-app.js',
  '/js/game-systems/evolution-system.js',
  '/js/game-systems/combat-system.js',
  '/js/ui/touch-controls.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Gérer les sauvegardes hors ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-save') {
    event.waitUntil(syncSaves());
  }
});

async function syncSaves() {
  // Synchroniser les sauvegardes quand la connexion revient
  const saves = await getOfflineSaves();
  
  for (const save of saves) {
    try {
      await uploadSave(save);
      await removeOfflineSave(save.id);
    } catch (error) {
      console.error('Erreur sync:', error);
    }
  }
}
```

---

## **🎯 DÉPLOIEMENT MOBILE**

### **Options de distribution :**

1. **PWA (Progressive Web App)**
   ```
   Avantages: Pas d'App Store, mises à jour instantanées
   Installation: Ajouter à l'écran d'accueil
   Limitations: Pas sur iOS App Store
   ```

2. **Cordova/PhoneGap**
   ```
   Avantages: Package natif, accès aux APIs mobile
   Distribution: App Store & Google Play
   ```

3. **Web pur**
   ```
   Avantages: Simple, pas de compilation
   Accès: Navigateur mobile
   ```

### **Optimisations pour mobile :**

1. **Compression des assets**
   ```bash
   # GlTF optimisé
   gltf-pipeline -i model.glb -o model-optimized.glb --draco.compress

   # Textures
   convert texture.png -resize 1024x1024 texture-optimized.png
   ```

2. **Chargement progressif**
   ```javascript
   // Lazy loading des assets
   const loader = new THREE.LazyLoader();
   loader.loadLowPolyFirst();
   ```

3. **Adaptation au réseau**
   ```javascript
   // Détection de connexion lente
   if (navigator.connection) {
     const speed = navigator.connection.downlink;
     if (speed < 1) {
       // Charger assets basse qualité
     }
   }
   ```

---

## **📊 PERFORMANCE MOBILE**

### **Target FPS :**
- Haut de gamme: 60 FPS
- Milieu de gamme: 30-45 FPS
- Bas de gamme: 30 FPS avec réduction qualité

### **Indicateurs d'optimisation :**
```javascript
class PerformanceMonitor {
    static metrics = {
        fps: 0,
        drawCalls: 0,
        triangles: 0,
        memory: 0
    };
    
    static check() {
        if (this.metrics.fps < 30) {
            this.enableLowQualityMode();
        }
        
        if (this.metrics.memory > 500) {
            this.cleanupMemory();
        }
    }
    
    static enableLowQualityMode() {
        // Réduire la qualité
        window.game.renderer.setPixelRatio(1);
        window.game.scene.traverse(child => {
            if (child.isMesh) {
                child.material = this.createLowQualityMaterial();
            }
        });
    }
}
```

---

## **🚀 PROCHAINES ÉTAPES**

1. **Prototype minimal :**
   - Three.js avec modèle joueur simple
   - Joystick virtuel fonctionnel
   - Interface d'évolution basique

2. **Système de combat :**
   - 3 compétences de base
   - 2 types d'ennemis
   - Extraction d'ombre au rang D

3. **Progression :**
   - 5 niveaux d'évolution (E → D → C → B → A)
   - 10 soldats d'ombre maximum

4. **Polissage mobile :**
   - UI tactile optimisée
   - Performance sur vieux devices
   - Sauvegarde cloud optionnelle

---

**Ce système complet fonctionne 100% localement**, avec Three.js pour la 3D mobile, et s'installe comme une PWA. L'accent est mis sur les **contrôles tactiles**, l'**interface adaptative** et les **performances mobile**.
