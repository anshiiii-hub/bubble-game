from flask import Flask, render_template, redirect, url_for
import multiprocessing
import os
import requests

app = Flask(__name__)

# Global variable to manage the game process
game_process = None

def run_pygame():
    # Notify Flask when the game ends by sending an HTTP request
    os.system("BalloonPop.py")  # Replace with your game script path
    try:
        requests.get("http://127.0.0.1:5000/playagain")  # Notify the server
    except Exception:
        pass  # Ignore errors if the server is not reachable

@app.route("/")
def index():
    return render_template("./front.html")  # Initial page with "Start Game" button
    

@app.route("/start-game")
def start_game():
    global game_process
    # Start the Pygame process
    if game_process is None or not game_process.is_alive():
        game_process = multiprocessing.Process(target=run_pygame)
        game_process.start()
    return redirect(url_for("front"))  # Redirect to the main page

@app.route("/playagain")
def game_over():
    return render_template("playagain.html")  # Show the "Play Again" page

@app.route("/play-again")
def play_again():
    return redirect(url_for("playagain"))  # Restart the game

if __name__ == "__main__":
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        pass
    finally:
        # Terminate the game process on exit
        if game_process:
            game_process.terminate()
