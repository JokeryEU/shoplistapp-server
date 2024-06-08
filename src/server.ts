import express, { Request } from 'express'
import cors from 'cors'
import { connection, connect } from 'mongoose'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import listRoutes from './routes/listRoutes'
import createError from 'http-errors'
import helmet from 'helmet'
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  forbiddenErrorHandler,
  unauthorizedErrorHandler,
} from './utils/errorHandlers/errorHandlers'
import morgan from 'morgan'

dotenv.config()

const server = express()

const port = process.env.PORT || 3004

const whiteList = [process.env.FE_URL_DEV, process.env.FE_URL_PROD]

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    if (origin && whiteList.includes(origin)) {
      callback(null, true)
    } else {
      callback(createError(403, 'NOT ALLOWED BY CORS'))
    }
  },
  credentials: true,
}

// ********************* MIDDLEWARES ******************************
server.use(helmet())
server.use(cors<Request>(corsOptions))
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
connect(process.env.MONGODB_ADDRESS ?? '', {})

connection.on('connected', () => {
  console.log('MongoDB connection was successful')

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log('Server up and running on port: ', port)
  })
})
