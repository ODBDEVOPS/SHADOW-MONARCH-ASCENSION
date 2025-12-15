class GameAnalytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.playerId = this.getPlayerId();
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.trackSessionStart();
        this.setupPerformanceMonitoring();
        this.setupErrorTracking();
        this.setupEventListeners();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getPlayerId() {
        let playerId = localStorage.getItem('player_id');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('player_id', playerId);
        }
        return playerId;
    }
    
    trackSessionStart() {
        this.trackEvent('session_start', {
            session_id: this.sessionId,
            player_id: this.playerId,
            timestamp: this.startTime,
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
    }
    
    trackEvent(eventName, data = {}) {
        const event = {
            event: eventName,
            session_id: this.sessionId,
            player_id: this.playerId,
            timestamp: Date.now(),
            data: data
        };
        
        this.events.push(event);
        console.log(`📊 Analytics: ${eventName}`, data);
        
        // Envoyer en temps réel si connecté
        if (navigator.onLine) {
            this.sendEvent(event);
        } else {
            this.queueEvent(event);
        }
        
        // Limiter la taille du cache
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }
    }
    
    sendEvent(event) {
        // Envoyer à votre service d'analytics
        // Pour l'instant, log uniquement
        if (window.ENV === 'development') {
            console.log('Event sent:', event);
        }
        
        // Exemple avec Google Analytics (si intégré)
        if (typeof gtag !== 'undefined') {
            gtag('event', event.event, event.data);
        }
    }
    
    queueEvent(event) {
        const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        queue.push(event);
        localStorage.setItem('analytics_queue', JSON.stringify(queue));
    }
    
    sendQueuedEvents() {
        if (!navigator.onLine) return;
        
        const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
        
        queue.forEach(event => {
            this.sendEvent(event);
        });
        
        localStorage.removeItem('analytics_queue');
    }
    
    setupPerformanceMonitoring() {
        // Surveillance des FPS
        let frameCount = 0;
        let lastTime = Date.now();
        
        const checkFPS = () => {
            frameCount++;
            const currentTime = Date.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                this.trackEvent('performance_fps', {
                    fps: fps,
                    threshold: GameConfig.TARGET_FPS,
                    is_below_threshold: fps < GameConfig.TARGET_FPS * 0.8
                });
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        checkFPS();
        
        // Surveillance de la mémoire
        if ('memory' in performance) {
            setInterval(() => {
                this.trackEvent('performance_memory', {
                    used_js_heap_size: performance.memory.usedJSHeapSize,
                    total_js_heap_size: performance.memory.totalJSHeapSize,
                    js_heap_size_limit: performance.memory.jsHeapSizeLimit
                });
            }, 30000);
        }
        
        // Temps de chargement
        window.addEventListener('load', () => {
            const loadTime = Date.now() - performance.timing.navigationStart;
            this.trackEvent('performance_load', {
                load_time: loadTime,
                is_slow: loadTime > 3000
            });
        });
    }
    
    setupErrorTracking() {
        // Erreurs JavaScript
        window.addEventListener('error', (event) => {
            this.trackEvent('error_js', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.toString()
            });
        });
        
        // Promesses non catchées
        window.addEventListener('unhandledrejection', (event) => {
            this.trackEvent('error_promise', {
                reason: event.reason?.toString()
            });
        });
        
        // Erreurs de ressource
        window.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG' || 
                event.target.tagName === 'SCRIPT' || 
                event.target.tagName === 'LINK') {
                this.trackEvent('error_resource', {
                    tag: event.target.tagName,
                    src: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    setupEventListeners() {
        // Événements de gameplay
        document.addEventListener('levelup', (e) => {
            this.trackEvent('gameplay_levelup', {
                new_level: e.detail.level,
                old_level: e.detail.oldLevel
            });
        });
        
        document.addEventListener('evolution', (e) => {
            this.trackEvent('gameplay_evolution', {
                new_rank: e.detail.newRank,
                old_rank: e.detail.oldRank
            });
        });
        
        // Événements d'interface
        document.addEventListener('ui_interaction', (e) => {
            this.trackEvent('ui_interaction', {
                element: e.detail.element,
                action: e.detail.action,
                screen: e.detail.screen
            });
        });
        
        // Reconnexion réseau
        window.addEventListener('online', () => {
            this.trackEvent('network_online');
            this.sendQueuedEvents();
        });
        
        window.addEventListener('offline', () => {
            this.trackEvent('network_offline');
        });
    }
    
    // Méthodes spécifiques au jeu
    trackCombat(damage, enemyType, skillUsed) {
        this.trackEvent('combat_action', {
            damage: damage,
            enemy_type: enemyType,
            skill: skillUsed,
            player_level: EvolutionSystem?.level,
            player_rank: EvolutionSystem?.rank
        });
    }
    
    trackExtraction(success, enemyType, soldierType) {
        this.trackEvent('shadow_extraction', {
            success: success,
            enemy_type: enemyType,
            soldier_type: soldierType,
            total_soldiers: ShadowArmySystem?.soldiers?.size || 0
        });
    }
    
    trackDungeonCompletion(dungeonId, timeTaken, difficulty) {
        this.trackEvent('dungeon_complete', {
            dungeon_id: dungeonId,
            time_taken: timeTaken,
            difficulty: difficulty,
            deaths: 0, // À implémenter
            items_collected: 0 // À implémenter
        });
    }
    
    trackSessionEnd() {
        const sessionDuration = Date.now() - this.startTime;
        
        this.trackEvent('session_end', {
            session_id: this.sessionId,
            duration: sessionDuration,
            events_count: this.events.length,
            player_level: EvolutionSystem?.level,
            player_rank: EvolutionSystem?.rank
        });
        
        // Forcer l'envoi des événements restants
        this.sendQueuedEvents();
    }
    
    // Rapport de performance utilisateur
    generatePerformanceReport() {
        const fpsEvents = this.events.filter(e => e.event === 'performance_fps');
        const avgFPS = fpsEvents.length > 0 
            ? fpsEvents.reduce((sum, e) => sum + e.data.fps, 0) / fpsEvents.length 
            : 0;
        
        const errorCount = this.events.filter(e => e.event.startsWith('error_')).length;
        
        return {
            session_id: this.sessionId,
            player_id: this.playerId,
            session_duration: Date.now() - this.startTime,
            average_fps: Math.round(avgFPS),
            error_count: errorCount,
            events_total: this.events.length,
            device_info: {
                user_agent: navigator.userAgent,
                platform: navigator.platform,
                screen: `${window.screen.width}x${window.screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                device_memory: navigator.deviceMemory,
                hardware_concurrency: navigator.hardwareConcurrency
            }
        };
    }
}

// Initialiser les analytics
window.addEventListener('load', () => {
    window.Analytics = new GameAnalytics();
    
    // Sauvegarder les analytics en quittant
    window.addEventListener('beforeunload', () => {
        window.Analytics.trackSessionEnd();
    });
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.Analytics.trackEvent('app_background');
        } else {
            window.Analytics.trackEvent('app_foreground');
        }
    });
});
