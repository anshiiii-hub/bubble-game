/**
 * Advanced Computer Vision & Gesture Recognition Controller
 * Powered by Google MediaPipe Hands (Dual-Hand Tracking)
 * Supports:
 * - Two-Hand Simultaneous Tracking (Hand 1 & Hand 2)
 * - Gesture Detection: Fist (Shockwave Charge), Pinch (Laser Burst), Peace Sign, Open Palm
 * - High-Speed Blade Velocity Tracking (Fruit-Ninja style slashes)
 * - Holographic Neon Skeleton Renderer
 * - Full Mouse & Multi-Touch universal fallback
 */

class VisionController {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.isTracking = false;
        this.useCamera = true;
        this.cameraInstance = null;
        this.handsInstance = null;

        // Visual Options
        this.showSkeleton = true; // Draw neon hand skeleton

        // Dual Pointers for Two Hands
        this.pointers = [
            this.createPointerObject('hand-1', '#00f2fe'),
            this.createPointerObject('hand-2', '#ff2a85')
        ];

        // Primary convenience pointer
        this.pointer = this.pointers[0];

        // Smoothing parameter (EMA)
        this.smoothing = 0.45;

        // Gesture Superpower State
        this.superpower = {
            shockwaveReady: true,
            shockwaveCharge: 0, // 0 to 1
            isFistClosed: false,
            cooldownTimer: 0
        };

