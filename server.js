const express = require('express');
const routes = require('./server/routes')
const app = express();

app.use(express.static('public'))
app.use(express.json());

app.use('/api', routes)


PORT = 8080
app.listen(PORT, () => console.log(`Listening at port : ${PORT}`))



