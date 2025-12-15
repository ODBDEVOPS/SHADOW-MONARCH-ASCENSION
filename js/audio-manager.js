class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.isMuted = false;
        this.volume = 1.0;
        this.musicVolume = 0.7;
        this.soundVolume = 0.8;
        
        // Contexte audio (important pour iOS)
        this.audioContext = null;
        this.unlocked = false;
        
        this.init();
    }
    
    init() {
        this.createAudioContext();
        this.loadSounds();
        this.setupEventListeners();
        this.unlockAudio(); // Important pour iOS
    }
    
    createAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioContext créé avec succès');
        } catch (e) {
            console.warn('Web Audio API non supporté:', e);
        }
    }
    
    unlockAudio() {
        // iOS nécessite une interaction utilisateur pour démarrer l'audio
        const unlock = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Créer un son silencieux pour débloquer l'audio
            const buffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            
            this.unlocked = true;
            
            // Nettoyer les événements
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        
        // Attacher l'unlock à plusieurs événements
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('touchend', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
    }
    
    loadSounds() {
        // Sons de base
        const soundFiles = {
            // UI
            'click': { url: 'assets/audio/ui/click.mp3', volume: 0.5 },
            'hover': { url: 'assets/audio/ui/hover.mp3', volume: 0.3 },
            'notification': { url: 'assets/audio/ui/notification.mp3', volume: 0.6 },
            
            // Gameplay
            'levelup': { url: 'assets/audio/gameplay/levelup.mp3', volume: 0.7 },
            'evolution': { url: 'assets/audio/gameplay/evolution.mp3', volume: 0.8 },
            'stat_up': { url: 'assets/audio/gameplay/stat_up.mp3', volume: 0.5 },
            'stat_down': { url: 'assets/audio/gameplay/stat_down.mp3', volume: 0.5 },
            'reset': { url: 'assets/audio/gameplay/reset.mp3', volume: 0.6 },
            
            // Combat
            'attack': { url: 'assets/audio/combat/attack.mp3', volume: 0.6 },
            'magic': { url: 'assets/audio/combat/magic.mp3', volume: 0.7 },
            'hit': { url: 'assets/audio/combat/hit.mp3', volume: 0.5 },
            'extraction': { url: 'assets/audio/combat/extraction.mp3', volume: 0.8 },
            
            // Environnement
            'ambient': { url: 'assets/audio/environment/ambient.mp3', volume: 0.4, loop: true }
        };
        
        // Charger les sons
        Object.entries(soundFiles).forEach(([name, config]) => {
            this.loadSound(name, config.url, config.volume, config.loop);
        });
    }
    
    async loadSound(name, url, volume = 1.0, loop = false) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            if (this.audioContext) {
                this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                    this.sounds.set(name, {
                        buffer: buffer,
                        volume: volume,
                        loop: loop
                    });
                });
            } else {
                // Fallback HTML5 Audio
                const audio = new Audio(url);
                audio.volume = volume * this.soundVolume;
                audio.loop = loop;
                audio.preload = 'auto';
                
                this.sounds.set(name, {
                    audio: audio,
                    volume: volume,
                    loop: loop
                });
            }
        } catch (error) {
            console.warn(`Impossible de charger le son ${name}:`, error);
        }
    }
    
    play(name, options = {}) {
        if (this.isMuted || !this.unlocked) return null;
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`Son non trouvé: ${name}`);
            return null;
        }
        
        // Options
        const volume = options.volume !== undefined ? options.volume : sound.volume;
        const loop = options.loop !== undefined ? options.loop : sound.loop;
        
        if (sound.buffer && this.audioContext) {
            // Web Audio API
            const source = this.audioContext.createBufferSource();
            source.buffer = sound.buffer;
            source.loop = loop;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume * this.soundVolume * this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            source.start(0);
            
            // Stocker pour contrôle ultérieur
            sound.source = source;
            sound.gainNode = gainNode;
            
            return {
                stop: () => source.stop(),
                setVolume: (vol) => gainNode.gain.value = vol * this.soundVolume * this.volume
            };
        } else if (sound.audio) {
            // HTML5 Audio fallback
            const audio = sound.audio.cloneNode();
            audio.volume = volume * this.soundVolume * this.volume;
            audio.loop = loop;
            audio.play();
            
            return {
                stop: () => audio.pause(),
                setVolume: (vol) => audio.volume = vol * this.soundVolume * this.volume
            };
        }
        
        return null;
    }
    
    playMusic(name, fadeIn = true) {
        if (this.music) {
            this.stopMusic();
        }
        
        const music = this.play(name, { loop: true, volume: this.musicVolume });
        if (music && fadeIn) {
            this.fadeIn(music, 2000);
        }
        
        this.music = music;
        return music;
    }
    
    stopMusic(fadeOut = true) {
        if (this.music) {
            if (fadeOut) {
                this.fadeOut(this.music, 1000, () => {
                    if (this.music && this.music.stop) {
                        this.music.stop();
                    }
                });
            } else {
                if (this.music.stop) {
                    this.music.stop();
                }
            }
            this.music = null;
        }
    }
    
    fadeIn(sound, duration = 1000) {
        if (sound && sound.setVolume) {
            let startVolume = 0;
            const endVolume = this.musicVolume;
            const startTime = Date.now();
            
            const fade = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentVolume = startVolume + (endVolume - startVolume) * progress;
                sound.setVolume(currentVolume);
                
                if (progress < 1) {
                    requestAnimationFrame(fade);
                }
            };
            
            sound.setVolume(startVolume);
            fade();
        }
    }
    
    fadeOut(sound, duration = 1000, onComplete = null) {
        if (sound && sound.setVolume) {
            const startVolume = this.musicVolume;
            let endVolume = 0;
            const startTime = Date.now();
            
            const fade = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const currentVolume = startVolume + (endVolume - startVolume) * progress;
                sound.setVolume(currentVolume);
                
                if (progress < 1) {
                    requestAnimationFrame(fade);
                } else if (onComplete) {
                    onComplete();
                }
            };
            
            fade();
        } else if (onComplete) {
            onComplete();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Mettre à jour le volume de la musique en cours
        if (this.music && this.music.setVolume) {
            this.music.setVolume(this.musicVolume);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music && this.music.setVolume) {
            this.music.setVolume(this.musicVolume);
        }
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.setVolume(0);
        } else {
            this.setVolume(1);
        }
        
        return this.isMuted;
    }
    
    setupEventListeners() {
        // Reprendre l'audio quand la page redevient visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        });
        
        // Gérer les changements de volume système
        if ('volumechange' in document) {
            document.addEventListener('volumechange', () => {
                // Ajuster le volume en fonction des préférences système
                // Note: Cette API n'est pas largement supportée
            });
        }
        
        // Sauvegarder les préférences audio
        window.addEventListener('beforeunload', () => {
            this.savePreferences();
        });
    }
    
    savePreferences() {
        const preferences = {
            volume: this.volume,
            musicVolume: this.musicVolume,
            soundVolume: this.soundVolume,
            isMuted: this.isMuted
        };
        
        localStorage.setItem('audioPreferences', JSON.stringify(preferences));
    }
    
    loadPreferences() {
        const saved = localStorage.getItem('audioPreferences');
        if (saved) {
            try {
                const preferences = JSON.parse(saved);
                this.volume = preferences.volume || 1;
                this.musicVolume = preferences.musicVolume || 0.7;
                this.soundVolume = preferences.soundVolume || 0.8;
                this.isMuted = preferences.isMuted || false;
            } catch (e) {
                console.warn('Erreur chargement préférences audio:', e);
            }
        }
    }
    
    // Méthodes utilitaires pour le jeu
    playCombatSound(type, position = null) {
        const sounds = {
            'slash': 'attack',
            'magic': 'magic',
            'hit': 'hit',
            'critical': 'hit',
            'extract': 'extraction'
        };
        
        const soundName = sounds[type] || 'attack';
        return this.play(soundName);
    }
    
    playUISound(type) {
        const sounds = {
            'click': 'click',
            'hover': 'hover',
            'notification': 'notification',
            'levelup': 'levelup',
            'evolution': 'evolution',
            'success': 'notification',
            'error': 'click'
        };
        
        const soundName = sounds[type] || 'click';
        return this.play(soundName);
    }
    
    // Préchargement pour performances
    preloadImportantSounds() {
        const importantSounds = ['levelup', 'evolution', 'attack', 'magic', 'extraction'];
        
        importantSounds.forEach(sound => {
            if (this.sounds.has(sound)) {
                // Forcer le chargement
                const soundData = this.sounds.get(sound);
                if (soundData.audio) {
                    soundData.audio.load();
                }
            }
        });
    }
    
    destroy() {
        // Arrêter tous les sons
        this.sounds.forEach(sound => {
            if (sound.source && sound.source.stop) {
                sound.source.stop();
            }
            if (sound.audio) {
                sound.audio.pause();
                sound.audio.src = '';
            }
        });
        
        // Fermer l'AudioContext
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds.clear();
    }
}

// Initialiser le gestionnaire audio
window.addEventListener('load', () => {
    window.AudioManager = new AudioManager();
});
