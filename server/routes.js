const express = require('express');
const router = express.Router()
const {createBoard, getMoves, updateBoard} = require('./gamestate')

router.post("/init" , (req, res) => {
    res.header({"Content-Type": "application/json"})
    startBoard = createBoard()
    res.send(JSON.stringify(startBoard))
})

router.post("/getMoves", (req, res) => {
    res.header({"Content-Type": "application/json"})
    const moves = getMoves(req.body['index'])
    res.send(JSON.stringify({'moves' : moves}))
})

router.post("/updateBoard", (req, res) => {
    res.header({"Content-Type": "application/json"})
    const from = Number(req.body['from'])
    const to = Number(req.body['to'])
    const newBoard = updateBoard(from, to)
    res.send(JSON.stringify(
        {
            'Board' : newBoard.Board,
            'isCheckMate' : newBoard.isCheckMate()
        }
    ))
    })
module.exports = router