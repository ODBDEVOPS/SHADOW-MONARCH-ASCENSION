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
