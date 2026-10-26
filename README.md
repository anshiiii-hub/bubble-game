# 🫧 Bubble Pop! 2.0 — AI Dual-Hand Tracking & Arcade Experience

An interactive, responsive balloon popping arcade sensation powered by **Dual-Hand Computer Vision Tracking** in the browser, featuring real-time gesture superpowers, mini-boss battles, Fruit-Ninja blade trails, dynamic themes, sound synthesis, and trophy snapshots.

Playable immediately via webcam (using both hands as virtual laser reticles) or mouse & touch!

---

## 🌟 Major Advancements in 2.0

### 1. ✋ Dual-Hand Tracking & Gesture Superpowers
- **Both Hands Simultaneously**: Tracks both left and right hands in real-time (`Hand 1` in Electric Cyan, `Hand 2` in Plasma Pink). Dual-wield like a ninja or play co-op with a friend!
- **✊ Sonic Boom Shockwave (Fist Detonation)**: Clench your fist to charge up the shockwave meter in the HUD, then open your palm to unleash an expanding holographic ring wave that clears all bubbles on screen!
- **🤏 Laser Beam Blast (Pinch)**: Pinch your thumb and index finger together to fire a vertical laser beam piercing through an entire column of balloons!
- **🗡️ Blade Ribbon Slices (Fruit Ninja style)**: Rapid hand movements (`speed > 24`) ignite a luminous, tapered blade ribbon with dynamic airy swoosh sound effects!
- **🦴 Holographic Neon Skeleton Overlay**: Toggleable futuristic cybernetic hand skeleton rendered in real-time over the camera feed.

### 2. 👑 Epic Entities & Balloon Variations
- **👑 Giga Boss Bubble (The King Bubble)**: Spawns at score milestones with a royal crown and live health bar. Requires multiple hits/slashes to pop, shaking with impact sparks and bursting into 6 bonus star balloons!
- **⚡ Chain Lightning Bubble**: Popping sends crackling electric arcs zapping up to 3 nearby balloons in a cascade!
- **✨ Cluster Bubble**: Splits into 3 fast micro-bubbles when popped!
- **⭐ Golden Star Balloon**: Bonus points (+50 pts).
- **❄️ Blizzard Freeze Bubble**: Freezes time for 5 seconds (25% speed) with an icy frost vignette.
- **⚡ Bubble Rush (Frenzy)**: 4-second flurry of balloons with 2x score multipliers!
- **❤️ Heart Bubble**: Restores a lost life in Survival or adds +5s in Time Attack.
- **💣 Hazard Bomb**: Spiky carbon sphere with active fuse (-30 pts, screen shake, combo breaker).

### 3. 🎨 4 Live Visual Themes
- **🌃 Cyberpunk**: Dark glassmorphism, electric cyan, and neon pink.
- **🌊 Deep Ocean**: Underwater bioluminescent vibes with aquamarine caustics.
- **🌆 Retro Synthwave**: 80s magenta sunset, warm gold, and neon violet.
- **🌌 Cosmic Nebula**: Deep celestial space with cosmic purple flares.

### 4. 🏆 Achievements & Trophy Photo Snapshot
- **Milestones**: Toast notification popups when unlocking badges (*Blade Slicer*, *King Slayer*, *Sonic Boom*, *Chain Storm*, *Combo Master*, *Centurion*).
- **📸 Selfie Trophy Cam**: At the Game Over screen, click *"Download Trophy Photo Card"* to generate and download a victory photo card with your score, stats, grade, and timestamp!

### 5. 🎵 Generative Ambient Synth Soundtrack
- Procedural pentatonic chord progression synthesized directly via Web Audio API oscillators, lowpass filters, and smooth envelopes in the background. Toggleable with one click!

---

### Method 1: Web Browser Mode (Recommended)

Start the local server using either Node.js or Python:
```bash
npm start
# or: node server.js
# or: python3 app.py
```
Then visit: **`http://localhost:5050`**

*(Note: Always open via `http://localhost:5050`, do not use `file://` because modern browsers block camera access under `file://` origins).*

### Method 2: Standalone Desktop Mode (OpenCV + Pygame)

```bash
pip install -r requirements-desktop.txt
python3 BalloonPop.py
```

---

## 🕹️ Controls & Gestures

| Gesture / Input | Action |
| :--- | :--- |
| **Index Fingertip Point** | Touch and slice balloons |
| **✊ Clench Fist -> Open Hand** | Charge & detonate **Sonic Boom Shockwave** |
| **🤏 Pinch (Thumb + Index)** | Fire **Laser Beam Blast** |
| **💨 Fast Hand Swipe** | Unleash **Blade Ribbon Slice** |
| **🖱️ Mouse / Touch** | Hover, click, and swipe across balloons |
| **🔊 / 🎵 Buttons** | Toggle Sound FX / Ambient Synth Music |
| **🦴 Button** | Toggle Neon Cyber Skeleton |
| **📹 Button** | Toggle Camera Feed Opacity |
| **⏸️ Button** | Pause / Resume Game |

## Deploy on Render

Use the Node runtime with build command `npm install --ignore-scripts` and start command `node server.js`. The server listens on Render's `PORT` automatically. `render.yaml` includes these settings for Blueprint deployments.

Scores are stored in a local JSON file and reset when Render replaces the instance or redeploys it.
