const fs = require('fs-extra');
const path = require('path');
const { minify } = require('terser');
const cleancss = require('clean-css');

class BuildSystem {
    constructor() {
        this.sourceDir = './src';
        this.buildDir = './dist';
        this.version = '2.0.0';
    }
    
    async build() {
        console.log('🚀 Démarrage du build Shadow Monarch...');
        
        // Nettoyer le répertoire de build
        await this.cleanBuildDir();
        
        // Copier les fichiers statiques
        await this.copyStaticFiles();
        
        // Minifier et bundle le JavaScript
        await this.bundleJavaScript();
        
        // Minifier le CSS
        await this.minifyCSS();
        
        // Optimiser les assets
        await this.optimizeAssets();
        
        // Générer le fichier de version
        await this.generateVersionFile();
        
        // Générer le sitemap
        await this.generateSitemap();
        
        console.log('✅ Build terminé avec succès!');
        console.log(`📁 Build disponible dans: ${this.buildDir}`);
    }
    
    async cleanBuildDir() {
        if (fs.existsSync(this.buildDir)) {
            await fs.remove(this.buildDir);
        }
        await fs.ensureDir(this.buildDir);
    }
    
    async copyStaticFiles() {
        const staticFiles = [
            'index.html',
            'manifest.json',
            'service-worker.js',
            'assets/',
            'icons/'
        ];
        
        for (const file of staticFiles) {
            const source = path.join(this.sourceDir, file);
            const dest = path.join(this.buildDir, file);
            
            if (fs.existsSync(source)) {
                if (fs.statSync(source).isDirectory()) {
                    await fs.copy(source, dest);
                } else {
                    await fs.copyFile(source, dest);
                }
                console.log(`📄 Copié: ${file}`);
            }
        }
    }
    
    async bundleJavaScript() {
        const jsFiles = [
            'js/main.js',
            'js/three-app.js',
            'js/config.js',
            'js/loader.js',
            'js/game-systems/evolution-system.js',
            'js/game-systems/combat-system.js',
            'js/game-systems/inventory-system.js',
            'js/game-systems/shadow-army.js',
            'js/ui/touch-controls.js',
            'js/ui/evolution-ui.js',
            'js/utils/save-manager.js',
            'js/utils/performance-monitor.js',
            'js/audio-manager.js'
        ];
        
        let bundle = `// Shadow Monarch Ascension v${this.version}\n`;
        bundle += '// Build: ' + new Date().toISOString() + '\n\n';
        
        for (const file of jsFiles) {
            const filePath = path.join(this.sourceDir, file);
            if (fs.existsSync(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                bundle += `\n// ${file}\n${content}\n`;
                console.log(`🔧 Bundle: ${file}`);
            }
        }
        
        // Minifier
        const minified = await minify(bundle, {
            compress: {
                drop_console: false,
                drop_debugger: true
            },
            mangle: {
                reserved: ['Game', 'EvolutionSystem', 'CombatSystem', 'UI']
            },
            output: {
                comments: false
            }
        });
        
        await fs.writeFile(
            path.join(this.buildDir, 'js/game.bundle.min.js'),
            minified.code
        );
        
        // Également écrire la version non-minifiée pour le débogage
        await fs.writeFile(
            path.join(this.buildDir, 'js/game.bundle.js'),
            bundle
        );
    }
    
    async minifyCSS() {
        const cssFiles = [
            'css/style.css',
            'css/ui-evolution.css',
            'css/responsive.css'
        ];
        
        let combinedCSS = '';
        
        for (const file of cssFiles) {
            const filePath = path.join(this.sourceDir, file);
            if (fs.existsSync(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                combinedCSS += content + '\n';
                console.log(`🎨 CSS: ${file}`);
            }
        }
        
        // Minifier
        const minified = new cleancss({}).minify(combinedCSS);
        
        await fs.writeFile(
            path.join(this.buildDir, 'css/game.bundle.min.css'),
            minified.styles
        );
    }
    
    async optimizeAssets() {
        // Ici, on pourrait intégrer des outils comme:
        // - ImageOptim pour les images
        // - GLTF-Pipeline pour les modèles 3D
        // - FFMPEG pour l'audio
        
        console.log('🖼️  Assets optimisés (placeholder)');
        
        // Pour l'instant, on copie juste les assets
        const assetsSource = path.join(this.sourceDir, 'assets');
        const assetsDest = path.join(this.buildDir, 'assets');
        
        if (fs.existsSync(assetsSource)) {
            await fs.copy(assetsSource, assetsDest);
        }
    }
    
    async generateVersionFile() {
        const versionInfo = {
            version: this.version,
            buildDate: new Date().toISOString(),
            features: [
                'Système d\'évolution complet',
                'Combat tactile avancé',
                'Armée d\'ombre',
                'Sauvegarde locale',
                'PWA support'
            ]
        };
        
        await fs.writeFile(
            path.join(this.buildDir, 'version.json'),
            JSON.stringify(versionInfo, null, 2)
        );
    }
    
    async generateSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://shadowmonarch.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;
        
        await fs.writeFile(
            path.join(this.buildDir, 'sitemap.xml'),
            sitemap
        );
    }
    
    async deploy() {
        console.log('☁️  Déploiement sur Netlify...');
        
        // Ici, on pourrait intégrer avec Netlify CLI, Vercel, etc.
        // Pour l'instant, c'est un placeholder
        
        console.log('✅ Prêt pour le déploiement!');
        console.log('📤 Upload manuel requis vers votre hébergeur');
    }
}

// Exécuter le build
if (require.main === module) {
    const build = new BuildSystem();
    
    const args = process.argv.slice(2);
    if (args.includes('--deploy')) {
        build.build().then(() => build.deploy());
    } else {
        build.build();
    }
}

module.exports = BuildSystem;
