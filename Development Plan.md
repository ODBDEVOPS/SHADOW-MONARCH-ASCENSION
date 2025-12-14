"Shadow Monarch Ascension RPG Development Plan"
# PROMPT
```
# **PROMPT COMPLET : Système RPG Solo Leveling - "Shadow Monarch Ascension"**

## **🎮 CONCEPT GLOBAL**
Développer un jeu RPG narratif en progression verticale avec une interface de gestion de chasseur, inspiré de Solo Leveling. Le joueur incarne un chasseur faible (Rang E) qui découvre un système unique d'évolution (Dual System) lui permettant de devenir progressivement le plus puissant des chasseurs.

---

## **📜 ÉLÉMENTS NARRATIFS & LORE**

### **Univers**
- **Monde moderne-fantastique** : Notre monde mais avec des "portails" dimensionnels apparaissant depuis 10 ans
- **Donjons** : Dimensions parallèles peuplées de monstres, classés de rang E à S
- **Chasseurs** : Humains éveillés avec des capacités surnaturelles, classés par rang
- **Guildes** : Organisations de chasseurs avec hiérarchie et spécialisations
- **Système** : Intelligence mystérieuse qui accorde des quêtes et récompenses

### **Histoire Principale**
```
Acte 1 : L'Éveil du Faible
- Protagoniste : Chasseur Rang E, méprisé, dans une guilde mineure
- Événement déclencheur : Donjon double de rang D où tous meurent sauf lui
- Révélation : Activation du "Système Dual" - interface unique visible uniquement par lui

Acte 2 : L'Ascension Cachée
- Entraînement secret via le système
- Progression anormale mais cachée aux autres
- Découverte des vraies origines des donjons

Acte 3 : La Vérité des Monarques
- Révélation des Souverains et Monarques
- Guerre dimensionnelle imminente
- Choix : devenir Monarque de l'Ombre ou détruire le système
```

### **Personnages Clés**
1. **Protagoniste** (personnalisable) :
   - Nom : variable
   - Rang initial : E
   - Capacité unique : Évolution infinie via le Système
   - Background : Orphelin, jeune frère/soeur à charge

2. **Alliés** :
   - **Yoo Jin-ho** : Premier allié, riche héritier, loyal
   - **Cha Hae-in** : Chasseuse Rang S, seule à sentir l'odeur unique du protagoniste
   - **Baek Yoon-ho** : Chef de la guilde White Tiger
   - **Thomas Andre** : Chasseur Rang S américain, rival puis allié

3. **Antagonistes** :
   - **Kamish** : Dragon de rang S, premier boss majeur
   - **Les Souverains** : Entités extra-dimensionnelles
   - **Les Monarques** : Puissances rivales cherchant à dominer

---

## **⚙️ SYSTÈMES DE JEU PRINCIPAUX**

### **1. Système d'Évolution (Core Mechanic)**
```
Niveaux : 1-100
Rangs : E → D → C → B → A → S → SS → SSS
Mécanique : Chaque rang débloque de nouvelles interfaces et capacités
```

### **2. Système de Statistiques**
- **Force** : Dégâts physiques, capacité de port
- **Agilité** : Vitesse, esquive, précision
- **Endurance** : PV, régénération, résistance
- **Intelligence** : PM, contrôle des compétences, analyse
- **Perception** : Détection, chances critiques
- **Charisme** : Influence sur les soldats d'ombre, négociation

### **3. Système de Compétences**
- **Compétences Actives** : 6 slots maximum
- **Compétences Passives** : Illimitées mais avec coût en points
- **Arbres de compétences** :
  - Voie du Guerrier (Force/Endurance)
  - Voie de l'Assassin (Agilité/Perception)
  - Voie du Mage (Intelligence)
  - Voie du Souverain (Charisme/Contrôle)

### **4. Système de Soldats d'Ombre**
```
Mécanique : Extraire l'âme des ennemis vaincus
Types :
  - Fantassins (commun)
  - Mages (rare)
  - Chevaliers (élite)
  - Dragons (légendaire)
