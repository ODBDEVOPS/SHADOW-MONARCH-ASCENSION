
class VirtualJoystick {
    constructor(options) {
        this.container = options.container || document.body;
        this.onMove = options.onMove || (() => {});
        this.onEnd = options.onEnd || (() => {});
        
        this.isActive = false;
        this.position = { x: 0, y: 0 };
        this.vector = { x: 0, y: 0 };
        this.maxDistance = 50;
        this.deadZone = 5;
        
        this.baseElement = null;
        this.thumbElement = null;
        
        this.init();
    }
    
    init() {
        this.createElements();
        this.setupEventListeners();
    }
    
    createElements() {
        // Base du joystick
        this.baseElement = this.container.querySelector('.joystick-base');
        this.thumbElement = this.container.querySelector('.joystick-thumb');
        
        if (!this.baseElement || !this.thumbElement) {
            console.warn('Éléments joystick non trouvés, création dynamique');
            this.createDynamicElements();
        }
        
        this.centerPosition = this.getCenterPosition();
    }
    
    createDynamicElements() {
        this.baseElement = document.createElement('div');
        this.baseElement.className = 'joystick-base';
        this.baseElement.style.cssText = `
            position: absolute;
            width: 120px;
            height: 120px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            border: 2px solid rgba(109, 40, 217, 0.7);
            pointer-events: none;
        `;
        
        this.thumbElement = document.createElement('div');
        this.thumbElement.className = 'joystick-thumb';
        this.thumbElement.style.cssText = `
            position: absolute;
            width: 50px;
            height: 50px;
            background: rgba(109, 40, 217, 0.9);
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            pointer-events: none;
            transform: translate(-50%, -50%);
        `;
        
        this.container.appendChild(this.baseElement);
        this.container.appendChild(this.thumbElement);
    }
    
    getCenterPosition() {
        const rect = this.container.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    setupEventListeners() {
        // Événements tactiles
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
        this.container.addEventListener('touchcancel', this.onTouchEnd.bind(this));
        
        // Événements souris (pour le débogage)
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        
        // Empêcher le menu contextuel sur mobile
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.start(touch.clientX, touch.clientY);
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0 && this.isActive) {
            const touch = e.touches[0];
            this.move(touch.clientX, touch.clientY);
        }
    }
    
    onTouchEnd(e) {
        e.preventDefault();
        this.end();
    }
    
    onMouseDown(e) {
        e.preventDefault();
        this.start(e.clientX, e.clientY);
    }
    
    onMouseMove(e) {
        if (this.isActive) {
            this.move(e.clientX, e.clientY);
        }
    }
    
    onMouseUp(e) {
        this.end();
    }
    
    start(x, y) {
        this.isActive = true;
        this.centerPosition = this.getCenterPosition();
        this.updateThumbPosition(x, y);
        
        // Animation d'activation
        this.baseElement.style.background = 'rgba(109, 40, 217, 0.3)';
        this.thumbElement.style.background = 'rgba(109, 40, 217, 1)';
        
        // Vibrer légèrement
        if (navigator.vibrate) navigator.vibrate(10);
    }
    
    move(x, y) {
        if (!this.isActive) return;
        
        // Calculer le vecteur de déplacement
        const dx = x - this.centerPosition.x;
        const dy = y - this.centerPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Limiter la distance
        const limitedDistance = Math.min(distance, this.maxDistance);
        
        // Normaliser le vecteur
        const angle = Math.atan2(dy, dx);
        this.vector.x = (limitedDistance / this.maxDistance) * Math.cos(angle);
        this.vector.y = (limitedDistance / this.maxDistance) * Math.sin(angle);
        
        // Zone morte
        if (Math.abs(this.vector.x) < 0.1 && Math.abs(this.vector.y) < 0.1) {
            this.vector.x = 0;
            this.vector.y = 0;
        }
        
        // Mettre à jour la position du thumb
        const thumbX = this.centerPosition.x + Math.cos(angle) * limitedDistance;
        const thumbY = this.centerPosition.y + Math.sin(angle) * limitedDistance;
        this.updateThumbPosition(thumbX, thumbY);
        
        // Appeler le callback de mouvement
        this.onMove(this.vector);
    }
    
    end() {
        this.isActive = false;
        
        // Réinitialiser le vecteur
        this.vector.x = 0;
        this.vector.y = 0;
        
        // Animer le retour à la position centrale
        this.animateReturnToCenter();
        
        // Rétablir l'apparence
        this.baseElement.style.background = 'rgba(0, 0, 0, 0.5)';
        this.thumbElement.style.background = 'rgba(109, 40, 217, 0.9)';
        
        // Appeler le callback de fin
        this.onEnd();
    }
    
