import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import listRoutes from './routes/listRoutes'
import createError from 'http-errors'
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  forbiddenErrorHandler,
  unauthorizedErrorHandler,
} from './errorHandlers'
import morgan from 'morgan'

dotenv.config()

const server = express()

const port = process.env.PORT || 3004

const whiteList = [process.env.FE_URL_DEV, process.env.FE_URL_PROD]

const corsOptions = {
  origin: function (origin: string | undefined, next: any) {
    if (whiteList.indexOf(origin) !== -1) {
      next(null, true)
    } else {
      next(createError(403, 'NOT ALLOWED BY CORS'))
    }
  },
  credentials: true,
}

// ********************* MIDDLEWARES ****************************

server.use(cors(corsOptions))
server.use(express.json())
server.use(cookieParser())
server.use(morgan('dev'))

// ********************* ROUTES  **********************************

server.use('/users', userRoutes)
server.use('/lists', listRoutes)

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