        // Callbacks
        this.onHandStateChange = null;
        this.onGestureDetected = null; // (gestureType, handIndex, position)
        this.cameraStarted = false;
        this.lastHandTimestamp = 0;
    }

    createPointerObject(id, color) {
        return {
            id,
            color,
            x: -100,
            y: -100,
            prevX: -100,
            prevY: -100,
            vx: 0,
            vy: 0,
            speed: 0,
            active: false,
            isBladeActive: false, // high speed slash
            isPinched: false,
            gesture: 'none', // 'open' | 'fist' | 'pinch' | 'peace'
            landmarks: null
        };
    }

    init(videoElement, canvasElement, onHandStateChange, onGestureDetected) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.onHandStateChange = onHandStateChange;
        this.onGestureDetected = onGestureDetected;

        this.setupPointerListeners();
    }

    setupPointerListeners() {
        if (!this.canvasElement) return;

        const updateFromEvent = (clientX, clientY, isDown = false) => {
            const rect = this.canvasElement.getBoundingClientRect();
            const targetX = (clientX - rect.left) * (this.canvasElement.width / rect.width);
            const targetY = (clientY - rect.top) * (this.canvasElement.height / rect.height);

            const p = this.pointers[0];
            p.vx = targetX - p.x;
            p.vy = targetY - p.y;
            p.speed = Math.hypot(p.vx, p.vy);
            p.isBladeActive = p.speed > 20;
            p.prevX = p.x;
            p.prevY = p.y;
            p.x = targetX;
            p.y = targetY;
            p.active = true;
            p.gesture = isDown ? 'pinch' : 'open';
        };

        this.canvasElement.addEventListener('mousemove', (e) => {
            if (!this.useCamera || !this.isTracking) {
                updateFromEvent(e.clientX, e.clientY, false);
            }
        });

        this.canvasElement.addEventListener('mousedown', (e) => {
            if (!this.useCamera || !this.isTracking) {
                updateFromEvent(e.clientX, e.clientY, true);
                if (this.onGestureDetected) {
                    this.onGestureDetected('pinch', 0, { x: this.pointers[0].x, y: this.pointers[0].y });
                }
            }
        });

        this.canvasElement.addEventListener('mouseup', () => {
            if (!this.useCamera || !this.isTracking) {
                this.pointers[0].gesture = 'open';
            }
        });

        this.canvasElement.addEventListener('mouseleave', () => {
            if (!this.useCamera || !this.isTracking) {
                this.pointers[0].active = false;
            }
        });

        // Touch events
        this.canvasElement.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                updateFromEvent(e.touches[0].clientX, e.touches[0].clientY, true);
            }
        }, { passive: true });

        this.canvasElement.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                updateFromEvent(e.touches[0].clientX, e.touches[0].clientY, false);
            }
        }, { passive: true });

        this.canvasElement.addEventListener('touchend', () => {
            this.pointers[0].active = false;
        });
    }

    async startCamera() {
        if (this.cameraStarted) return true;
        this.useCamera = true;

        if (typeof Hands === 'undefined') {
            console.warn('MediaPipe Hands library not loaded yet.');
            return false;
        }

        try {
            this.handsInstance = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.handsInstance.setOptions({
                maxNumHands: 2, // Enable Dual Hand Tracking!
                modelComplexity: 0, // 0 for max FPS responsiveness
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.handsInstance.onResults((results) => this.onHandResults(results));

            if (typeof Camera !== 'undefined' && this.videoElement) {
                this.cameraInstance = new Camera(this.videoElement, {
                    onFrame: async () => {
                        if (this.useCamera && this.handsInstance) {
                            await this.handsInstance.send({ image: this.videoElement });
                        }
                    },
                    width: 640,
                    height: 480
                });

                await this.cameraInstance.start();
                this.cameraStarted = true;
                if (this.onHandStateChange) {
                    this.onHandStateChange('searching');
                }
                return true;
            }
        } catch (err) {
            console.error('Camera or MediaPipe initialization failed:', err);
            this.cameraStarted = false;
            this.useCamera = false;
            if (this.onHandStateChange) {
                this.onHandStateChange('error');
            }
            return false;
        }
        return false;
    }

    stopCamera() {
        if (this.cameraInstance) {
            try { this.cameraInstance.stop(); } catch (e) {}
            this.cameraStarted = false;
        }
        this.isTracking = false;
        this.useCamera = false;
        this.pointers.forEach(p => p.active = false);
        if (this.onHandStateChange) {
            this.onHandStateChange('disabled');
        }
    }

    onHandResults(results) {
        if (!this.useCamera) return;

        const hasHands = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

        if (hasHands) {
            const count = Math.min(results.multiHandLandmarks.length, 2);

            for (let i = 0; i < count; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const p = this.pointers[i];
                p.landmarks = landmarks;

                const indexTip = landmarks[8];
                const thumbTip = landmarks[4];
                const middleTip = landmarks[12];
                const ringTip = landmarks[16];
                const pinkyTip = landmarks[20];
                const wrist = landmarks[0];

                // Mirrored coordinates
                const normX = 1 - indexTip.x;
                const normY = indexTip.y;

                const targetX = normX * this.canvasElement.width;
                const targetY = normY * this.canvasElement.height;

                if (!p.active) {
                    p.x = targetX;
                    p.y = targetY;
                    p.prevX = targetX;
                    p.prevY = targetY;
                    p.active = true;
                } else {
                    p.prevX = p.x;
                    p.prevY = p.y;
                    p.x += (targetX - p.x) * this.smoothing;
                    p.y += (targetY - p.y) * this.smoothing;
                    p.vx = p.x - p.prevX;
                    p.vy = p.y - p.prevY;
                    p.speed = Math.hypot(p.vx, p.vy);
                    p.isBladeActive = p.speed > 24;
                }

                // 1. Gesture: Pinch (Thumb & Index tip)
                const pinchDist = Math.hypot((1 - thumbTip.x) - normX, thumbTip.y - normY);
                p.isPinched = pinchDist < 0.075;

                // 2. Gesture: Fist Detection
                // All 4 fingertips closer to wrist than their base knuckles (MCP joints 5, 9, 13, 17)
                const dWrist = (pt) => Math.hypot(pt.x - wrist.x, pt.y - wrist.y);
                const isIndexClosed = dWrist(indexTip) < dWrist(landmarks[5]) * 1.1;
                const isMiddleClosed = dWrist(middleTip) < dWrist(landmarks[9]) * 1.1;
                const isRingClosed = dWrist(ringTip) < dWrist(landmarks[13]) * 1.1;
                const isPinkyClosed = dWrist(pinkyTip) < dWrist(landmarks[17]) * 1.1;

                const isFist = isIndexClosed && isMiddleClosed && isRingClosed && isPinkyClosed;

                // 3. Gesture: Peace Sign (Index & Middle open, Ring & Pinky closed)
                const isPeace = !isIndexClosed && !isMiddleClosed && isRingClosed && isPinkyClosed;

                const prevGesture = p.gesture;
                if (isFist) {
                    p.gesture = 'fist';
                    this.superpower.isFistClosed = true;
                    this.superpower.shockwaveCharge = Math.min(1.0, this.superpower.shockwaveCharge + 0.04);
                } else if (p.isPinched) {
                    p.gesture = 'pinch';
                } else if (isPeace) {
                    p.gesture = 'peace';
                } else {
                    p.gesture = 'open';
                    // If fist was charged and now opened -> DETONATE SHOCKWAVE!
                    if (prevGesture === 'fist' && this.superpower.shockwaveCharge > 0.6) {
                        if (this.onGestureDetected) {
                            this.onGestureDetected('shockwave', i, { x: p.x, y: p.y });
                        }
                        this.superpower.shockwaveCharge = 0;
                        this.superpower.isFistClosed = false;
                    }
                }

                // Emit Pinch Laser Burst
                if (p.gesture === 'pinch' && prevGesture !== 'pinch') {
                    if (this.onGestureDetected) {
                        this.onGestureDetected('pinch', i, { x: p.x, y: p.y });
                    }
                }
            }

            // Deactivate second pointer if only 1 hand detected
            if (count === 1) {
                this.pointers[1].active = false;
                this.pointers[1].landmarks = null;
            }

            this.isTracking = true;
            this.lastHandTimestamp = performance.now();
            if (this.onHandStateChange) {
                this.onHandStateChange(count > 1 ? 'dual' : 'active');
            }
        } else {
            if (this.isTracking && performance.now() - this.lastHandTimestamp > 500) {
                this.isTracking = false;
                this.pointers.forEach(p => p.active = false);
                if (this.onHandStateChange) {
                    this.onHandStateChange('searching');
                }
            }
        }
    }

    // Render futuristic Neon Holographic Cyber Skeleton
    drawNeonSkeleton(ctx, canvasWidth, canvasHeight) {
        if (!this.showSkeleton || !this.useCamera || !this.isTracking) return;

        const connections = [
            // Thumb
            [0, 1], [1, 2], [2, 3], [3, 4],
            // Index
            [0, 5], [5, 6], [6, 7], [7, 8],
            // Middle
            [0, 9], [9, 10], [10, 11], [11, 12],
            // Ring
            [0, 13], [13, 14], [14, 15], [15, 16],
            // Pinky
            [0, 17], [17, 18], [18, 19], [19, 20],
            // Palm bridge
            [5, 9], [9, 13], [13, 17]
        ];

        ctx.save();

        this.pointers.forEach((p) => {
            if (!p.active || !p.landmarks) return;
            const lm = p.landmarks;
            const glowColor = p.color;

            // Connectors
            ctx.strokeStyle = glowColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5;

            connections.forEach(([i1, i2]) => {
                const x1 = (1 - lm[i1].x) * canvasWidth;
                const y1 = lm[i1].y * canvasHeight;
                const x2 = (1 - lm[i2].x) * canvasWidth;
                const y2 = lm[i2].y * canvasHeight;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });

            // Joints
            lm.forEach((joint, idx) => {
                const jx = (1 - joint.x) * canvasWidth;
                const jy = joint.y * canvasHeight;
                const isTip = [4, 8, 12, 16, 20].includes(idx);

                ctx.beginPath();
                ctx.arc(jx, jy, isTip ? 5 : 3.5, 0, Math.PI * 2);
                ctx.fillStyle = isTip ? '#ffffff' : glowColor;
                ctx.shadowBlur = isTip ? 16 : 8;
                ctx.fill();
            });
        });

        ctx.restore();
    }

    toggleSkeleton() {
        this.showSkeleton = !this.showSkeleton;
        return this.showSkeleton;
    }

    setMode(useCamera) {
        this.useCamera = useCamera;
        if (!useCamera) {
            if (this.cameraInstance) {
                try { this.cameraInstance.stop(); } catch (e) {}
                this.cameraStarted = false;
            }
            this.isTracking = false;
            this.pointers[1].active = false;
            if (this.onHandStateChange) {
                this.onHandStateChange('mouse');
            }
        } else {
            this.startCamera();
        }
    }
}

// Global instance
window.visionController = new VisionController();
