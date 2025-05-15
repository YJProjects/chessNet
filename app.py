from flask import Flask
from flask import request
from scripts.get_legal_moves import legal_moves
from scripts.update_fen import update_FEN
from flask_session import Session
import redis
import time

import json

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True #reloads server if changes are made to html css or js
app.config['SECRET_KEY'] = 'dev'
app.config['SESSION_TYPE'] = 'redis'
app.config.from_object(__name__)
Session(app)


from flask import render_template

@app.route("/")
def render_default():
    return render_template('index.html')

@app.route("/generate_moves", methods = ["POST"])
def moves():
    
    data = request.get_json()

    FEN = data['FEN']
    piece_index = int(data["piece_index"])

    start = time.perf_counter()

    moves_indexes = legal_moves(FEN, piece_index)

    end = time.perf_counter()
    print("Time Taken to calculate move:", round(end-start, 5), 'seconds')

    post_data = json.dumps({'moves' : moves_indexes})


    return post_data

@app.route("/update_fen", methods = ["POST"])
def newFen():
    data = request.get_json()

    FEN = data['FEN']
    start_index = int(data['start_index'])
    target_index = int(data['target_index'])

    updated_FEN = update_FEN(FEN, start_index, target_index)

    return json.dumps({'FEN' : updated_FEN})