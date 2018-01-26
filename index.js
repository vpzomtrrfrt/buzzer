const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const playSound = require('play-sound')

const app = express();
const server = http.Server(app);
const io = socketio(server);
const player = playSound({player: "play"});

const title = 'Buffer Buzzer'

let data = {
  users: new Set(),
  buzzes: new Set(),
}

const getData = () => Object.keys(data).reduce((d, key) => {
  d[key] = data[key] instanceof Set ? [...data[key]] : data[key]
  return d
}, {})

function beep() {
  player.play("beep.mp3")
}

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    data.users.add(user.id)
    io.emit('active', [...data.users].length)
    console.log(`${user.name} joined!`)
  })

  socket.on('buzz', (user) => {
    if(data.buzzes.size < 1) beep()
    data.buzzes.add(`${user.name}-${user.team}`)
    io.emit('buzzes', [...data.buzzes])
    console.log(`${user.name} buzzed in!`)
  })

  socket.on('clear', () => {
    data.buzzes = new Set()
    io.emit('buzzes', [...data.buzzes])
    console.log(`Clear buzzes`)
  })
})

server.listen(8090, () => console.log('Listening on 8090'))