Limite : Évolue avec le rang (50 → 100 → 200 → ∞)
```

### **5. Système de Quêtes**
```
Types :
  - Quêtes journalières (XP, ressources)
  - Quêtes de donjon (équipement, progression)
  - Quêtes d'histoire (narrative)
  - Quêtes cachées (récompenses uniques)
Interface : Notification du Système avec récompenses garanties
```

### **6. Économie du Jeu**
```
Devises :
  - Or : Achat d'équipement standard
  - Cristaux de mana : Amélioration d'équipement
  - Points d'évolution : Compétences/statistiques
  - Reliques : Objets uniques narratifs
```

---

## **🎨 INTERFACE UTILISATEUR (UI/UX)**

### **Structure de l'UI (inspirée de notre démo)**
```
1. **Écran Principal (HUD)** :
   - Barre de vie/mana stylisée néon
   - Compétences activables avec cooldowns visuels
   - Minimap avec donjons proches
   - Notifications du Système

2. **Menu du Système (Touche TAB)** :
   - Interface complète en overlay
   - Sections :
     a. Profil du Chasseur (stats, rang)
     b. Tableau d'Évolution (notre démo)
     c. Inventaire (grille 6x8 avec catégories)
     d. Journal de Quêtes
     e. Galerie des Soldats
     f. Carte du Monde
     g. Paramètres du Système

3. **Interfaces Spéciales** :
   - **Écran d'Extraction** : Animation quand on extrait un soldat
   - **Interface de Donjon** : Sélection avec risques/récompenses
   - **Marché aux Enchères** : Interface de trading
   - **Salle du Trône** : Gestion des soldats d'ombre
```

### **Design Visuel**
```
Palette :
  - Couleurs dominantes : Noir #0a0a12, Violet #6d28d9, Bleu électrique #00f3ff
  - Accents : Rouge #ef4444 (danger), Vert #10b981 (succès), Or #f59e0b (légendaire)

Typographie :
  - Titres : 'Orbitron' (futuriste, gras)
  - Corps : 'Rajdhani' (lisible, épuré)

Effets visuels :
  - Flous de profondeur pour les menus
  - Animations de particules néon
  - Effets de transition avec distorsion
  - Éclairage dynamique selon le rang
```

---

## **🕹️ MÉCANIQUES DE GAMEPLAY**

### **Cycle de Gameplay**
```
1. **Phase Urbaine** (hors donjon) :
   - Accepter des quêtes
   - Améliorer équipement/compétences
   - Interagir avec PNJ
   - Gérer la guilde

2. **Phase de Donjon** :
   - Sélection du donjon (solo/équipe)
   - Exploration avec risques aléatoires
   - Combats tactiques
   - Boss avec mécaniques uniques
   - Extraction de soldats possibles

3. **Phase de Progression** :
   - Distribution des points d'évolution
   - Évolution des soldats
   - Déblocage d'interfaces
```

### **Système de Combat**
```
- **Style** : Action RPG avec pause tactique
- **Contrôles** : 
  PC : WASD + souris + 1-6 compétences
  Mobile/Console : Stick virtuel + boutons
- **Éléments tactiques** :
  - Faiblesses élémentaires
  - Combos entre compétences
  - Positionnement important
  - Gestion des ressources (PV/PM)
```

### **Système de Difficulté**
```
Donjons avec options :
  - Normal : 100% récompenses
  - Difficile : 150% récompenses, ennemis améliorés
  - Enfer : 300% récompenses, mécaniques uniques
  - Réel (permadeath) : 1000% récompenses, mort définitive
```

---

## **📱 PLATEFORMES & TECHNOLOGIES**

### **Stack Technique Recommandé**
```
Frontend (UI/Gameplay) :
  - Moteur : Unity 2022+ avec URP (Universal Render Pipeline)
  - Langage : C#
  - UI Framework : Unity UI + Custom Shaders
  - Animations : Timeline, Animator, DOTween