    updateThumbPosition(x, y) {
        const rect = this.container.getBoundingClientRect();
        const thumbX = x - rect.left;
        const thumbY = y - rect.top;
        
        this.thumbElement.style.left = `${thumbX}px`;
        this.thumbElement.style.top = `${thumbY}px`;
    }
    
    animateReturnToCenter() {
        const startX = parseFloat(this.thumbElement.style.left);
        const startY = parseFloat(this.thumbElement.style.top);
        const centerX = this.container.clientWidth / 2;
        const centerY = this.container.clientHeight / 2;
        
        const duration = 200; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentX = startX + (centerX - startX) * easeProgress;
            const currentY = startY + (centerY - startY) * easeProgress;
            
            this.thumbElement.style.left = `${currentX}px`;
            this.thumbElement.style.top = `${currentY}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    destroy() {
        // Nettoyer les événements
        this.container.removeEventListener('touchstart', this.onTouchStart);
        this.container.removeEventListener('touchmove', this.onTouchMove);
        this.container.removeEventListener('touchend', this.onTouchEnd);
        this.container.removeEventListener('touchcancel', this.onTouchEnd);
        
        // Nettoyer les éléments
        if (this.baseElement && this.baseElement.parentNode) {
            this.baseElement.parentNode.removeChild(this.baseElement);
        }
        if (this.thumbElement && this.thumbElement.parentNode) {
            this.thumbElement.parentNode.removeChild(this.thumbElement);
        }
    }
}

// Gestionnaire de gestes tactiles avancés
class TouchGestureManager {
    constructor() {
        this.gestures = new Map();
        this.activeGestures = new Set();
        this.setupHammer();
    }
    
    setupHammer() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        this.hammer = new Hammer(canvas, {
            recognizers: [
                [Hammer.Tap, { event: 'doubletap', taps: 2 }],
                [Hammer.Press, { time: 500 }],
                [Hammer.Pinch, { enable: true }],
                [Hammer.Rotate, { enable: true }],
                [Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }],
                [Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 0 }]
            ]
        });
        
        // Configurer les gestes
        this.hammer.get('doubletap').recognizeWith('tap');
        this.hammer.get('tap').requireFailure('doubletap');
        
        this.setupGestureCallbacks();
    }
    
    setupGestureCallbacks() {
        // Tap simple
        this.hammer.on('tap', (e) => {
            this.triggerGesture('tap', e);
        });
        
        // Double tap
        this.hammer.on('doubletap', (e) => {
            this.triggerGesture('doubletap', e);
        });
        
        // Press
        this.hammer.on('press', (e) => {
            this.triggerGesture('press', e);
        });
        
        // Swipe
        this.hammer.on('swipe', (e) => {
            const direction = this.getSwipeDirection(e);
            this.triggerGesture(`swipe_${direction}`, e);
        });
        
        // Pinch
        this.hammer.on('pinchstart', (e) => {
            this.triggerGesture('pinch_start', e);
        });
        
        this.hammer.on('pinchmove', (e) => {
            this.triggerGesture('pinch', e);
        });
        
        this.hammer.on('pinchend', (e) => {
            this.triggerGesture('pinch_end', e);
        });
        
        // Rotate
        this.hammer.on('rotatestart', (e) => {
            this.triggerGesture('rotate_start', e);
        });
        
        this.hammer.on('rotatemove', (e) => {
            this.triggerGesture('rotate', e);
        });
        
        this.hammer.on('rotateend', (e) => {
            this.triggerGesture('rotate_end', e);
        });
    }
    
    getSwipeDirection(e) {
        const angle = e.angle;
        if (angle > -45 && angle <= 45) return 'right';
        if (angle > 45 && angle <= 135) return 'down';
        if (angle > 135 || angle <= -135) return 'left';
        return 'up';
    }
    
    registerGesture(name, callback) {
        this.gestures.set(name, callback);
    }
    
    triggerGesture(name, event) {
        const callback = this.gestures.get(name);
        if (callback) {
            callback(event);
            return true;
        }
        return false;
    }
    
    // Gestes pour l'interface d'évolution
    setupEvolutionGestures() {
        this.registerGesture('swipe_up', () => {
            // Glisser vers le haut pour monter de niveau
            if (UI.EvolutionUI.isVisible()) {
                EvolutionSystem.levelUp();
            }
        });
        
        this.registerGesture('swipe_down', () => {
            // Glisser vers le bas pour voir les stats détaillées
            if (UI.EvolutionUI.isVisible()) {
                UI.EvolutionUI.showDetailedStats();
            }
        });
        
        this.registerGesture('pinch', (e) => {
            // Pinch pour zoomer dans l'interface d'évolution
            if (UI.EvolutionUI.isVisible()) {
                UI.EvolutionUI.zoom(e.scale);
            }
        });
        
        this.registerGesture('doubletap', (e) => {
            // Double tap pour utiliser tous les points disponibles
            if (UI.EvolutionUI.isVisible()) {
                UI.EvolutionUI.autoAllocate();
            }
        });
    }
    
    // Gestes pour le combat
    setupCombatGestures() {
        // Gestes déjà gérés par CombatSystem
        // Ici on peut ajouter des gestes avancés
        this.registerGesture('swipe_left_then_right', () => {
            // Gesture spécial: balayage gauche puis droite
            CombatSystem.useSpecialCombo('dash_attack');
        });
        
        this.registerGesture('rotate_clockwise', () => {
            // Rotation horaire pour une compétence circulaire
            CombatSystem.useAOEAbility();
        });
    }
    
    destroy() {
        if (this.hammer) {
            this.hammer.destroy();
        }
    }
}

// Gestionnaire de boutons tactiles avancés
class TouchButtonManager {
    constructor() {
        this.buttons = new Map();
        this.longPressTimers = new Map();
        this.setupButtonBehaviors();
    }
    
    setupButtonBehaviors() {
        // Boutons de compétences
        document.querySelectorAll('.skill-btn').forEach(btn => {
            this.setupSkillButton(btn);
        });
        
        // Boutons d'interface
        document.querySelectorAll('.ui-btn').forEach(btn => {
            this.setupUIButton(btn);
        });
    }
    
    setupSkillButton(button) {
        const skillId = button.dataset.skill;
        
        // Touch start
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Effet visuel
            button.style.transform = 'scale(0.9)';
            button.style.opacity = '0.8';
            
            // Timer pour le long press
            const timer = setTimeout(() => {
                this.onSkillLongPress(skillId, button);
            }, 1000);
            
            this.longPressTimers.set(button, timer);
            
            // Vibration courte
            if (navigator.vibrate) navigator.vibrate(20);
        });
        
        // Touch end
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Annuler le long press
            const timer = this.longPressTimers.get(button);
            if (timer) {
                clearTimeout(timer);
                this.longPressTimers.delete(button);
            }
            
            // Restaurer l'apparence
            button.style.transform = '';
            button.style.opacity = '';
            
            // Utiliser la compétence (si pas de long press)
            if (!button.classList.contains('long-press')) {
                CombatSystem.useSkill(skillId, { 
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY 
                });
            }
            
            button.classList.remove('long-press');
        });
        
        // Touch cancel
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            
            const timer = this.longPressTimers.get(button);
            if (timer) {
                clearTimeout(timer);
                this.longPressTimers.delete(button);
            }
            
            button.style.transform = '';
            button.style.opacity = '';
            button.classList.remove('long-press');
        });
    }
    
    onSkillLongPress(skillId, button) {
        // Marquer comme long press
        button.classList.add('long-press');
        
        // Afficher les infos de la compétence
        this.showSkillInfo(skillId, button);
        
        // Vibration de confirmation
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    
    showSkillInfo(skillId, button) {
        const skill = CombatSystem.skills[skillId];
        if (!skill) return;
        
        // Créer une infobulle
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.innerHTML = `
            <h4>${skill.name}</h4>
            <p>Dégâts: ${skill.damage || 0}</p>
            <p>Cooldown: ${skill.cooldown}s</p>
            <p>Mana: ${skill.mana || 0}</p>
            <p>${skill.description || ''}</p>
        `;
        
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(10, 10, 18, 0.95);
            border: 2px solid #6d28d9;
            border-radius: 10px;
            padding: 10px;
            color: white;
            z-index: 10000;
            max-width: 200px;
            pointer-events: none;
        `;
        
        // Positionner près du bouton
        const rect = button.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;
        
        document.body.appendChild(tooltip);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 3000);
    }
    
    setupUIButton(button) {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95)';
            button.style.background = 'rgba(109, 40, 217, 0.7)';
            
            if (navigator.vibrate) navigator.vibrate(10);
        });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = '';
            button.style.background = '';
        });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            button.style.transform = '';
            button.style.background = '';
        });
    }
    
    // Gestion des cooldowns visuels
    updateCooldownVisuals() {
        document.querySelectorAll('.skill-btn').forEach(btn => {
            const skillId = btn.dataset.skill;
            const cooldownEnd = CombatSystem.cooldowns.get(skillId);
            
            if (cooldownEnd) {
                const remaining = cooldownEnd - Date.now();
                if (remaining > 0) {
                    // Afficher le cooldown
                    const percentage = (remaining / (CombatSystem.skills[skillId].cooldown * 1000)) * 100;
                    btn.style.background = `conic-gradient(
                        #333 0% ${percentage}%, 
                        #6d28d9 ${percentage}% 100%
                    )`;
                    btn.disabled = true;
                } else {
                    btn.style.background = '';
                    btn.disabled = false;
                }
            }
        });
    }
    
    destroy() {
        // Nettoyer les timers
        this.longPressTimers.forEach(timer => clearTimeout(timer));
        this.longPressTimers.clear();
    }
}

