const express = require('express')
const mongodb = require('mongodb')
const {query} = require('express')
require('dotenv').config()
const uri = process.env.URI
const app = express()
app.use(express.json())
app.get('/', function (request, response) {
  const client = new mongodb.MongoClient(uri)
  client.connect(function () {
    const db = client.db('literature')
    const collection = db.collection('books')
    collection.find().toArray((err, result) => {
      response.send(err || result)
      client.close()
    })
  })
})

const myPort = process.env.PORT || 5000
app.listen(myPort, () => console.log(`Server is listening to ${myPort}`))