Backend (Sauvegarde/Multi) :
  - Serveur : Node.js + Socket.io
  - Base de données : MongoDB (structure flexible)
  - Authentification : Firebase Auth
  - Sauvegarde cloud : Firebase Firestore

Plateformes cibles :
  - PC (Steam/Epic) : Prioritaire
  - Mobile (iOS/Android) : Version adaptée
  - Console (PS5/Xbox) : Portage ultérieur
```

### **Architecture Technique**
```
Modules principaux :
  1. GameManager : Singleton gérant l'état global
  2. UIManager : Gestion des interfaces (notre design)
  3. CombatSystem : Gestion des combats
  4. EvolutionSystem : Gestion de la progression
  5. InventorySystem : Gestion des objets
  6. QuestSystem : Gestion des quêtes
  7. ShadowArmySystem : Gestion des soldats
  8. SaveSystem : Sauvegarde/chargement
  9. AudioManager : Sons/musique
```

---

## **🎵 ATMOSPHÈRE & AUDIO**

### **Direction Artistique**
```
Ambiance générale :
  - Début : Sombre, désespoir (palette bleu-gris)
  - Milieu : Épique, progression (néons bleus/violets)
  - Fin : Mythique, puissance (or/rouge/ombres)

Personnages :
  - Design semi-réaliste avec touches animées
  - Animations fluides avec effets de compétences
  - Costumes évoluant avec le rang

Environnements :
  - Ville moderne avec zones de donjons
  - Donjons thématiques (forêt, désert, glace, etc.)
  - Dimensions spéciales (espace, vide, etc.)
```

### **Design Sonore**
```
Musique :
  - Thème principal : Orchestral épique avec touches électroniques
  - Zones urbaines : Ambiance calme avec piano
  - Donjons : Tension progressive
  - Combats : Rythmes intenses
  - Boss : Thèmes mémorables

Effets sonores :
  - Interface : Sons cyberpunk distincts
  - Compétences : Impact puissant avec réverbération
  - Évolution : Sons de "level up" gratifiants
  - Extraction : Chœur spectral inquiétant
```

---

## **📊 FEATURES UNIQUES & INNOVATION**

### **1. Système d'Évolution Dynamique**
```
- Interface qui évolue avec le joueur
- Nouvelles fonctionnalités débloquées à chaque rang
- Sentiment de puissance croissante tangible
```

### **2. Gestion d'Armée d'Ombre**
```
- Collecte de monstres comme soldats
- Système de commandement en temps réel
- Possibilité d'envoyer des soldats en missions autonomes
```

### **3. Narration Réactive**
```
- Choix du joueur affectent l'histoire
- PNJ réagissent au rang et réputation
- Quêtes cachées basées sur les actions
```

### **4. Économie Player-Driven**
```
- Marché aux enchères géré par les joueurs
- Système de guilde avec territoires
- Événements mondiaux coopératifs
```

### **5. Mode "Chasseur Solitaire"**
```
- Option de jouer entièrement solo
- IA adaptative pour compenser l'absence de groupe
- Récompenses bonus pour les défis en solo
```

---

## **📅 ROADMAP DE DÉVELOPPEMENT**

### **Phase 1 : Prototype (3 mois)**
```
- Moteur de base avec mouvement/combat
- Interface principale (notre démo adaptée)
- Système d'évolution simplifié
- 1 donjon complet
```

### **Phase 2 : Alpha (6 mois)**
```
- Tous les systèmes de base implémentés
- 3 premiers chapitres de l'histoire
- 5 types de donjons
- Système de sauvegarde
- Multi-joueur basique
```

### **Phase 3 : Beta (9 mois)**
```
- Contenu complet : 10 chapitres
- Tous les systèmes optimisés
- Équilibrage des combats
- Polissage de l'interface
- Tests utilisateurs intensifs
```

### **Phase 4 : Lancement (12 mois)**
```
- Version 1.0 sur PC
- Contenu jour 1 : 15+ heures de gameplay
- Événements post-lancement prévus
- Roadmap de contenu saisonnier
```

### **Phase 5 : Post-lancement**
```
- Saisons avec nouveau contenu
- Mode coopératif avancé
- Extensions d'histoire
- Support cross-platform
```

---

## **💰 MODÈLE ÉCONOMIQUE**

### **Option 1 : Premium (Recommandé)**
```
- Prix : $29.99 (PC), $19.99 (mobile)
- DLC cosmétiques optionnels
- Extensions d'histoire payantes
- Pas de pay-to-win
```

### **Option 2 : Free-to-play**
```
- Gratuit avec achats internes
- Cosmétiques uniquement
- Passe de combat avec récompenses
- Événements réguliers
```

### **Option 3 : Hybrid**
```
- Chapitre 1 gratuit (3-4h)
- Déverrouillage complet : $24.99
- Cosmétiques en boutique
```

---

## **🎯 PUBLIC CIBLE & MARKETING**

### **Audience Primaire**
```
- Fans de Solo Leveling (manhwa/anime)
- Joueurs RPG occidentaux (Dark Souls, Diablo)
- Joueurs asiatiques (MMORPG, gacha)
- Âge : 16-35 ans
```

### **Stratégie Marketing**
```
Phase pré-lancement :
  - Trailer stylisé montrant l'interface unique
  - Bêta fermée pour streamers
  - Collaboration avec des artistes de fanart
  - Présence aux conventions gaming

