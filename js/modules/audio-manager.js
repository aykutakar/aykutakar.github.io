/**
 * Audio Manager - Web Audio API integration for music and sound effects
 * Handles audio loading, playback, analysis, and beat detection
 */

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.currentSource = null;
        this.audioBuffer = null;
        this.gainNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.7;
        
        // Beat detection
        this.beatData = [];
        this.frequencyData = null;
        this.previousEnergy = 0;
        
        // Voice recording
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }
    
    /**
     * Initialize audio system
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupAudioGraph();
            console.log('🎵 Audio Manager initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            throw error;
        }
    }
    
    /**
     * Set up audio processing graph
     */
    setupAudioGraph() {
        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        
        // Create analyser for beat detection
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 1024;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Connect nodes
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    }
    
    /**
     * Load audio file
     */
    async loadFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.audioBuffer.duration;
            
            // Analyze audio for beat detection
            await this.analyzeBeatData();
            
            console.log(`Audio loaded: ${file.name}, duration: ${this.duration.toFixed(2)}s`);
        } catch (error) {
            console.error('Failed to load audio file:', error);
            throw error;
        }
    }
    
    /**
     * Analyze audio for beat detection
     */
    async analyzeBeatData() {
        if (!this.audioBuffer) return;
        
        // Simple beat detection analysis
        // In a real implementation, this would use more sophisticated algorithms
        const channelData = this.audioBuffer.getChannelData(0);
        const sampleRate = this.audioBuffer.sampleRate;
        const windowSize = 1024;
        
        this.beatData = [];
        
        for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
            let energy = 0;
            for (let j = 0; j < windowSize; j++) {
                energy += Math.abs(channelData[i + j]);
            }
            energy /= windowSize;
            
            const time = i / sampleRate;
            this.beatData.push({
                time,
                energy,
                isBeat: energy > this.previousEnergy * 1.3 // Simple beat detection
            });
            
            this.previousEnergy = energy;
        }
        
        console.log(`Beat analysis complete: ${this.beatData.length} data points`);
    }
    
    /**
     * Play audio
     */
    play() {
        if (!this.audioBuffer || this.isPlaying) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Create new source
        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.audioBuffer;
        this.currentSource.connect(this.gainNode);
        
        // Start playback
        this.currentSource.start(0, this.currentTime);
        this.isPlaying = true;
        
        // Handle end of playback
        this.currentSource.onended = () => {
            this.isPlaying = false;
        };
        
        console.log('Audio playback started');
    }
    
    /**
     * Pause audio
     */
    pause() {
        if (!this.isPlaying || !this.currentSource) return;
        
        this.currentSource.stop();
        this.isPlaying = false;
        
        console.log('Audio playback paused');
    }
    
    /**
     * Stop audio
     */
    stop() {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
        this.isPlaying = false;
        this.currentTime = 0;
        
        console.log('Audio playback stopped');
    }
    
    /**
     * Seek to time
     */
    seek(time) {
        const wasPlaying = this.isPlaying;
        
        if (this.isPlaying) {
            this.pause();
        }
        
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        
        if (wasPlaying) {
            this.play();
        }
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }
    
    /**
     * Update audio (called each frame)
     */
    update(deltaTime) {
        if (this.isPlaying) {
            this.currentTime += deltaTime * 0.001; // Convert to seconds
            
            // Update frequency analysis
            if (this.analyser) {
                this.analyser.getByteFrequencyData(this.frequencyData);
            }
        }
    }
    
    /**
     * Get current frequency data
     */
    getFrequencyData() {
        return this.frequencyData;
    }
    
    /**
     * Get beat data
     */
    getBeatData() {
        return this.beatData;
    }
    
    /**
     * Get current beat intensity
     */
    getCurrentBeatIntensity() {
        if (!this.beatData.length) return 0;
        
        // Find closest beat data point
        let closest = this.beatData[0];
        let minDiff = Math.abs(this.currentTime - closest.time);
        
        for (const beat of this.beatData) {
            const diff = Math.abs(this.currentTime - beat.time);
            if (diff < minDiff) {
                minDiff = diff;
                closest = beat;
            }
        }
        
        return closest.energy;
    }
    
    /**
     * Check if audio is loaded
     */
    hasAudio() {
        return this.audioBuffer !== null;
    }
    
    /**
     * Get duration
     */
    getDuration() {
        return this.duration;
    }
    
    /**
     * Start voice recording
     */
    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMicrophone({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = async () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                await this.loadRecordedAudio(blob);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            console.log('Voice recording started');
            
        } catch (error) {
            console.error('Failed to start voice recording:', error);
            throw error;
        }
    }
    
    /**
     * Stop voice recording
     */
    stopVoiceRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            console.log('Voice recording stopped');
        }
    }
    
    /**
     * Load recorded audio
     */
    async loadRecordedAudio(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.duration = this.audioBuffer.duration;
            
            await this.analyzeBeatData();
            
            console.log(`Recorded audio loaded, duration: ${this.duration.toFixed(2)}s`);
        } catch (error) {
            console.error('Failed to load recorded audio:', error);
            throw error;
        }
    }
    
    /**
     * Apply audio effects
     */
    applyEffect(type, params = {}) {
        if (!this.audioContext) return;
        
        switch (type) {
            case 'reverb':
                this.applyReverb(params);
                break;
            case 'distortion':
                this.applyDistortion(params);
                break;
            case 'pitchShift':
                this.applyPitchShift(params);
                break;
        }
    }
    
    /**
     * Apply reverb effect
     */
    applyReverb(params) {
        // Simplified reverb using convolver
        const convolver = this.audioContext.createConvolver();
        
        // Create impulse response (simplified)
        const length = this.audioContext.sampleRate * (params.duration || 2);
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        
        // Insert into audio graph
        this.gainNode.disconnect();
        this.gainNode.connect(convolver);
        convolver.connect(this.analyser);
    }
    
    /**
     * Apply distortion effect
     */
    applyDistortion(params) {
        const waveshaper = this.audioContext.createWaveShaper();
        const amount = params.amount || 50;
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
        }
        
        waveshaper.curve = curve;
        waveshaper.oversample = '4x';
        
        // Insert into audio graph
        this.gainNode.disconnect();
        this.gainNode.connect(waveshaper);
        waveshaper.connect(this.analyser);
    }
    
    /**
     * Apply pitch shift effect (simplified)
     */
    applyPitchShift(params) {
        // Note: Real pitch shifting requires complex algorithms
        // This is a simplified implementation
        const shift = params.shift || 1.0;
        
        if (this.currentSource) {
            this.currentSource.playbackRate.value = shift;
        }
    }
    
    /**
     * Serialize audio state
     */
    async serialize() {
        return {
            duration: this.duration,
            volume: this.volume,
            beatData: this.beatData,
            hasAudio: this.hasAudio()
        };
    }
    
    /**
     * Deserialize audio state
     */
    async deserialize(data) {
        this.duration = data.duration || 0;
        this.volume = data.volume || 0.7;
        this.beatData = data.beatData || [];
        
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
    }
}