require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const { response } = require('express')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

function isPost(req) {
    return (req.method === 'POST')
}
function isNotPost(req) {
    return (req.method !== 'POST')
}
morgan.token('data', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan('tiny', {
    skip: isPost
}))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data', { skip: isNotPost }))

app.get('/api/people', (req, res) => {
    Person.find({}).then(people => {
        res.json(people)
    })
})
app.get('/api/people/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(err => { next(err) })
})
app.get('/info', (req, res) => {
    Person.find({}).then(people => {
        const content = `
    <h4>Phonebook has info for ${people.length} people</h4>
    <h4>${new Date()}</h4>`
        res.send(content)
    })
})
app.delete('/api/people/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(err => next(err))
})
app.post('/api/people', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name or number missing' })
    }
    Person.find({ name: body.name }).exec()
        .then(result => {
            if (result.length) {
                return res.status(400).json({ error: 'name must be unique' })
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number
                })
                person.save()
                    .then(savedPerson => {
                        res.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })
})
app.put('/api/people/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})