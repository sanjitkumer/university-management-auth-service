import mongoose from 'mongoose'
import config from './config/index'
import app from './app'
import { logger, errorlogger } from './Shared/logger'
import { Server } from 'http'

process.on('uncaughtException', error => {
  errorlogger.error(error)
  process.exit(1)
})

let server: Server

async function bootstrap() {
  try {
    await mongoose.connect(config.database_url as string)
    logger.info(`Database is connecting successfully`)

    server = app.listen(config.port, () => {
      logger.info(`Application listening on port ${config.port}`)
    })
  } catch (error) {
    errorlogger.error('Failed to connect database', error)
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorlogger.error(error)
        process.exit(1)
      })
    } else {
      process.exit(1)
    }
  })
}

bootstrap()

process.on('SIGTERM', () => {
  logger.info('SIGNTERM is received')
  if (server) {
    server.close()
  }
})
