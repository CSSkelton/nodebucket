/**
 * Title: app.js
 * Author: Professor Krasso
 * Editor: Cody Skelton
 * Date: 06.09.2024
 */

'use strict'

// Require statements
const express = require('express')
const createServer = require('http-errors')
const path = require('path')
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
// Import statement for route files
const employeeRoute = require('./routes/employee-route');
const port = process.env.PORT || 4000;

// Create the Express app
const app = express()

// Configure the app
app.use(express.json())
app.set('port', process.env.PORT || 3000);
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../dist/nodebucket')))
app.use('/', express.static(path.join(__dirname, '../dist/nodebucket')))
app.listen(port, () => {
  console.log(`Nodebucket listening on port ${port}`)
})

// object literal named options for API testing (thanks Joanna)
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeBucket APIs',
      version: '0.1.0',
    },
  },
  apis: ['./server/routes/*.js'],
};

const openapiSpecification = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// Add custom routes here
app.use("/api/employees", employeeRoute);

// error handler for 404 errors
app.use(function(req, res, next) {
  next(createServer(404)) // forward to error handler
})

// error handler for all other errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500) // set response status code

  // send response to client in JSON format with a message and stack trace
  res.json({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  })
})

module.exports = app // export the Express application