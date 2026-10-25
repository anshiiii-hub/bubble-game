#!/usr/bin/env python3
"""
Balloon Pop - Desktop Python & Computer Vision Game
Powered by OpenCV, cvzone HandDetector, and Pygame.
"""

import sys
import os
import time
import random

# Graceful dependency check
missing_deps = []
try:
    import pygame
except ImportError:
    missing_deps.append("pygame")

try:
    import cv2
except ImportError:
    missing_deps.append("opencv-python")

try:
    import numpy as np
except ImportError:
    missing_deps.append("numpy")

try:
    from cvzone.HandTrackingModule import HandDetector
except ImportError:
    missing_deps.append("cvzone")

if missing_deps:
    print("\n" + "=" * 65)
    print("🎈 BUBBLE POP! - DESKTOP PYTHON MODE")
    print("=" * 65)
    print("Notice: Some Python desktop dependencies are not installed:")
    for dep in missing_deps:
        print(f"  ❌ {dep}")
    print("\nTo run the desktop version, install them via:")
    print(f"  pip install {' '.join(missing_deps)}")
    print("\n🌟 RECOMMENDED: Play the modern browser version immediately!")
    print("  Run: python3 app.py")
    print("  Or double-click index.html in your browser.")
    print("  Zero installation required — runs AI hand tracking in your browser!")
    print("=" * 65 + "\n")
    sys.exit(0)

# Initialize Pygame
pygame.init()
width, height = 1280, 720
window = pygame.display.set_mode((width, height))
pygame.display.set_caption("Balloon Pop - AI Hand Tracking")

fps = 30
clock = pygame.time.Clock()

# Camera Setup
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

if not cap.isOpened():
    print("⚠️ Warning: Could not open webcam. Ensure camera permissions are enabled.")

# Assets
resource_dir = os.path.join(os.path.dirname(__file__), "Resources")
balloon_img_path = os.path.join(resource_dir, "BalloonRed.png")
font_path = os.path.join(resource_dir, "Marcellus-Regular.ttf")

if os.path.exists(balloon_img_path):
    imgBalloon = pygame.image.load(balloon_img_path).convert_alpha()
else:
    # Fallback procedural surface if image not found
    imgBalloon = pygame.Surface((100, 130), pygame.SRCALPHA)
    pygame.draw.ellipse(imgBalloon, (255, 50, 100), (0, 0, 100, 130))

rectBalloon = imgBalloon.get_rect()
rectBalloon.x, rectBalloon.y = 600, 750

# Game Variables
speed = 12
score = 0
combo = 1
totalTime = 60
startTime = time.time()

# Hand Detector
detector = HandDetector(detectionCon=0.75, maxHands=1)

def reset_balloon():
    global speed
    rectBalloon.x = random.randint(120, width - 150)
    rectBalloon.y = height + 40

def main():
    global speed, score, combo, startTime
    running = True

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE or event.key == pygame.K_q:
                    running = False
                elif event.key == pygame.K_r:
                    # Restart
                    score = 0
                    speed = 12
                    startTime = time.time()
                    reset_balloon()

        timeRemain = int(totalTime - (time.time() - startTime))

        if timeRemain < 0:
            # Game Over screen
            window.fill((15, 20, 35))
            try:
                font_large = pygame.font.Font(font_path, 64)
                font_small = pygame.font.Font(font_path, 32)
            except Exception:
                font_large = pygame.font.SysFont("Arial", 64)
                font_small = pygame.font.SysFont("Arial", 32)

            textGameOver = font_large.render("TIME UP!", True, (255, 75, 120))
            textFinalScore = font_large.render(f"Final Score: {score}", True, (255, 215, 0))
            textRestart = font_small.render("Press 'R' to Restart or 'Q' to Quit", True, (200, 220, 255))

            window.blit(textGameOver, (width // 2 - textGameOver.get_width() // 2, 220))
            window.blit(textFinalScore, (width // 2 - textFinalScore.get_width() // 2, 320))
            window.blit(textRestart, (width // 2 - textRestart.get_width() // 2, 430))
        else:
            success, img = cap.read()
            if success:
                img = cv2.flip(img, 1)
                hands, img = detector.findHands(img, flipType=False)

                # Move balloon up
                rectBalloon.y -= speed
                if rectBalloon.y < -rectBalloon.height:
                    reset_balloon()
                    combo = 1

                # Check hand pop
                if hands:
                    hand = hands[0]
                    # Index fingertip is landmark 8
                    x, y = hand['lmList'][8][0:2]

                    # Draw glowing pointer reticle on fingertip
                    cv2.circle(img, (x, y), 18, (0, 242, 254), 3)
                    cv2.circle(img, (x, y), 6, (255, 255, 255), cv2.FILLED)

                    if rectBalloon.collidepoint(x, y):
                        score += 10 * combo
                        combo = min(combo + 1, 5)
                        speed = min(speed + 1, 28)
                        reset_balloon()

                # Convert OpenCV BGR to Pygame surface
                imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                imgRGB = np.rot90(imgRGB)
                frame = pygame.surfarray.make_surface(imgRGB).convert()
                frame = pygame.transform.flip(frame, True, False)
                window.blit(frame, (0, 0))
            else:
                window.fill((20, 25, 40))

            # Draw Balloon
            window.blit(imgBalloon, rectBalloon)

            # Draw HUD
            try:
                font = pygame.font.Font(font_path, 42)
            except Exception:
                font = pygame.font.SysFont("Arial", 42)

            textScore = font.render(f"Score: {score}", True, (255, 215, 0))
            textTime = font.render(f"Time: {timeRemain}s", True, (0, 242, 254))
            textCombo = font.render(f"Combo: {combo}x", True, (255, 50, 120))

            window.blit(textScore, (40, 30))
            window.blit(textCombo, (40, 80))
            window.blit(textTime, (width - 240, 30))

        pygame.display.update()
        clock.tick(fps)

    cap.release()
    pygame.quit()

if __name__ == "__main__":
    main()
