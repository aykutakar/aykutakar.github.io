/**
 * Performance Monitor - Tracks FPS, memory usage, and rendering performance
 * Provides real-time feedback for optimization
 */

export class PerformanceMonitor {
    constructor() {
        this.isMonitoring = false;
        this.frameCount = 0;
        this.lastTime = 0;
        this.frameTimeHistory = [];
        this.maxHistoryLength = 60; // Store last 60 frames
        
        // Performance metrics
        this.metrics = {
            fps: 60,
            averageFps: 60,
            frameTime: 16.67, // ms
            memoryUsage: 0, // MB
            drawCalls: 0,
            triangles: 0,
            gpuMemory: 0
        };
        
        // Thresholds for warnings
        this.thresholds = {
            lowFps: 30,
            highMemory: 500, // MB
            criticalMemory: 1000 // MB
        };
        
        // UI elements
        this.fpsDisplay = null;
        this.memoryDisplay = null;
        this.webglDisplay = null;
        
        // Performance tracking
        this.performanceObserver = null;
    }
    
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        this.isMonitoring = true;
        this.lastTime = performance.now();
        
        // Set up UI references
        this.setupUIReferences();
        
        // Set up memory monitoring
        this.setupMemoryMonitoring();
        
        // Set up performance observer if available
        this.setupPerformanceObserver();
        
        console.log('📊 Performance monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        console.log('📊 Performance monitoring stopped');
    }
    
    /**
     * Set up UI element references
     */
    setupUIReferences() {
        this.fpsDisplay = document.getElementById('fpsCounter');
        this.memoryDisplay = document.getElementById('memoryUsage');
        this.webglDisplay = document.getElementById('webglStatus');
        
        // Update WebGL status
        if (this.webglDisplay) {
            const canvas = document.getElementById('mainCanvas');
            const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
            this.webglDisplay.textContent = gl ? (gl instanceof WebGL2RenderingContext ? '✅ WebGL2' : '✅ WebGL1') : '❌ Not Available';
        }
    }
    
    /**
     * Set up memory monitoring
     */
    setupMemoryMonitoring() {
        // Monitor memory every 5 seconds
        setInterval(() => {
            this.updateMemoryUsage();
        }, 5000);
    }
    
    /**
     * Set up Performance Observer for detailed metrics
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            // Custom performance measures
                            console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                        }
                    });
                });
                
                this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                console.warn('Performance Observer not fully supported:', e);
            }
        }
    }
    
    /**
     * Update frame performance metrics
     */
    updateFrame(deltaTime) {
        if (!this.isMonitoring) return;
        
        this.frameCount++;
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastTime;
        
        // Add to frame time history
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistoryLength) {
            this.frameTimeHistory.shift();
        }
        
        // Calculate FPS from frame time
        this.metrics.fps = frameTime > 0 ? 1000 / frameTime : 60;
        this.metrics.frameTime = frameTime;
        
        // Calculate average FPS
        if (this.frameTimeHistory.length > 10) {
            const averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
            this.metrics.averageFps = 1000 / averageFrameTime;
        }
        
        // Update UI every 10 frames
        if (this.frameCount % 10 === 0) {
            this.updateUI();
        }
        
        this.lastTime = currentTime;
        
