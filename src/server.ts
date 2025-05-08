import express, { type Request } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes'
import listRoutes from './routes/listRoutes'
import createError from 'http-errors'
import helmet from 'helmet'
import { errorHandler } from './utils/errorHandlers/errorHandlers'
import limiter from './utils/errorHandlers/rateLimiter'
import logger from './utils/logger'

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
server.set('trust proxy', 1)
server.use(limiter)
server.use(helmet())
server.use(cors<Request>(corsOptions))
server.use(express.json())
server.use(cookieParser())

// ********************* ROUTES  **********************************
server.use('/users', userRoutes)
server.use('/lists', listRoutes)

// ********************* ERROR HANDLERS ***************************
server.use(errorHandler)

// ********************* DATABASE CONNECTION **********************
mongoose.connect(process.env.MONGODB_ADDRESS as string, {})

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection was successful')

  server.listen(port, () => {
    logger.info('Server up and running on port: %s', port)
  })
})
