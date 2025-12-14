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
