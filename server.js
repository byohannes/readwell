const express = require('express')
const mongodb = require('mongodb')
const {query} = require('express')
require('dotenv').config()
const uri = process.env.URI
const app = express()
app.use(express.json())
app.get('/', function (request, response) {
  const client = new mongodb.MongoClient(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')
    collection.find().toArray((err, result) => {
      response.send(err || result)
      client.close()
    })
  })
})

app.post('/api/books', function (request, response) {
  const client = new mongodb.MongoClient(uri)
  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')
    const newBook = {
      title: request.body.title ? request.body.title : null,
      author: request.body.author ? request.body.author : null,
      author_birth_year: request.body.author_birth_year
        ? request.body.author_birth_year
        : null,
      author_death_year: request.body.author_death_year
        ? Number(request.body.author_death_year)
        : null,
      url: request.body.url ? request.body.url : null,
    }
    if (
      newBook.title === null ||
      newBook.author === null ||
      newBook.author_birth_year === null ||
      newBook.author_death_year === null ||
      newBook.url === null
    ) {
      client.close()
      return response.sendStatus(400)
    }
    collection.insertOne(newBook, (err, result) => {
      response.send(err || result.ops[0])
      client.close()
    })
  })
})

const myPort = process.env.PORT || 5000
app.listen(myPort, () => console.log(`Server is listening to ${myPort}`))