// Classe principale pour gérer tous les contrôles
class InputManager {
    constructor() {
        this.joystick = null;
        this.gestureManager = null;
        this.buttonManager = null;
        
        this.init();
    }
    
    init() {
        // Créer le joystick
        const joystickArea = document.getElementById('move-joystick');
        if (joystickArea) {
            this.joystick = new VirtualJoystick({
                container: joystickArea,
                onMove: (vector) => this.onJoystickMove(vector),
                onEnd: () => this.onJoystickEnd()
            });
        }
        
        // Créer le gestionnaire de gestes
        this.gestureManager = new TouchGestureManager();
        
        // Créer le gestionnaire de boutons
        this.buttonManager = new TouchButtonManager();
        
        // Configurer les gestes spécifiques
        this.setupCustomGestures();
        
        // Détection d'appareil et ajustements
        this.adaptToDevice();
    }
    
    onJoystickMove(vector) {
        // Transmettre le mouvement au joueur
        if (window.game && window.game.player) {
            // Logique de déplacement (gérée dans ThreeJSApp)
            // On envoie juste le vecteur
            window.game.handlePlayerMovement(vector);
        }
    }
    
    onJoystickEnd() {
        // Arrêter le mouvement du joueur
        if (window.game && window.game.player) {
            window.game.handlePlayerMovement({ x: 0, y: 0 });
        }
    }
    
