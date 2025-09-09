/**
 * Scene Manager - 3D scene management with WebGL rendering
 * Handles camera, lighting, backgrounds, and 3D rendering pipeline
 */

export class SceneManager {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.isInitialized = false;
        
        // Scene objects
        this.camera = null;
        this.lights = [];
        this.background = null;
        this.objects = [];
        
        // Rendering state
        this.renderingEnabled = true;
        this.wireframeMode = false;
        
        // Camera properties
        this.cameraPosition = { x: 0, y: 1.5, z: 5 };
        this.cameraTarget = { x: 0, y: 1, z: 0 };
        this.cameraZoom = 1.0;
        this.cameraRotation = 0;
        
        // Matrices
        this.viewMatrix = null;
        this.projectionMatrix = null;
        this.modelMatrix = null;
    }
    
    /**
     * Initialize the scene
     */
    async initialize() {
        this.setupCamera();
        this.setupLighting();
        this.setupBackground();
        
        this.isInitialized = true;
        console.log('🎬 Scene Manager initialized');
    }
    
    /**
     * Set up camera
     */
    setupCamera() {
        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }
    
    /**
     * Set up lighting
     */
    setupLighting() {
        // Add default lighting
        this.lights = [
            {
                type: 'directional',
                direction: { x: -1, y: -1, z: -1 },
                color: { r: 1, g: 1, b: 1 },
                intensity: 1.0
            },
            {
                type: 'ambient',
                color: { r: 0.3, g: 0.3, b: 0.4 },
                intensity: 0.5
            }
        ];
    }
    
    /**
     * Set up default background
     */
    setupBackground() {
        this.background = {
            type: 'gradient',
            topColor: { r: 0.2, g: 0.3, b: 0.5 },
            bottomColor: { r: 0.1, g: 0.1, b: 0.2 }
        };
    }
    
    /**
     * Update scene
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update camera if needed
        this.updateViewMatrix();
        
        // Update scene objects
        this.objects.forEach(object => {
            if (object.update) {
                object.update(deltaTime);
            }
        });
    }
    
    /**
     * Render the scene
     */
    render() {
        if (!this.isInitialized || !this.renderingEnabled) return;
        
        // Clear the screen
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Render background
        this.renderBackground();
        
        // Render scene objects
        this.objects.forEach(object => {
            if (object.render) {
                object.render(this.gl, this.viewMatrix, this.projectionMatrix);
            }
        });
    }
    
    /**
     * Render background
     */
    renderBackground() {
        // Simple gradient background for now
        const topColor = this.background.topColor;
        const bottomColor = this.background.bottomColor;
        
        // This would typically use a shader to render a gradient
        this.gl.clearColor(bottomColor.r, bottomColor.g, bottomColor.b, 1.0);
    }
    
    /**
     * Update projection matrix
     */
    updateProjectionMatrix() {
        const aspect = this.canvas.width / this.canvas.height;
        const fov = 45 * Math.PI / 180;
        const near = 0.1;
        const far = 100.0;
        
        this.projectionMatrix = this.createPerspectiveMatrix(fov, aspect, near, far);
    }
    
    /**
     * Update view matrix
     */
    updateViewMatrix() {
        // Apply zoom and rotation
        const distance = 5.0 / this.cameraZoom;
        const angle = this.cameraRotation * Math.PI / 180;
        
        this.cameraPosition.x = Math.sin(angle) * distance;
        this.cameraPosition.z = Math.cos(angle) * distance;
        
        this.viewMatrix = this.createLookAtMatrix(
            this.cameraPosition,
            this.cameraTarget,
            { x: 0, y: 1, z: 0 } // up vector
        );
    }
    
    /**
     * Set camera zoom
     */
    setCameraZoom(zoom) {
        this.cameraZoom = Math.max(0.1, Math.min(10.0, zoom));
        this.updateViewMatrix();
    }
    
    /**
     * Set camera rotation
     */
    setCameraRotation(rotation) {
        this.cameraRotation = rotation % 360;
        this.updateViewMatrix();
    }
    
    /**
     * Set camera preset
     */
    setCameraPreset(preset) {
        switch (preset) {
            case 'front':
                this.cameraRotation = 0;
                this.cameraPosition.y = 1.5;
                break;
            case 'side':
                this.cameraRotation = 90;
                this.cameraPosition.y = 1.5;
                break;
            case 'top':
                this.cameraRotation = 0;
                this.cameraPosition.y = 5;
                break;
            case 'diagonal':
                this.cameraRotation = 45;
                this.cameraPosition.y = 2;
                break;
        }
        this.updateViewMatrix();
    }
    
    /**
     * Load background from file
     */
    async loadBackground(file) {
        try {
            if (file.type.startsWith('image/')) {
                await this.loadImageBackground(file);
            } else if (file.type.startsWith('video/')) {
                await this.loadVideoBackground(file);
            }
            console.log(`Background loaded: ${file.name}`);
        } catch (error) {
            console.error('Failed to load background:', error);
        }
    }
    
    /**
     * Load preset background
     */
    loadPresetBackground(preset) {
        switch (preset) {
            case 'stage1':
                this.background = {
                    type: 'gradient',
                    topColor: { r: 0.8, g: 0.2, b: 0.8 },
                    bottomColor: { r: 0.2, g: 0.1, b: 0.4 }
                };
                break;
            case 'stage2':
                this.background = {
                    type: 'gradient',
                    topColor: { r: 0.1, g: 0.1, b: 0.3 },
                    bottomColor: { r: 0.0, g: 0.0, b: 0.1 }
                };
                break;
            case 'studio':
                this.background = {
                    type: 'gradient',
                    topColor: { r: 0.9, g: 0.9, b: 0.9 },
                    bottomColor: { r: 0.7, g: 0.7, b: 0.7 }
                };
                break;
            default:
                this.setupBackground();
        }
        console.log(`Preset background loaded: ${preset}`);
    }
    
    /**
     * Load image background
     */
    async loadImageBackground(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.background = {
                    type: 'image',
                    image: img,
                    texture: this.createTextureFromImage(img)
                };
                resolve();
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    
    /**
     * Load video background
     */
    async loadVideoBackground(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadeddata = () => {
                this.background = {
                    type: 'video',
                    video: video,
                    texture: this.createTextureFromVideo(video)
                };
                resolve();
            };
            video.onerror = reject;
            video.src = URL.createObjectURL(file);
            video.loop = true;
            video.muted = true; // Required for autoplay
        });
    }
    
    /**
     * Create WebGL texture from image
     */
    createTextureFromImage(image) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        return texture;
    }
    
    /**
     * Create WebGL texture from video
     */
    createTextureFromVideo(video) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, video);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        return texture;
    }
    
    /**
     * Handle canvas resize
     */
    onResize(width, height) {
        this.updateProjectionMatrix();
    }
    
    /**
     * Add object to scene
     */
    addObject(object) {
        this.objects.push(object);
    }
    
    /**
     * Remove object from scene
     */
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
    
    /**
     * Reset scene
     */
    reset() {
        this.objects = [];
        this.setupBackground();
        this.setupLighting();
        this.cameraZoom = 1.0;
        this.cameraRotation = 0;
        this.updateViewMatrix();
    }
    
    /**
     * Serialize scene state
     */
    serialize() {
        return {
            camera: {
                position: this.cameraPosition,
                target: this.cameraTarget,
                zoom: this.cameraZoom,
                rotation: this.cameraRotation
            },
            background: this.background,
            lights: this.lights
        };
    }
    
    /**
     * Deserialize scene state
     */
    deserialize(data) {
        if (data.camera) {
            this.cameraPosition = data.camera.position;
            this.cameraTarget = data.camera.target;
            this.cameraZoom = data.camera.zoom;
            this.cameraRotation = data.camera.rotation;
            this.updateViewMatrix();
        }
        if (data.background) {
            this.background = data.background;
        }
        if (data.lights) {
            this.lights = data.lights;
        }
    }
    
    /**
     * Matrix utilities
     */
    createPerspectiveMatrix(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }
    
    createLookAtMatrix(eye, target, up) {
        const zAxis = this.normalize([eye.x - target.x, eye.y - target.y, eye.z - target.z]);
        const xAxis = this.normalize(this.cross([up.x, up.y, up.z], zAxis));
        const yAxis = this.cross(zAxis, xAxis);
        
        return [
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -this.dot(xAxis, [eye.x, eye.y, eye.z]),
            -this.dot(yAxis, [eye.x, eye.y, eye.z]),
            -this.dot(zAxis, [eye.x, eye.y, eye.z]),
            1
        ];
    }
    
    normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (length > 0.00001) {
            return [v[0] / length, v[1] / length, v[2] / length];
        }
        return [0, 0, 0];
    }
    
    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    
    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
}