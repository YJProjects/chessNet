from flask import Flask
from flask import request
from legal_moves import legal_moves
from update_fen import update_FEN
import json

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True #reloads server if changes are made to html css or js

from flask import render_template

@app.route("/")
def render_default():
    return render_template('index.html')

@app.route("/generate_moves", methods = ["POST"])
def moves():
    data = request.get_json()

    FEN = data['FEN']
    piece_index = int(data["piece_index"])

    moves_indexes = legal_moves(FEN, piece_index)
    
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