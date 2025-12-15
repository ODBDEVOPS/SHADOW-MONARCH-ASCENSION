const GameConfig = {
    // Performance
    TARGET_FPS: 60,
    MOBILE_TARGET_FPS: 30,
    LOD_DISTANCES: {
        NEAR: 20,
        MEDIUM: 50,
        FAR: 100
    },
    
    // Gameplay
    LEVEL_SCALING: 1.5,
    DIFFICULTY_MULTIPLIERS: {
        EASY: 0.7,
        NORMAL: 1.0,
        HARD: 1.5,
        NIGHTMARE: 2.5
    },
    
    // Évolution
    RANK_REQUIREMENTS: {
        'E': 1,
        'D': 10,
        'C': 25,
        'B': 40,
        'A': 60,
        'S': 80,
        'SS': 100,
        'SSS': 120
    },
    
    // Mobile spécifique
    TOUCH_SENSITIVITY: {
        JOYSTICK_DEADZONE: 0.1,
        SWIPE_THRESHOLD: 50,
        TAP_MAX_DURATION: 300,
        LONG_PRESS_DURATION: 1000
    },
    
    // Graphics
    QUALITY_PRESETS: {
        LOW: {
            SHADOWS: false,
            ANTIALIAS: false,
            TEXTURE_QUALITY: 'low',
            PARTICLE_COUNT: 50,
            LOD_ENABLED: true
        },
        MEDIUM: {
            SHADOWS: true,
            ANTIALIAS: false,
            TEXTURE_QUALITY: 'medium',
            PARTICLE_COUNT: 100,
            LOD_ENABLED: true
        },
        HIGH: {
            SHADOWS: true,
            ANTIALIAS: true,
            TEXTURE_QUALITY: 'high',
            PARTICLE_COUNT: 200,
            LOD_ENABLED: false
        }
    },
    
    // Audio
    DEFAULT_VOLUMES: {
        MASTER: 1.0,
        MUSIC: 0.7,
        SFX: 0.8,
        AMBIENT: 0.4
    },
    
    // Sauvegarde
    SAVE_SETTINGS: {
        AUTO_SAVE_INTERVAL: 30000, // 30 secondes
        MAX_AUTO_SAVES: 5,
        BACKUP_COUNT: 3
    },
    
    // Réseau (pour future implémentation)
    API_ENDPOINTS: {
        LEADERBOARD: 'https://api.shadowmonarch.com/leaderboard',
        CLOUD_SAVE: 'https://api.shadowmonarch.com/save',
        UPDATE_CHECK: 'https://api.shadowmonarch.com/version'
    }
};

// Détection d'appareil
const DeviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    
    getPerformanceTier() {
        const memory = navigator.deviceMemory || 4; // en GB
        const cores = navigator.hardwareConcurrency || 4;
        
        if (memory < 2 || cores < 4) return 'LOW';
        if (memory < 4 || cores < 6) return 'MEDIUM';
        return 'HIGH';
    },
    
    getRecommendedSettings() {
        const tier = this.getPerformanceTier();
        return GameConfig.QUALITY_PRESETS[tier] || GameConfig.QUALITY_PRESETS.LOW;
    }
};

// Configuration dynamique basée sur l'appareil
function getOptimalConfig() {
    const config = { ...GameConfig };
    
    if (DeviceInfo.isMobile) {
        config.TARGET_FPS = config.MOBILE_TARGET_FPS;
        
        // Réduire les distances LOD sur mobile
        config.LOD_DISTANCES.NEAR = 10;
        config.LOD_DISTANCES.MEDIUM = 30;
        config.LOD_DISTANCES.FAR = 60;
        
        // Ajuster la sensibilité tactile
        if (DeviceInfo.isIOS) {
            config.TOUCH_SENSITIVITY.JOYSTICK_DEADZONE = 0.05;
        }
    }
    
    return config;
}

// Exporter la configuration
window.GameConfig = getOptimalConfig();
window.DeviceInfo = DeviceInfo;
