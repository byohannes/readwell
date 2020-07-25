const dotenv = require('dotenv')
const express = require('express')
const mongodb = require('mongodb')

const {getPutBodyIsAllowed} = require('./util')

dotenv.config()
const uri = process.env.URI
const port = process.env.PORT || 5000
const app = express()
app.use(express.json())

app.get('/api/books', function (request, response) {
  const client = new mongodb.MongoClient(uri)

  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')

    const searchObject = {}

    if (request.query.title) {
      searchObject.title = request.query.title
    }

    if (request.query.author) {
      searchObject.author = request.query.author
    }

    collection.find(searchObject).toArray(function (error, result) {
      response.send(error || result)
      client.close()
    })
  })
})

app.get('/api/books/:id', function (request, response) {
  const client = new mongodb.MongoClient(uri)

  let id
  try {
    id = new mongodb.ObjectID(request.params.id)
  } catch (error) {
    response.sendStatus(400)
    return
  }

  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')

    collection.findOne({_id: id}, function (error, result) {
      if (!result) {
        response.sendStatus(404)
      } else {
        response.send(error || result)
      }

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

app.delete('/api/books/:id', function (request, response) {
  const client = new mongodb.MongoClient(uri)

  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')
    let id = undefined
    const newId = request.params.id

    if (mongodb.ObjectID.isValid(newId)) {
      id = new mongodb.ObjectID(newId)
      collection.deleteOne({_id: id}, function (error, result) {
        if (error) {
          response.status(500).send(error)
        } else if (result.deletedCount) {
          response.sendStatus(204)
        } else {
          response.sendStatus(404)
        }

        client.close()
      })
    }
  })
})

app.put('/api/books/:id', function (request, response) {
  const client = new mongodb.MongoClient(uri)
  client.connect(() => {
    const db = client.db('literature')
    const collection = db.collection('books')
    const {id} = request.params
    const title = request.body.title ? request.body.title : null
    const author = request.body.author
    const author_birth_year = request.body.author_birth_year
    const author_death_year = request.body.author_death_year
    const url = request.body.url

    let newId
    if (mongodb.ObjectID.isValid(id)) {
      newId = new mongodb.ObjectID(id)
      const searchObject = {
        _id: newId,
      }
      const updateObject = {
        $set: {
          title: title,
          author: author,
          author_birth_year: author_birth_year,
          author_death_year: author_death_year,
          url: url,
        },
      }
      const options = {returnOriginal: false}
      if (
        (title || author || author_birth_year || url || author_death_year) &&
        newId
      ) {
        collection.findOneAndUpdate(
          searchObject,
          updateObject,
          options,
          (error, result) => {
            if (error) {
              response.send(error)
              client.close()
            } else {
              response.send(result.value)
              client.close()
            }
          }
        )
      } else {
        response.send('Error! please check your data')
        client.close()
      }
    } else {
      response.status(400).send('Sorry something went wrong!')
      client.close()
    }
  })
})

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/index.html')
})

app.get('/books/new', function (request, response) {
  response.sendFile(__dirname + '/new-book.html')
})

app.get('/books/:id', function (request, response) {
  response.sendFile(__dirname + '/book.html')
})

app.get('/books/:id/edit', function (request, response) {
  response.sendFile(__dirname + '/edit-book.html')
})

app.get('/authors/:name', function (request, response) {
  response.sendFile(__dirname + '/author.html')
})

app.listen(port, () => console.log(`Server is listening to ${port}`))
