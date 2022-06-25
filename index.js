const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

function isPost(req, res) {
    return (req.method === 'POST')
}
function isNotPost(req, res) {
    return (req.method !== 'POST')
}
morgan.token('data', (req, res) => {
    return JSON.stringify(req.body)
})
app.use(morgan('tiny', {
    skip: isPost
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', { skip: isNotPost }))
let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    },
    {
        id: 5,
        name: "Isaac Newton",
        number: "39-23-6423122"
    }
]
const generateId = (max) => {
    return Math.floor(Math.random() * max)
}

app.get('/api/persons', (req, res) => {
    res.json(persons)
})
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        response.status(404).end()
    }
})
app.get('/info', (req, res) => {
    const content = `
    <h4>Phonebook has info for ${persons.length} people</h4>
    <h4>${new Date()}</h4>`
    res.send(content)
})
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})
app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({ error: "name or number missing" })
    }
    if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({ error: "name must be unique" })
    }
    const person = {
        id: generateId(10000),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    res.json(person)
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})