        // Check for performance issues
        this.checkPerformanceThresholds();
    }
    
    /**
     * Update memory usage metrics
     */
    updateMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
            this.metrics.totalMemory = memory.totalJSHeapSize / (1024 * 1024);
            this.metrics.memoryLimit = memory.jsHeapSizeLimit / (1024 * 1024);
        } else {
            // Fallback estimation
            this.metrics.memoryUsage = this.estimateMemoryUsage();
        }
    }
    
    /**
     * Estimate memory usage for browsers that don't support performance.memory
     */
    estimateMemoryUsage() {
        // Very rough estimation based on canvas size and loaded assets
        const canvas = document.getElementById('mainCanvas');
        if (!canvas) return 0;
        
        const canvasMemory = (canvas.width * canvas.height * 4) / (1024 * 1024); // RGBA bytes to MB
        const baseMemory = 50; // Estimated base memory for the app
        
        return baseMemory + canvasMemory;
    }
    
    /**
     * Update rendering metrics
     */
    updateRenderingMetrics(drawCalls, triangles) {
        this.metrics.drawCalls = drawCalls || 0;
        this.metrics.triangles = triangles || 0;
    }
    
    /**
     * Update GPU memory usage
     */
    updateGPUMemory(gpuMemory) {
        this.metrics.gpuMemory = gpuMemory || 0;
    }
    
    /**
     * Update UI displays
     */
    updateUI() {
        // Update FPS display
        if (this.fpsDisplay) {
            const fps = Math.round(this.metrics.fps);
            this.fpsDisplay.textContent = fps;
            
            // Color code based on performance
            if (fps < this.thresholds.lowFps) {
                this.fpsDisplay.style.color = 'var(--error-color)';
            } else if (fps < 50) {
                this.fpsDisplay.style.color = 'var(--warning-color)';
            } else {
                this.fpsDisplay.style.color = 'var(--success-color)';
            }
        }
        
        // Update memory display
        if (this.memoryDisplay) {
            const memory = Math.round(this.metrics.memoryUsage);
            this.memoryDisplay.textContent = `${memory} MB`;
            
            // Color code based on memory usage
            if (memory > this.thresholds.criticalMemory) {
                this.memoryDisplay.style.color = 'var(--error-color)';
            } else if (memory > this.thresholds.highMemory) {
                this.memoryDisplay.style.color = 'var(--warning-color)';
            } else {
                this.memoryDisplay.style.color = 'var(--text-secondary)';
            }
        }
    }
    
    /**
     * Check performance thresholds and issue warnings
     */
    checkPerformanceThresholds() {
        // Low FPS warning
        if (this.metrics.fps < this.thresholds.lowFps && this.frameCount % 300 === 0) {
            this.issuePerformanceWarning('Low FPS detected', 
                `Current FPS: ${Math.round(this.metrics.fps)}. Consider reducing quality settings.`);
        }
        
        // High memory warning
        if (this.metrics.memoryUsage > this.thresholds.highMemory && this.frameCount % 600 === 0) {
            this.issuePerformanceWarning('High memory usage', 
                `Memory usage: ${Math.round(this.metrics.memoryUsage)}MB. Consider optimizing assets.`);
        }
        
        // Critical memory warning
        if (this.metrics.memoryUsage > this.thresholds.criticalMemory && this.frameCount % 300 === 0) {
            this.issuePerformanceWarning('Critical memory usage', 
                `Memory usage: ${Math.round(this.metrics.memoryUsage)}MB. Performance may be severely impacted.`);
        }
    }
    
    /**
     * Issue performance warning
     */
    issuePerformanceWarning(title, message) {
        console.warn(`⚠️ ${title}: ${message}`);
        
        // If notification system is available, show warning
        if (window.animeGenerator?.notifications) {
            window.animeGenerator.notifications.warning(title, message, 10000);
        }
    }
    
    /**
     * Get performance report
     */
    getPerformanceReport() {
        return {
            ...this.metrics,
            frameTimeHistory: [...this.frameTimeHistory],
            averageFrameTime: this.frameTimeHistory.length > 0 
                ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length 
                : 16.67,
            minFrameTime: Math.min(...this.frameTimeHistory),
            maxFrameTime: Math.max(...this.frameTimeHistory),
            frameTimeVariance: this.calculateVariance(this.frameTimeHistory)
        };
    }
    
    /**
     * Calculate variance for frame time stability
     */
    calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
    
    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (this.metrics.fps < this.thresholds.lowFps) {
            suggestions.push({
                type: 'performance',
                priority: 'high',
                title: 'Low Frame Rate',
                description: 'Consider reducing visual quality settings or optimizing animations',
                actions: [
                    'Reduce particle count',
                    'Lower rendering resolution',
                    'Disable complex effects',
                    'Optimize avatar detail level'
                ]
            });
        }
        
        if (this.metrics.memoryUsage > this.thresholds.highMemory) {
            suggestions.push({
                type: 'memory',
                priority: 'medium',
                title: 'High Memory Usage',
                description: 'Memory usage is high and may impact performance',
                actions: [
                    'Reduce texture sizes',
                    'Clear unused assets',
                    'Optimize audio files',
                    'Limit concurrent effects'
                ]
            });
        }
        
        if (this.calculateVariance(this.frameTimeHistory) > 100) {
            suggestions.push({
                type: 'stability',
                priority: 'medium',
                title: 'Frame Time Instability',
                description: 'Frame times are inconsistent, causing stuttering',
                actions: [
                    'Enable VSync if available',
                    'Reduce background processes',
                    'Check for memory leaks',
                    'Optimize render pipeline'
                ]
            });
        }
        
        return suggestions;
    }
    
    /**
     * Start performance profiling session
     */
    startProfiling(name = 'performance-session') {
        if ('performance' in window && 'mark' in performance) {
            performance.mark(`${name}-start`);
        }
        return name;
    }
    
    /**
     * End performance profiling session
     */
    endProfiling(name) {
        if ('performance' in window && 'mark' in performance && 'measure' in performance) {
            try {
                performance.mark(`${name}-end`);
                performance.measure(name, `${name}-start`, `${name}-end`);
                
                const entries = performance.getEntriesByName(name, 'measure');
                if (entries.length > 0) {
                    const duration = entries[entries.length - 1].duration;
                    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
                    return duration;
                }
            } catch (e) {
                console.warn('Performance measurement failed:', e);
            }
        }
        return 0;
    }
    
    /**
     * Benchmark a function
     */
    benchmark(fn, name = 'benchmark', iterations = 1) {
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const averageTime = totalTime / iterations;
        
        console.log(`🏃 ${name}: ${totalTime.toFixed(2)}ms total, ${averageTime.toFixed(2)}ms average (${iterations} iterations)`);
        
        return {
            totalTime,
            averageTime,
            iterations
        };
    }
    
    /**
     * Reset performance metrics
     */
    reset() {
        this.frameCount = 0;
        this.frameTimeHistory = [];
        this.lastTime = performance.now();
        
        this.metrics = {
            fps: 60,
            averageFps: 60,
            frameTime: 16.67,
            memoryUsage: 0,
            drawCalls: 0,
            triangles: 0,
            gpuMemory: 0
        };
        
        console.log('📊 Performance metrics reset');
    }
    
    /**
     * Export performance data
     */
    exportData() {
        const report = this.getPerformanceReport();
        const suggestions = this.getOptimizationSuggestions();
        
        const data = {
            timestamp: new Date().toISOString(),
            report,
            suggestions,
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints
            }
        };
        
        return JSON.stringify(data, null, 2);
    }
}