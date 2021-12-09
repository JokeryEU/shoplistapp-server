import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import listRoutes from './routes/listRoutes'

import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  forbiddenErrorHandler,
  unauthorizedErrorHandler,
} from './errorHandlers'

dotenv.config()

const server = express()

const port = process.env.PORT || 3005

// ********************* MIDDLEWARES ****************************

server.use(cors())
server.use(express.json())
server.use(cookieParser())

// ********************* ROUTES  **********************************

server.use('/users', userRoutes)
server.use('/list', listRoutes)

// ********************* ERROR HANDLERS ***************************

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(catchAllErrorHandler)

// ********************* DATABASE CONNECTION **********************

mongoose.connect(process.env.MONGODB_ADDRESS!, {})

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection done')

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log('Server up and running on port: ', port)
  })
})
