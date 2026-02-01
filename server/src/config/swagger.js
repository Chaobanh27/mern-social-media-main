/* eslint-disable no-console */
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { logger } from './logger'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MERN API',
      version: '1.0.0',
      description: 'API documentation for MERN project'
    },
    servers: [
      {
        url: 'http://localhost:5173/v1' // base URL của API
      }
    ]
  },
  apis: ['./src/routes/v1/*.js'] // đường dẫn tới file có @swagger
}

const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  logger.info('Swagger Docs running at http://localhost:5173/api-docs')
}

export default swaggerDocs
