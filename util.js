/** Given `request.params` and `request.body`, check if the `PUT` request body is allowed. */
function getPutBodyIsAllowed(requestParams, requestBody) {
  const fieldNames = Object.keys(requestBody)

  const allowedFields = {
    _id: 'string',
    title: 'string',
    author: 'string',
    author_birth_year: 'number',
    author_death_year: 'number',
    url: 'string'
  }

  const allowedFieldNames = Object.keys(allowedFields)

  return (
    fieldNames.length === allowedFieldNames.length &&
    fieldNames.every(name => allowedFieldNames.includes(name)) &&
    requestParams.id === requestBody._id &&
    Object.entries(allowedFields).every(
      ([name, type]) => typeof requestBody[name] === type
    )
  )
}

module.exports = { getPutBodyIsAllowed }