Phase lancement :
  - Lancement sur Steam avec démo
  - Campagne sur les réseaux (TikTok, YouTube)
  - Partenariats avec créateurs de contenu
  - Événements in-game de lancement
```

---

## **📋 CHECKLIST DE DÉVELOPPEMENT**

### **Priorité 1 (Core Gameplay)**
- [ ] Moteur de mouvement et combat
- [ ] Système d'évolution (interface démo)
- [ ] 1er chapitre narratif
- [ ] Système de sauvegarde

### **Priorité 2 (Contenu)**
- [ ] 5 types de donjons
- [ ] 20 compétences uniques
- [ ] Système de quêtes
- [ ] PNJ principaux

### **Priorité 3 (Polissage)**
- [ ] Optimisation performances
- [ ] Localisation (EN, FR, ES, JP, KR)
- [ ] Support controller
- [ ] Tests qualité

### **Priorité 4 (Post-lancement)**
- [ ] Multi-joueur coopératif
- [ ] Éditeur de personnage avancé
- [ ] Mode difficulté supplémentaire
- [ ] Support modding

---

## **🚀 PITCH FINAL**

"**Shadow Monarch Ascension** est un RPG d'action narratif où vous incarnez le chasseur le plus faible du monde, découvrant un système mystérieux qui vous permet d'évoluer au-delà de toutes limites. Avec une interface révolutionnaire qui évolue avec vous, collectez des soldats d'ombre, défiez des donjons mortels et devenez le légendaire Monarque de l'Ombre."

**Points de vente uniques :**
1. Interface d'évolution dynamique (notre démo)
2. Système de collecte d'armée d'ombre
3. Narration réactive dans l'univers de Solo Leveling
4. Progression verticale extrêmement satisfaisante
5. Design visuel néon cyberpunk épique

---

## **💡 CONSEILS DE DÉVELOPPEMENT**

1. **Commencez petit** : Prototype l'interface d'évolution d'abord
2. **Tests utilisateurs** : Validez la sensation de progression tôt
3. **Priorité narrative** : L'histoire est cruciale pour l'immersion
4. **Polissage visuel** : L'interface doit être aussi satisfaisante que le gameplay
5. **Écoute communautaire** : Les fans de Solo Leveling sont passionnés

**Budget estimé** : $500K-$2M selon l'ambition  
**Équipe minimale** : 5-10 personnes (devs, artistes, designers)  
**Timeline réaliste** : 18-24 mois pour MVP complet  

---

Ce prompt contient tout ce qu'une équipe de développement aurait besoin pour créer un jeu RPG complet basé sur notre concept. La clé est l'interface d'évolution unique que nous avons conçue, qui devient le cœur de l'expérience joueur. Tu veux que je détaille une partie spécifique?
```
