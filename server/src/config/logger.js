import { createLogger, transports, format } from 'winston'

export const logger = createLogger({
  level: 'info', // mức độ log: error, warn, info, http, verbose, debug, silly
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // log ra console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // log ra file
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
})

