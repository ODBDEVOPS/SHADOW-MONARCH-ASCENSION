class EvolutionUI {
    constructor() {
        this.isVisible = false;
        this.currentTab = 'stats';
        this.animationInProgress = false;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadRankColors();
    }
    
    createUI() {
        const ui = document.createElement('div');
        ui.id = 'evolution-ui';
        ui.className = 'fullscreen-ui';
        ui.innerHTML = this.getTemplate();
        
        document.getElementById('game-container').appendChild(ui);
    }
    
    getTemplate() {
        return `
            <div class="evolution-container">
                <div class="evolution-header">
                    <div class="evolution-title">
                        <h2>📊 Système d'Évolution</h2>
                        <div class="rank-badge" id="current-rank-badge">Rang E</div>
                    </div>
                    <button class="close-btn">×</button>
                </div>
                
                <div class="evolution-tabs">
                    <button class="tab-btn active" data-tab="stats">📈 Stats</button>
                    <button class="tab-btn" data-tab="skills">⚡ Compétences</button>
                    <button class="tab-btn" data-tab="evolution">🔥 Évolution</button>
                    <button class="tab-btn" data-tab="achievements">🏆 Succès</button>
                </div>
                
                <div class="evolution-content">
                    <!-- Onglet Stats -->
                    <div class="tab-content active" id="tab-stats">
                        <div class="player-summary">
                            <div class="level-display">
                                <div class="level-circle">
                                    <span id="player-level">1</span>
                                </div>
                                <div class="exp-bar">
                                    <div class="exp-fill" id="exp-fill"></div>
                                    <span class="exp-text" id="exp-text">0/100</span>
                                </div>
                            </div>
                            
                            <div class="rank-progression">
                                <div class="rank-steps">
                                    ${this.generateRankSteps()}
                                </div>
                            </div>
                        </div>
                        
                        <div class="stats-grid" id="stats-grid">
                            <!-- Les stats seront générées dynamiquement -->
                        </div>
                        
                        <div class="available-points" id="available-points">
                            Points disponibles: <span id="points-count">0</span>
                        </div>
                    </div>
                    
                    <!-- Onglet Compétences -->
                    <div class="tab-content" id="tab-skills">
                        <div class="skills-container">
                            <div class="skills-active">
                                <h3>Compétences Actives</h3>
                                <div class="skills-grid" id="active-skills"></div>
                            </div>
                            <div class="skills-passive">
                                <h3>Compétences Passives</h3>
                                <div class="skills-grid" id="passive-skills"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Onglet Évolution -->
                    <div class="tab-content" id="tab-evolution">
                        <div class="evolution-tree">
                            <div class="evolution-node current" data-rank="E">
                                <div class="node-icon">E</div>
                                <div class="node-info">Actuel</div>
                            </div>
                            <div class="evolution-path"></div>
                            <div class="evolution-node locked" data-rank="D">
                                <div class="node-icon">D</div>
                                <div class="node-info">Niveau 10</div>
                            </div>
                            <!-- Les autres rangs seront générés dynamiquement -->
                        </div>
                        
                        <div class="evolution-info">
                            <h3 id="next-rank-title">Prochain Rang: D</h3>
                            <p id="next-rank-requirements">Niveau 10 requis</p>
                            <div class="evolution-rewards" id="next-rank-rewards">
                                <h4>Récompenses:</h4>
                                <ul>
                                    <li>+50% aux dégâts</li>
                                    <li>Débloque l'extraction d'ombre</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Onglet Succès -->
                    <div class="tab-content" id="tab-achievements">
                        <div class="achievements-list" id="achievements-list">
                            <!-- Les succès seront chargés dynamiquement -->
                        </div>
                    </div>
                </div>
                
                <div class="evolution-footer">
                    <button class="btn-auto-allocate" id="btn-auto-allocate">
                        🎯 Allocation Automatique
                    </button>
                    <button class="btn-reset-stats" id="btn-reset-stats">
                        🔄 Réinitialiser
                    </button>
                </div>
            </div>
        `;
    }
    
    generateRankSteps() {
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        return ranks.map(rank => `
            <div class="rank-step ${rank === 'E' ? 'active' : 'locked'}" data-rank="${rank}">
                <div class="step-icon">${rank}</div>
                <div class="step-label">${rank}</div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        const ui = document.getElementById('evolution-ui');
        
        // Bouton de fermeture
        ui.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        // Onglets
        ui.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
        
        // Boutons de footer
        ui.querySelector('#btn-auto-allocate').addEventListener('click', () => {
            this.autoAllocatePoints();
        });
        
        ui.querySelector('#btn-reset-stats').addEventListener('click', () => {
            this.resetStats();
        });
        
        // Bouton global pour afficher l'interface
        document.getElementById('btn-evolution').addEventListener('click', () => {
            this.toggle();
        });
        
        // Gestes tactiles spécifiques à l'interface
        this.setupTouchGestures();
    }
    
    setupTouchGestures() {
        const ui = document.getElementById('evolution-ui');
        
        // Swipe pour changer d'onglet
        let startX = 0;
        let startY = 0;
        
        ui.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        ui.addEventListener('touchmove', (e) => {
            if (this.animationInProgress) return;
            
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            // Horizontal swipe pour changer d'onglet
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30) {
                e.preventDefault();
                
                const tabs = ['stats', 'skills', 'evolution', 'achievements'];
                const currentIndex = tabs.indexOf(this.currentTab);
                
                if (deltaX > 0) {
                    // Swipe droite -> onglet précédent
                    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
                    this.switchTab(prevTab);
                } else {
                    // Swipe gauche -> onglet suivant
                    const nextTab = tabs[(currentIndex + 1) % tabs.length];
                    this.switchTab(nextTab);
                }
                
                startX = e.touches[0].clientX;
            }
        });
        
        // Double tap pour monter de niveau
        ui.addEventListener('dblclick', () => {
            this.simulateLevelUp();
        });
        
        // Pinch pour zoomer dans l'arbre d'évolution
        let initialDistance = 0;
        
        ui.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2 && this.currentTab === 'evolution') {
                initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
            }
        });
        
        ui.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.currentTab === 'evolution') {
                e.preventDefault();
                
                const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                this.zoomEvolutionTree(scale);
            }
        });
    }
    
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    zoomEvolutionTree(scale) {
        const tree = document.querySelector('.evolution-tree');
        if (tree) {
            const currentScale = parseFloat(tree.style.transform?.replace('scale(', '') || 1);
            const newScale = Math.max(0.5, Math.min(2, currentScale * scale));
            tree.style.transform = `scale(${newScale})`;
        }
    }
    
    show() {
        this.isVisible = true;
        const ui = document.getElementById('evolution-ui');
        ui.classList.add('active');
        
        // Mettre à jour les données
        this.update();
        
        // Animation d'entrée
        this.animateEntrance();
        
        // Vibrer
        if (navigator.vibrate) navigator.vibrate(20);
    }
    
    hide() {
        this.isVisible = false;
        const ui = document.getElementById('evolution-ui');
        ui.classList.remove('active');
        
        // Animation de sortie
        this.animateExit();
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    animateEntrance() {
        this.animationInProgress = true;
        const ui = document.getElementById('evolution-ui');
        
        // Animation d'entrée
        ui.style.opacity = '0';
        ui.style.transform = 'translateY(50px) scale(0.9)';
        
        let opacity = 0;
        let scale = 0.9;
        let translateY = 50;
        
        const animate = () => {
            opacity += 0.05;
            scale += 0.005;
            translateY -= 2.5;
            
            ui.style.opacity = opacity;
            ui.style.transform = `translateY(${translateY}px) scale(${scale})`;
            
            if (opacity < 1) {
                requestAnimationFrame(animate);
            } else {
                ui.style.opacity = '';
                ui.style.transform = '';
                this.animationInProgress = false;
            }
        };
        
        animate();
    }
    
    animateExit() {
        this.animationInProgress = true;
        const ui = document.getElementById('evolution-ui');
        
        let opacity = 1;
        let scale = 1;
        let translateY = 0;
        
        const animate = () => {
            opacity -= 0.05;
            scale -= 0.005;
            translateY += 2.5;
            
            ui.style.opacity = opacity;
            ui.style.transform = `translateY(${translateY}px) scale(${scale})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                ui.style.opacity = '';
                ui.style.transform = '';
                ui.classList.remove('active');
                this.animationInProgress = false;
            }
        };
        
        animate();
    }
    
    update() {
        if (!this.isVisible) return;
        
        this.updatePlayerInfo();
        this.updateStats();
        this.updateSkills();
        this.updateEvolutionTree();
        this.updateAchievements();
    }
    
    updatePlayerInfo() {
        const evolution = EvolutionSystem;
        
        // Niveau
        document.getElementById('player-level').textContent = evolution.level;
        
        // Expérience
        const expPercent = (evolution.exp / evolution.expToNext) * 100;
        document.getElementById('exp-fill').style.width = `${expPercent}%`;
        document.getElementById('exp-text').textContent = 
            `${evolution.exp}/${evolution.expToNext}`;
        
        // Rang
        const rankBadge = document.getElementById('current-rank-badge');
        rankBadge.textContent = `Rang ${evolution.rank}`;
        rankBadge.style.background = this.getRankColor(evolution.rank);
        rankBadge.style.boxShadow = `0 0 10px ${this.getRankColor(evolution.rank)}`;
        
        // Points disponibles
        document.getElementById('points-count').textContent = evolution.stats.availablePoints;
        const pointsElement = document.getElementById('available-points');
        
        if (evolution.stats.availablePoints > 0) {
            pointsElement.classList.add('has-points');
            pointsElement.style.animation = 'pulse 1s infinite';
        } else {
            pointsElement.classList.remove('has-points');
            pointsElement.style.animation = '';
        }
        
        // Mettre à jour les étapes de rang
        this.updateRankSteps();
    }
    
    updateRankSteps() {
        const evolution = EvolutionSystem;
        const currentRank = evolution.rank;
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        
        document.querySelectorAll('.rank-step').forEach(step => {
            const rank = step.dataset.rank;
            const rankIndex = ranks.indexOf(rank);
            const currentRankIndex = ranks.indexOf(currentRank);
            
            step.classList.remove('active', 'unlocked', 'locked');
            
            if (rank === currentRank) {
                step.classList.add('active');
            } else if (rankIndex <= currentRankIndex) {
                step.classList.add('unlocked');
            } else {
                step.classList.add('locked');
            }
            
            // Couleur
            if (step.classList.contains('active')) {
                step.style.color = this.getRankColor(rank);
                step.querySelector('.step-icon').style.background = this.getRankColor(rank);
            }
        });
    }
    
    updateStats() {
        const evolution = EvolutionSystem;
        const statsGrid = document.getElementById('stats-grid');
        
        if (!statsGrid) return;
        
        const stats = [
            { key: 'strength', name: '💪 Force', icon: '💪' },
            { key: 'agility', name: '⚡ Agilité', icon: '⚡' },
            { key: 'endurance', name: '🛡️ Endurance', icon: '🛡️' },
            { key: 'intelligence', name: '🧠 Intelligence', icon: '🧠' },
            { key: 'perception', name: '👁️ Perception', icon: '👁️' },
            { key: 'charisma', name: '👑 Charisme', icon: '👑' }
        ];
        
        statsGrid.innerHTML = stats.map(stat => {
            const value = evolution.stats[stat.key];
            const hasPoints = evolution.stats.availablePoints > 0;
            
            return `
                <div class="stat-item" data-stat="${stat.key}">
                    <div class="stat-header">
                        <span class="stat-icon">${stat.icon}</span>
                        <span class="stat-name">${stat.name}</span>
                    </div>
                    <div class="stat-value">${value}</div>
                    <div class="stat-controls">
                        <button class="stat-btn minus" ${value <= 1 ? 'disabled' : ''}>-</button>
                        <button class="stat-btn plus" ${!hasPoints ? 'disabled' : ''}>+</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Ajouter les événements
        statsGrid.querySelectorAll('.stat-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const statItem = btn.closest('.stat-item');
                const stat = statItem.dataset.stat;
                this.increaseStat(stat);
            });
        });
        
        statsGrid.querySelectorAll('.stat-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const statItem = btn.closest('.stat-item');
                const stat = statItem.dataset.stat;
                this.decreaseStat(stat);
            });
        });
    }
    
    increaseStat(stat) {
        if (EvolutionSystem.allocateStat(stat, 1)) {
            this.update();
            this.animateStatChange(stat, '+1');
            
            // Son
            AudioManager.play('stat_up');
            
            // Vibration
            if (navigator.vibrate) navigator.vibrate(30);
        }
    }
    
    decreaseStat(stat) {
        // On ne permet de diminuer que si on a des points disponibles à récupérer
        if (EvolutionSystem.stats[stat] > 1) {
            EvolutionSystem.stats[stat]--;
            EvolutionSystem.stats.availablePoints++;
            
            // Sauvegarder
            EvolutionSystem.save();
            
            this.update();
            this.animateStatChange(stat, '-1');
            
            // Son
            AudioManager.play('stat_down');
        }
    }
    
    animateStatChange(stat, change) {
        const statItem = document.querySelector(`.stat-item[data-stat="${stat}"]`);
        if (!statItem) return;
        
        const animation = document.createElement('div');
        animation.className = 'stat-change-animation';
        animation.textContent = change;
        animation.style.cssText = `
            position: absolute;
            color: ${change.startsWith('+') ? '#10b981' : '#ef4444'};
            font-weight: bold;
            font-size: 20px;
            pointer-events: none;
            z-index: 100;
            animation: floatUp 1s forwards;
        `;
        
        statItem.appendChild(animation);
        
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
        }, 1000);
    }
    
    updateSkills() {
        // Mettre à jour les compétences actives
        const activeSkillsGrid = document.getElementById('active-skills');
        if (activeSkillsGrid && CombatSystem.skills) {
            activeSkillsGrid.innerHTML = Object.entries(CombatSystem.skills)
                .map(([id, skill]) => `
                    <div class="skill-item" data-skill="${id}">
                        <div class="skill-icon">${this.getSkillIcon(skill.type)}</div>
                        <div class="skill-info">
                            <h4>${skill.name}</h4>
                            <p>Niveau: ${skill.level || 1}</p>
                            <p>Cooldown: ${skill.cooldown}s</p>
                        </div>
                        <div class="skill-level">
                            <button class="skill-upgrade-btn" ${!this.canUpgradeSkill(id) ? 'disabled' : ''}>
                                ↑
                            </button>
                        </div>
                    </div>
                `).join('');
        }
        
        // Mettre à jour les compétences passives
        const passiveSkillsGrid = document.getElementById('passive-skills');
        if (passiveSkillsGrid && EvolutionSystem.skills.passive) {
            passiveSkillsGrid.innerHTML = EvolutionSystem.skills.passive
                .map(skill => `
                    <div class="skill-item passive">
                        <div class="skill-icon">⭐</div>
                        <div class="skill-info">
                            <h4>${skill.name}</h4>
                            <p>${skill.description}</p>
                        </div>
                    </div>
                `).join('');
        }
    }
    
    getSkillIcon(type) {
        const icons = {
            'physical': '⚔️',
            'magic': '🔮',
            'defensive': '🛡️',
            'movement': '💨',
            'ultimate': '✨',
            'summon': '👥',
            'aoe': '🌀'
        };
        return icons[type] || '❓';
    }
    
    canUpgradeSkill(skillId) {
        // Vérifier si le joueur peut améliorer la compétence
        const skill = CombatSystem.skills[skillId];
        const evolution = EvolutionSystem;
        
        return evolution.stats.availablePoints > 0 && 
               (!skill.maxLevel || (skill.level || 1) < skill.maxLevel);
    }
    
    updateEvolutionTree() {
        const evolution = EvolutionSystem;
        const currentRank = evolution.rank;
        const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        const currentIndex = ranks.indexOf(currentRank);
        
        // Mettre à jour les nœuds
        document.querySelectorAll('.evolution-node').forEach(node => {
            const rank = node.dataset.rank;
            const rankIndex = ranks.indexOf(rank);
            
            node.classList.remove('current', 'unlocked', 'locked', 'available');
            
            if (rank === currentRank) {
                node.classList.add('current');
            } else if (rankIndex < currentIndex) {
                node.classList.add('unlocked');
            } else if (rankIndex === currentIndex + 1) {
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }
            
            // Mettre à jour les infos
            if (node.classList.contains('available')) {
                const levelRequirement = this.getRankRequirement(rank);
                node.querySelector('.node-info').textContent = `Niveau ${levelRequirement}`;
            }
        });
        
        // Mettre à jour les informations du prochain rang
        if (currentIndex < ranks.length - 1) {
            const nextRank = ranks[currentIndex + 1];
            const requirements = this.getRankRequirements(nextRank);
            const rewards = this.getRankRewards(nextRank);
            
            document.getElementById('next-rank-title').textContent = `Prochain Rang: ${nextRank}`;
            document.getElementById('next-rank-requirements').textContent = 
                `Niveau ${requirements.level} requis`;
            
            document.getElementById('next-rank-rewards').innerHTML = `
                <h4>Récompenses:</h4>
                <ul>
                    ${rewards.map(reward => `<li>${reward}</li>`).join('')}
                </ul>
            `;
        } else {
            document.getElementById('next-rank-title').textContent = 'Rang Maximum Atteint!';
            document.getElementById('next-rank-requirements').textContent = 
                'Vous avez atteint le rang SSS';
            document.getElementById('next-rank-rewards').innerHTML = `
                <h4>Félicitations!</h4>
                <p>Vous êtes devenu le Monarque de l'Ombre ultime.</p>
            `;
        }
    }
    
    getRankRequirement(rank) {
        const requirements = {
            'E': 1,
            'D': 10,
            'C': 25,
            'B': 40,
            'A': 60,
            'S': 80,
            'SS': 100,
            'SSS': 120
        };
        return requirements[rank] || 1;
    }
    
    getRankRequirements(rank) {
        return {
            level: this.getRankRequirement(rank),
            stats: {
                strength: 50,
                agility: 50,
                endurance: 50
            }
        };
    }
    
    getRankRewards(rank) {
        const rewards = {
            'D': [
                '+50% aux dégâts',
                'Débloque l\'extraction d\'ombre',
                '+10 à toutes les stats'
            ],
            'C': [
                '+100% aux dégâts',
                'Débloque l\'armée d\'ombre (max: 10)',
                '+20 à toutes les stats'
            ],
            'B': [
                '+200% aux dégâts',
                'Augmente la limite d\'armée à 50',
                'Nouvelles compétences débloquées'
            ],
            'A': [
                '+400% aux dégâts',
                'Interface d\'évolution avancée',
                'Évolution des soldats d\'ombre'
            ],
            'S': [
                '+800% aux dégâts',
                'Devenez Monarque de l\'Ombre',
                'Contrôle total de l\'armée'
            ],
            'SS': [
                '+1500% aux dégâts',
                'Pouvoirs de dimension',
                'Armée illimitée'
            ],
            'SSS': [
                '+3000% aux dégâts',
                'Statut de légende',
                'Pouvoirs divins'
            ]
        };
        return rewards[rank] || ['Récompenses inconnues'];
    }
    
    updateAchievements() {
        // À implémenter avec un système de succès
        const achievementsList = document.getElementById('achievements-list');
        if (achievementsList) {
            achievementsList.innerHTML = `
                <div class="achievement-item unlocked">
                    <div class="achievement-icon">🎯</div>
                    <div class="achievement-info">
                        <h4>Premier Pas</h4>
                        <p>Atteindre le niveau 5</p>
                    </div>
                    <div class="achievement-reward">+100 XP</div>
                </div>
                <div class="achievement-item locked">
                    <div class="achievement-icon">👻</div>
                    <div class="achievement-info">
                        <h4>Collectionneur d'Âmes</h4>
                        <p>Extraire 10 soldats d'ombre</p>
                    </div>
                    <div class="achievement-reward">Cristal de mana</div>
                </div>
            `;
        }
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Mettre à jour les boutons d'onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Mettre à jour le contenu des onglets
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        
        // Animation de transition
        this.animateTabSwitch(tabName);
        
        // Vibration
        if (navigator.vibrate) navigator.vibrate(10);
    }
    
    animateTabSwitch(tabName) {
        const tabContent = document.getElementById(`tab-${tabName}`);
        if (!tabContent) return;
        
        tabContent.style.opacity = '0';
        tabContent.style.transform = 'translateX(20px)';
        
        let opacity = 0;
        let translateX = 20;
        
        const animate = () => {
            opacity += 0.1;
            translateX -= 2;
            
            tabContent.style.opacity = opacity;
            tabContent.style.transform = `translateX(${translateX}px)`;
            
            if (opacity < 1) {
                requestAnimationFrame(animate);
            } else {
                tabContent.style.opacity = '';
                tabContent.style.transform = '';
            }
        };
        
        animate();
    }
    
    autoAllocatePoints() {
        const evolution = EvolutionSystem;
        const points = evolution.stats.availablePoints;
        
        if (points === 0) {
            UI.Notifications.show('Aucun point disponible', 'warning');
            return;
        }
        
        // Stratégie d'allocation automatique basée sur la classe
        const allocationStrategy = this.getAllocationStrategy();
        
        for (let i = 0; i < points; i++) {
            const stat = allocationStrategy[i % allocationStrategy.length];
            evolution.allocateStat(stat, 1);
        }
        
        this.update();
        UI.Notifications.show(`${points} points alloués automatiquement`, 'success');
        
        // Animation spéciale
        this.playAutoAllocationAnimation();
        
        // Son
        AudioManager.play('levelup');
        
        // Vibration
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
    
    getAllocationStrategy() {
        // Déterminer la stratégie basée sur les stats actuelles
        const evolution = EvolutionSystem;
        const stats = evolution.stats;
        
        // Trouver la stat la plus basse
        const statEntries = Object.entries(stats)
            .filter(([key]) => key !== 'availablePoints')
            .sort(([, a], [, b]) => a - b);
        
        return statEntries.map(([stat]) => stat);
    }
    
    playAutoAllocationAnimation() {
        const container = document.querySelector('.evolution-container');
        
        // Effet de particules
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'allocation-particle';
            particle.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: #00f3ff;
                border-radius: 50%;
                pointer-events: none;
                z-index: 100;
            `;
            
            // Position aléatoire
            const x = Math.random() * container.clientWidth;
            const y = Math.random() * container.clientHeight;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            container.appendChild(particle);
            
            // Animation
            particle.animate([
                { transform: 'scale(0)', opacity: 1 },
                { transform: 'scale(1)', opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }
    
    resetStats() {
        if (EvolutionSystem.stats.availablePoints === 0) {
            UI.Notifications.show('Aucun point à réinitialiser', 'warning');
            return;
        }
        
        // Demander confirmation
        if (confirm('Réinitialiser tous les points de stats? Cette action est irréversible.')) {
            const pointsToRecover = this.calculateResetPoints();
            
            // Réinitialiser les stats à leurs valeurs de base
            const baseStats = {
                strength: 10,
                agility: 10,
                endurance: 10,
                intelligence: 10,
                perception: 10,
                charisma: 10
            };
            
            // Calculer les points à récupérer
            Object.keys(baseStats).forEach(stat => {
                const difference = EvolutionSystem.stats[stat] - baseStats[stat];
                if (difference > 0) {
                    EvolutionSystem.stats.availablePoints += difference;
                    EvolutionSystem.stats[stat] = baseStats[stat];
                }
            });
            
            // Sauvegarder
            EvolutionSystem.save();
            
            // Mettre à jour l'UI
            this.update();
            
            UI.Notifications.show(`${pointsToRecover} points récupérés`, 'success');
            
            // Animation de reset
            this.playResetAnimation();
            
            // Son
            AudioManager.play('reset');
            
            // Vibration
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    }
    
    calculateResetPoints() {
        const baseStats = {
            strength: 10,
            agility: 10,
            endurance: 10,
            intelligence: 10,
            perception: 10,
            charisma: 10
        };
        
        let total = 0;
        Object.keys(baseStats).forEach(stat => {
            const difference = EvolutionSystem.stats[stat] - baseStats[stat];
            if (difference > 0) {
                total += difference;
            }
        });
        
        return total;
    }
    
    playResetAnimation() {
        const container = document.querySelector('.evolution-container');
        
        // Effet de vague de reset
        const wave = document.createElement('div');
        wave.className = 'reset-wave';
        wave.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(109, 40, 217, 0.3), transparent);
            pointer-events: none;
            z-index: 50;
        `;
        
        container.appendChild(wave);
        
        // Animation
        wave.animate([
            { transform: 'translateX(-100%)' },
            { transform: 'translateX(100%)' }
        ], {
            duration: 1000,
            easing: 'ease-in-out'
        }).onfinish = () => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        };
    }
    
    simulateLevelUp() {
        // Pour le débogage/développement
        EvolutionSystem.gainExp(EvolutionSystem.expToNext - EvolutionSystem.exp);
        this.update();
    }
    
    getRankColor(rank) {
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
        return colors[rank] || '#666666';
    }
    
    loadRankColors() {
        // Injecter les styles pour les couleurs de rang
        const style = document.createElement('style');
        const colors = this.getRankColor;
        
        // Cette fonction serait appelée pour générer du CSS dynamique
        // mais pour simplifier, on utilise des classes CSS pré-définies
    }
    
    isVisible() {
        return this.isVisible;
    }
}

// Initialiser l'interface d'évolution
window.addEventListener('load', () => {
    window.UI = window.UI || {};
    window.UI.EvolutionUI = new EvolutionUI();
});
