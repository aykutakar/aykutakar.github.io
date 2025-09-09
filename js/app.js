/**
 * Anime Dance Animation Generator - Main Application Entry Point
 * Modern ES6+ implementation with modular architecture
 */

import { SceneManager } from './modules/scene-manager.js';
import { AudioManager } from './modules/audio-manager.js';
import { AvatarManager } from './modules/avatar-manager.js';
import { DanceEngine, EffectsManager, TimelineManager, ExportManager, ProjectManager } from './modules/stub-modules.js';
import { UIManager } from './modules/ui-manager.js';
import { PerformanceMonitor } from './modules/performance-monitor.js';
import { NotificationSystem } from './modules/notification-system.js';

/**
 * Main Application Class
 * Coordinates all modules and manages the overall application state
 */
class AnimeGenerator {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.currentTime = 0;
        this.totalDuration = 0;
        
        // Core modules
        this.scene = null;
        this.audio = null;
        this.avatar = null;
        this.dance = null;
        this.effects = null;
        this.timeline = null;
        this.export = null;
        this.ui = null;
        this.performance = null;
        this.project = null;
        this.notifications = null;
        
        // Canvas and WebGL context
        this.canvas = null;
        this.gl = null;
        
        // Application state
        this.state = {
            currentProject: null,
            isDirty: false,
            isExporting: false,
            selectedTool: 'move',
            playbackMode: 'loop'
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🎭 Initializing Anime Dance Animation Generator...');
            
            // Show loading overlay
            this.showLoading('Initializing application...');
            
            // Initialize canvas and WebGL
            await this.initializeCanvas();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI
            await this.ui.initialize();
            
            // Start render loop
            this.startRenderLoop();
            
            this.isInitialized = true;
            this.hideLoading();
            
            // Show welcome notification
            this.notifications.show({
                type: 'success',
                title: 'Welcome!',
                message: 'Anime Dance Animation Generator is ready to create amazing animations!'
            });
            
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.notifications.show({
                type: 'error',
                title: 'Initialization Error',
                message: `Failed to start the application: ${error.message}`
            });
            this.hideLoading();
        }
    }
    
    /**
     * Initialize canvas and WebGL context
     */
    async initializeCanvas() {
        this.canvas = document.getElementById('mainCanvas');
        if (!this.canvas) {
            throw new Error('Main canvas element not found');
        }
        
        // Try to get WebGL2 context first, fallback to WebGL1
        this.gl = this.canvas.getContext('webgl2', {
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        if (!this.gl) {
            this.gl = this.canvas.getContext('webgl', {
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance'
            });
        }
        
        if (!this.gl) {
            throw new Error('WebGL not supported. Please use a modern browser.');
        }
        
        // Set up canvas properties
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        
        // Enable WebGL features
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        console.log(`🎨 WebGL${this.gl instanceof WebGL2RenderingContext ? '2' : '1'} context initialized`);
    }
    
    /**
     * Initialize all core modules
     */
    async initializeModules() {
        // Initialize notification system first
        this.notifications = new NotificationSystem();
        this.notifications.initialize();
        
        // Initialize performance monitor
        this.performance = new PerformanceMonitor();
        this.performance.startMonitoring();
        
        // Initialize core rendering and scene management
        this.scene = new SceneManager(this.gl, this.canvas);
        await this.scene.initialize();
        
        // Initialize audio system
        this.audio = new AudioManager();
        await this.audio.initialize();
        
        // Initialize avatar system
        this.avatar = new AvatarManager(this.scene);
        await this.avatar.initialize();
        
        // Initialize dance engine with AI capabilities
        this.dance = new DanceEngine(this.avatar, this.audio);
        await this.dance.initialize();
        
        // Initialize effects system
        this.effects = new EffectsManager(this.scene);
        await this.effects.initialize();
        
        // Initialize timeline manager
        this.timeline = new TimelineManager();
        this.timeline.initialize();
        
        // Initialize export manager
        this.export = new ExportManager(this.scene, this.audio);
        this.export.initialize();
        
        // Initialize project manager
        this.project = new ProjectManager();
        this.project.initialize();
        
        // Initialize UI manager
        this.ui = new UIManager(this);
        
        console.log('🔧 All modules initialized');
    }
    
    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Window events
        window.addEventListener('resize', this.onResize);
        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // Canvas events
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        console.log('📡 Event listeners set up');
    }
    
    /**
     * Start the main render loop
     */
    startRenderLoop() {
        let lastTime = 0;
        
        const renderLoop = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            
            // Update application state
            this.update(deltaTime);
            
            // Render frame
            this.render();
            
            // Update performance metrics
            this.performance.updateFrame(deltaTime);
            
            // Continue loop
            requestAnimationFrame(renderLoop);
        };
        
        requestAnimationFrame(renderLoop);
        console.log('🎬 Render loop started');
    }
    
    /**
     * Update application state
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update modules
        if (this.isPlaying) {
            this.currentTime += deltaTime * 0.001; // Convert to seconds
            
            // Update timeline
            this.timeline.update(this.currentTime);
            
            // Update audio
            this.audio.update(deltaTime);
            
            // Update dance engine
            this.dance.update(deltaTime);
            
            // Update effects
            this.effects.update(deltaTime);
            
            // Check if we've reached the end
            if (this.totalDuration > 0 && this.currentTime >= this.totalDuration) {
                if (this.state.playbackMode === 'loop') {
                    this.currentTime = 0;
                    this.audio.seek(0);
                } else {
                    this.pause();
                }
            }
        }
        
        // Update scene
        this.scene.update(deltaTime);
        
        // Update avatar
        this.avatar.update(deltaTime);
        
        // Update UI
        this.ui.update(deltaTime);
    }
    
    /**
     * Render the current frame
     */
    render() {
        if (!this.isInitialized) return;
        
        // Clear canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Render scene
        this.scene.render();
        
        // Render avatar
        this.avatar.render();
        
        // Render effects
        this.effects.render();
    }
    
    /**
     * Playback controls
     */
    play() {
        if (!this.audio.hasAudio()) {
            this.notifications.show({
                type: 'warning',
                title: 'No Audio',
                message: 'Please load an audio file first.'
            });
            return;
        }
        
        this.isPlaying = true;
        this.audio.play();
        this.dance.start();
        this.ui.updatePlaybackControls();
        
        console.log('▶️ Playback started');
    }
    
    pause() {
        this.isPlaying = false;
        this.audio.pause();
        this.dance.pause();
        this.ui.updatePlaybackControls();
        
        console.log('⏸️ Playback paused');
    }
    
    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.audio.stop();
        this.dance.stop();
        this.timeline.seekTo(0);
        this.ui.updatePlaybackControls();
        
        console.log('⏹️ Playback stopped');
    }
    
    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.totalDuration));
        this.audio.seek(this.currentTime);
        this.timeline.seekTo(this.currentTime);
        this.dance.seekTo(this.currentTime);
        this.ui.updateTimeDisplay();
        
        console.log(`⏯️ Seeked to ${this.currentTime.toFixed(2)}s`);
    }
    
    /**
     * Project management
     */
    async newProject() {
        if (this.state.isDirty) {
            const save = await this.ui.showConfirmDialog(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to save before creating a new project?'
            );
            
            if (save) {
                await this.saveProject();
            }
        }
        
        this.stop();
        await this.project.createNew();
        this.state.currentProject = this.project.current;
        this.state.isDirty = false;
        this.resetScene();
        
        this.notifications.show({
            type: 'success',
            title: 'New Project',
            message: 'New project created successfully!'
        });
    }
    
    async loadProject() {
        try {
            const projectData = await this.project.load();
            if (projectData) {
                this.stop();
                await this.loadProjectData(projectData);
                this.state.currentProject = projectData;
                this.state.isDirty = false;
                
                this.notifications.show({
                    type: 'success',
                    title: 'Project Loaded',
                    message: 'Project loaded successfully!'
                });
            }
        } catch (error) {
            this.notifications.show({
                type: 'error',
                title: 'Load Error',
                message: `Failed to load project: ${error.message}`
            });
        }
    }
    
    async saveProject() {
        try {
            const projectData = await this.createProjectData();
            await this.project.save(projectData);
            this.state.currentProject = projectData;
            this.state.isDirty = false;
            
            this.notifications.show({
                type: 'success',
                title: 'Project Saved',
                message: 'Project saved successfully!'
            });
        } catch (error) {
            this.notifications.show({
                type: 'error',
                title: 'Save Error',
                message: `Failed to save project: ${error.message}`
            });
        }
    }
    
    /**
     * Audio loading
     */
    async loadAudio(file) {
        try {
            this.showLoading('Loading audio file...');
            
            await this.audio.loadFile(file);
            this.totalDuration = this.audio.getDuration();
            this.timeline.setDuration(this.totalDuration);
            this.ui.updateTimeDisplay();
            
            this.hideLoading();
            this.notifications.show({
                type: 'success',
                title: 'Audio Loaded',
                message: `${file.name} loaded successfully!`
            });
            
            // Auto-generate dance if enabled
            if (this.ui.getAutoGenerateDance()) {
                await this.generateDance();
            }
            
        } catch (error) {
            this.hideLoading();
            this.notifications.show({
                type: 'error',
                title: 'Audio Load Error',
                message: `Failed to load audio: ${error.message}`
            });
        }
    }
    
    /**
     * Dance generation
     */
    async generateDance() {
        try {
            this.showLoading('Generating AI choreography...');
            
            const style = this.ui.getSelectedDanceStyle();
            const intensity = this.ui.getDanceIntensity();
            
            await this.dance.generateChoreography({
                style,
                intensity,
                duration: this.totalDuration,
                beatData: this.audio.getBeatData()
            });
            
            this.hideLoading();
            this.notifications.show({
                type: 'success',
                title: 'Dance Generated',
                message: `${style} choreography generated successfully!`
            });
            
            this.markDirty();
            
        } catch (error) {
            this.hideLoading();
            this.notifications.show({
                type: 'error',
                title: 'Generation Error',
                message: `Failed to generate dance: ${error.message}`
            });
        }
    }
    
    /**
     * Export functionality
     */
    async exportVideo(options) {
        try {
            this.state.isExporting = true;
            this.ui.showExportProgress();
            
            await this.export.exportVideo({
                format: options.format,
                quality: options.quality,
                resolution: options.resolution,
                fps: options.fps,
                onProgress: (progress) => {
                    this.ui.updateExportProgress(progress);
                }
            });
            
            this.state.isExporting = false;
            this.ui.hideExportProgress();
            
            this.notifications.show({
                type: 'success',
                title: 'Export Complete',
                message: 'Video exported successfully!'
            });
            
        } catch (error) {
            this.state.isExporting = false;
            this.ui.hideExportProgress();
            
            this.notifications.show({
                type: 'error',
                title: 'Export Error',
                message: `Failed to export video: ${error.message}`
            });
        }
    }
    
    /**
     * Utility methods
     */
    markDirty() {
        this.state.isDirty = true;
        this.ui.updateTitle();
    }
    
    resetScene() {
        this.scene.reset();
        this.avatar.reset();
        this.dance.reset();
        this.effects.reset();
        this.timeline.reset();
        this.currentTime = 0;
        this.totalDuration = 0;
        this.ui.updateTimeDisplay();
    }
    
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = overlay.querySelector('.loading-text');
        text.textContent = message;
        overlay.classList.add('active');
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
    }
    
    /**
     * Event handlers
     */
    onResize() {
        const rect = this.canvas.getBoundingClientRect();
        const scale = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * scale;
        this.canvas.height = rect.height * scale;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.scene) {
            this.scene.onResize(this.canvas.width, this.canvas.height);
        }
    }
    
    onVisibilityChange() {
        if (document.hidden && this.isPlaying) {
            this.pause();
        }
    }
    
    onBeforeUnload(event) {
        if (this.state.isDirty) {
            event.preventDefault();
            event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return event.returnValue;
        }
    }
    
    onKeyDown(event) {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    this.newProject();
                    break;
                case 'o':
                    event.preventDefault();
                    this.loadProject();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveProject();
                    break;
                case 'e':
                    event.preventDefault();
                    this.ui.showExportModal();
                    break;
            }
        }
        
        // Playback shortcuts
        switch (event.key) {
            case ' ':
                event.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
                break;
            case 'Escape':
                this.stop();
                break;
        }
    }
    
    /**
     * Create project data for saving
     */
    async createProjectData() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            audio: await this.audio.serialize(),
            avatar: await this.avatar.serialize(),
            dance: await this.dance.serialize(),
            effects: await this.effects.serialize(),
            timeline: this.timeline.serialize(),
            scene: this.scene.serialize(),
            settings: {
                playbackMode: this.state.playbackMode
            }
        };
    }
    
    /**
     * Load project data
     */
    async loadProjectData(data) {
        if (data.audio) await this.audio.deserialize(data.audio);
        if (data.avatar) await this.avatar.deserialize(data.avatar);
        if (data.dance) await this.dance.deserialize(data.dance);
        if (data.effects) await this.effects.deserialize(data.effects);
        if (data.timeline) this.timeline.deserialize(data.timeline);
        if (data.scene) this.scene.deserialize(data.scene);
        if (data.settings) {
            this.state.playbackMode = data.settings.playbackMode || 'loop';
        }
        
        this.totalDuration = this.audio.getDuration();
        this.timeline.setDuration(this.totalDuration);
        this.ui.updateTimeDisplay();
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Anime Dance Animation Generator...');
    
    const app = new AnimeGenerator();
    window.animeGenerator = app; // Make available globally for debugging
    
    app.init().catch(error => {
        console.error('Failed to start application:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #1a1a2e; color: #ffffff; padding: 2rem; border-radius: 8px; 
                        border: 1px solid #ff6b9d; text-align: center; z-index: 5000;">
                <h2 style="color: #ff6b9d; margin-bottom: 1rem;">⚠️ Startup Error</h2>
                <p style="margin-bottom: 1rem;">Failed to initialize the application:</p>
                <code style="background: #0f3460; padding: 0.5rem; border-radius: 4px; display: block;">
                    ${error.message}
                </code>
                <p style="margin-top: 1rem; color: #b8b8cc; font-size: 0.9rem;">
                    Please refresh the page or check the console for more details.
                </p>
            </div>
        `;
        document.body.appendChild(errorDiv);
    });
});

export default AnimeGenerator;