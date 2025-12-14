# SHADOW-MONARCH-ASCENSION
```
SHADOW-MONARCH-MOBILE/
│
├── 📄 index.html                            # Point d'entrée principal
├── 📄 manifest.json                         # Configuration PWA
├── 📄 service-worker.js                     # Service Worker amélioré
├── 📄 robots.txt                            # Pour les moteurs de recherche
├── 📄 sitemap.xml                           # Sitemap (optionnel)
├── 📄 version.json                          # Information de version
│
├── 📁 css/                                  # Tous les fichiers CSS
│   ├── 📄 style.css                         # Styles principaux
│   ├── 📄 ui-evolution.css                  # Styles interface évolution
│   ├── 📄 responsive.css                    # Responsive design
│   └── 📄 evolution-styles.css              # Styles supplémentaires évolutions
│
├── 📁 js/                                   # Tous les fichiers JavaScript
│   ├── 📄 main.js                           # Point d'entrée JS
│   ├── 📄 three-app.js                      # Configuration Three.js
│   ├── 📄 config.js                         # Configuration du jeu
│   ├── 📄 loader.js                         # Chargement des assets
│   ├── 📄 audio-manager.js                  # Gestion audio
│   ├── 📄 analytics.js                      # Analytics et télémétrie
│   ├── 📄 build.js                          # Script de build (Node.js)
│   │
│   ├── 📁 game-systems/                     # Systèmes de jeu
│   │   ├── 📄 evolution-system.js           # Système d'évolution
│   │   ├── 📄 combat-system.js              # Système de combat
│   │   ├── 📄 inventory-system.js           # Système d'inventaire
│   │   ├── 📄 shadow-army.js                # Système armée d'ombre
│   │   ├── 📄 quest-system.js               # Système de quêtes
│   │   └── 📄 player-system.js              # Système joueur
│   │
│   ├── 📁 ui/                               # Interfaces utilisateur
│   │   ├── 📄 touch-controls.js             # Contrôles tactiles
│   │   ├── 📄 evolution-ui.js               # Interface d'évolution
│   │   ├── 📄 notifications.js              # Système de notifications
│   │   ├── 📄 hud-manager.js                # Gestion HUD
│   │   └── 📄 menu-manager.js               # Gestion menus
│   │
│   ├── 📁 utils/                            # Utilitaires
│   │   ├── 📄 save-manager.js               # Gestion sauvegardes
│   │   ├── 📄 performance-monitor.js        # Monitoring performances
│   │   ├── 📄 mobile-optimizer.js           # Optimisations mobile
│   │   ├── 📄 input-manager.js              # Gestion des entrées
│   │   └── 📄 game-state.js                 # État global du jeu
│   │
│   └── 📁 world/                            # Monde et environnement
│       ├── 📄 dungeon-generator.js          # Générateur de donjons
│       ├── 📄 enemy-manager.js              # Gestion des ennemis
│       ├── 📄 particle-system.js            # Système de particules
│       ├── 📄 npc-manager.js                # Gestion PNJ
│       └── 📄 world-manager.js              # Gestion monde
│
├── 📁 assets/                               # Tous les assets multimédias
│   ├── 📁 models/                           # Modèles 3D (GLTF/GLB)
│   │   ├── 📁 characters/                   # Personnages
│   │   │   ├── 📄 player.glb                # Modèle joueur
│   │   │   ├── 📄 player_lowpoly.glb        # Version low-poly
│   │   │   └── 📄 player_fallback.glb       # Fallback simple
│   │   │
│   │   ├── 📁 enemies/                      # Ennemis
│   │   │   ├── 📄 goblin.glb                # Gobelin (rang E)
│   │   │   ├── 📄 orc.glb                   # Orc (rang D)
│   │   │   ├── 📄 skeleton.glb              # Squelette (rang C)
│   │   │   ├── 📄 dark_knight.glb           # Chevalier noir (rang B)
│   │   │   ├── 📄 mage.glb                  # Mage (rang A)
│   │   │   └── 📄 dragon.glb                # Dragon (rang S)
│   │   │
│   │   ├── 📁 environment/                  # Environnement
│   │   │   ├── 📁 dungeons/                 # Donjons
│   │   │   │   ├── 📄 dungeon_e.glb         # Donjon rang E
│   │   │   │   ├── 📄 dungeon_d.glb         # Donjon rang D
│   │   │   │   └── 📄 dungeon_boss.glb      # Donjon boss
│   │   │   │
│   │   │   └── 📁 city/                     # Ville
│   │   │       ├── 📄 buildings.glb         # Bâtiments
│   │   │       └── 📄 guild_hall.glb        # Hall de guilde
│   │   │
│   │   └── 📁 shadow_soldiers/              # Soldats d'ombre
│   │       ├── 📄 soldier_grunt.glb         # Soldat basique
│   │       ├── 📄 soldier_mage.glb          # Mage d'ombre
│   │       ├── 📄 soldier_knight.glb        # Chevalier d'ombre
│   │       └── 📄 soldier_dragon.glb        # Dragon d'ombre
│   │
│   ├── 📁 textures/                         # Textures
│   │   ├── 📁 characters/                   # Textures personnages
│   │   │   ├── 📄 player_base.png           # Texture base joueur
│   │   │   ├── 📄 player_normal.png         # Normal map
│   │   │   └── 📄 player_specular.png       # Specular map
│   │   │
│   │   ├── 📁 environment/                  # Textures environnement
│   │   │   ├── 📄 stone_wall.png            # Mur pierre
│   │   │   ├── 📄 dungeon_floor.png         # Sol donjon
│   │   │   ├── 📄 grass.png                 # Herbe
│   │   │   └── 📄 water.png                 | Eau
│   │   │
│   │   └── 📁 ui/                           # Textures UI
│   │       ├── 📄 button_normal.png         | Bouton normal
│   │       ├── 📄 button_pressed.png        # Bouton pressé
│   │       └── 📄 panel_background.png      # Fond panel
│   │
│   ├── 📁 audio/                            # Fichiers audio
│   │   ├── 📁 music/                        | Musiques
│   │   │   ├── 📄 main_theme.mp3           # Thème principal
│   │   │   ├── 📄 city_theme.mp3           # Thème ville
│   │   │   ├── 📄 dungeon_theme.mp3        # Thème donjon
│   │   │   ├── 📄 combat_theme.mp3         # Thème combat
│   │   │   └── 📄 boss_theme.mp3           # Thème boss
│   │   │
│   │   ├── 📁 sfx/                          # Effets sonores
│   │   │   ├── 📁 ui/                       # UI
│   │   │   │   ├── 📄 click.mp3            # Clic
│   │   │   │   ├── 📄 hover.mp3            # Survol
│   │   │   │   ├── 📄 notification.mp3     # Notification
│   │   │   │   ├── 📄 levelup.mp3          # Level up
│   │   │   │   └── 📄 evolution.mp3        # Évolution
│   │   │   │
│   │   │   ├── 📁 combat/                   # Combat
│   │   │   │   ├── 📄 slash.mp3            # Coup
│   │   │   │   ├── 📄 magic.mp3            # Magie
│   │   │   │   ├── 📄 hit.mp3              # Impact
│   │   │   │   ├── 📄 critical.mp3         # Coup critique
│   │   │   │   └── 📄 extraction.mp3       # Extraction
│   │   │   │
│   │   │   └── 📁 ambient/                  # Ambiance
│   │   │       ├── 📄 wind.mp3             # Vent
│   │   │       ├── 📄 fire.mp3             # Feu
│   │   │       └── 📄 dungeon_ambient.mp3  # Ambiance donjon
│   │   │
│   │   └── 📁 voice/                        # Voix (optionnel)
│   │       ├── 📄 system_voice.mp3         # Voix du système
│   │       └── 📄 narrator.mp3             # Narrateur
│   │
│   ├── 📁 icons/                            # Icônes PWA
│   │   ├── 📄 icon-72.png                  # 72x72
│   │   ├── 📄 icon-96.png                  # 96x96
│   │   ├── 📄 icon-128.png                 # 128x128
│   │   ├── 📄 icon-144.png                 # 144x144
│   │   ├── 📄 icon-152.png                 # 152x152
│   │   ├── 📄 icon-192.png                 # 192x192
│   │   ├── 📄 icon-384.png                 # 384x384
│   │   ├── 📄 icon-512.png                 # 512x512
│   │   ├── 📄 maskable-icon.png           # Icône adaptable
│   │   └── 📄 favicon.ico                 # Favicon
│   │
│   └── 📁 data/                             # Données JSON
│       ├── 📁 configs/                      # Configurations
│       │   ├── 📄 skills.json              # Compétences
│       │   ├── 📄 enemies.json             # Ennemis
│       │   ├── 📄 items.json               # Objets
│       │   └── 📄 quests.json              # Quêtes
│       │
│       ├── 📁 localization/                 # Localisation
│       │   ├── 📄 en.json                  # Anglais
│       │   ├── 📄 fr.json                  # Français
│       │   ├── 📄 es.json                  # Espagnol
│       │   ├── 📄 de.json                  # Allemand
│       │   ├── 📄 ja.json                  # Japonais
│       │   └── 📄 ko.json                  # Coréen
│       │
│       └── 📁 dialogues/                    # Dialogues
│           ├── 📄 chapter1.json            # Chapitre 1
│           ├── 📄 chapter2.json            # Chapitre 2
│           └── 📄 npc_dialogues.json       # Dialogues PNJ
│
├── 📁 libs/                                 # Bibliothèques externes
│   ├── 📄 three.min.js                     # Three.js (CDN ou local)
│   ├── 📄 GLTFLoader.js                    | Loader GLTF
│   ├── 📄 OrbitControls.js                 | Contrôles caméra
│   ├── 📄 hammer.min.js                    # Hammer.js pour gestes
│   └── 📄 howler.min.js                    # Howler.js (audio alternatif)
│
├── 📁 docs/                                 # Documentation
│   ├── 📄 README.md                        # Documentation projet
│   ├── 📄 API.md                           # Documentation API
│   ├── 📄 ARCHITECTURE.md                  # Architecture technique
│   ├── 📄 SETUP.md                         # Guide d'installation
│   ├── 📄 CONTROLS.md                      # Guide des contrôles
│   └── 📄 ASSETS_GUIDE.md                  # Guide des assets
│
├── 📁 tests/                                # Tests
│   ├── 📁 unit/                            # Tests unitaires
│   │   ├── 📄 evolution.test.js            # Tests système évolution
│   │   ├── 📄 combat.test.js               # Tests combat
│   │   └── 📄 save.test.js                 # Tests sauvegarde
│   │
│   ├── 📁 integration/                     # Tests d'intégration
│   │   ├── 📄 ui.test.js                   # Tests UI
│   │   └── 📄 performance.test.js          # Tests performances
│   │
│   └── 📁 e2e/                             # Tests end-to-end
│       └── 📄 gameplay.test.js             # Tests gameplay
│
├── 📁 scripts/                              # Scripts utilitaires
│   ├── 📄 optimize-assets.py               # Script Python optimisation
│   ├── 📄 convert-models.sh                # Script conversion modèles
│   └── 📄 deploy.sh                        # Script déploiement
│
├── 📁 backup/                               # Sauvegardes (gitignored)
│   ├── 📁 saves/                           # Sauvegardes utilisateurs
│   └── 📁 logs/                            # Logs de débogage
│
└── 📄 package.json                         # Configuration npm
```
