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
