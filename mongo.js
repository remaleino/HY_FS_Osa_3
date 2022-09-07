const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as one of arguments')
}
const password = process.argv[2]
const url = `mongodb+srv://remaleino:${password}@cluster0.c41u5ag.mongodb.net/noteApp?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: 'Ilma Ilmarinen',
    number: '04-1234567'
})

person.save().then(result => {
    console.log(result)
})

Person.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})