    setupCustomGestures() {
        // Gestes pour l'évolution
        this.gestureManager.setupEvolutionGestures();
        
        // Gestes pour le combat
        this.gestureManager.setupCombatGestures();
        
        // Gestes globaux
        this.gestureManager.registerGesture('doubletap', () => {
            // Double tap n'importe où pour verrouiller/déverrouiller la cible
            CombatSystem.toggleTargetLock();
        });
        
        this.gestureManager.registerGesture('swipe_down_with_two_fingers', () => {
            // Glisser vers le bas avec deux doigts pour ouvrir le menu rapide
            UI.showQuickMenu();
        });
    }
    
    adaptToDevice() {
        // Détection du type d'appareil
        const isTablet = window.innerWidth >= 768 && window.innerHeight >= 1024;
        const isSmallPhone = window.innerWidth <= 320;
        
        // Ajuster la taille du joystick
        if (this.joystick && this.joystick.container) {
            if (isTablet) {
                this.joystick.container.style.width = '150px';
                this.joystick.container.style.height = '150px';
                this.joystick.maxDistance = 60;
            } else if (isSmallPhone) {
                this.joystick.container.style.width = '100px';
                this.joystick.container.style.height = '100px';
                this.joystick.maxDistance = 40;
            }
        }
        
        // Ajuster la sensibilité selon l'appareil
        if (window.game && window.game.controls) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isAndroid = /Android/.test(navigator.userAgent);
            
            if (isIOS) {
                // iOS a généralement un écran plus sensible
                this.joystick.deadZone = 3;
            } else if (isAndroid) {
                this.joystick.deadZone = 5;
            }
        }
    }
    
    update() {
        // Mettre à jour les visuels des cooldowns
        if (this.buttonManager) {
            this.buttonManager.updateCooldownVisuals();
        }
    }
    
    pause() {
        // Désactiver temporairement les contrôles
        if (this.joystick) {
            this.joystick.end();
        }
        
        // Marquer tous les boutons comme désactivés
        document.querySelectorAll('.skill-btn, .ui-btn').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
    }
    
    resume() {
        // Réactiver les boutons
        document.querySelectorAll('.skill-btn, .ui-btn').forEach(btn => {
            btn.style.opacity = '';
            btn.style.pointerEvents = '';
        });
    }
    
    destroy() {
        if (this.joystick) {
            this.joystick.destroy();
        }
        
        if (this.gestureManager) {
            this.gestureManager.destroy();
        }
        
        if (this.buttonManager) {
            this.buttonManager.destroy();
        }
    }
}

// Initialiser le gestionnaire d'entrées
window.addEventListener('load', () => {
    window.InputManager = new InputManager();
});
