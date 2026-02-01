/* eslint-disable no-console */
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { connectDB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import { API_V1 } from '~/routes/v1/index'
import cookieParser from 'cookie-parser'
import swaggerDocs from '~/config/swagger'
import morgan from 'morgan'
import { logger } from '~/config/logger'
import seedDB from '~/config/seedDB'
import http from 'http'
import { initSocket } from '~/sockets'
import { serve } from 'inngest/express'
import { inngest, functions } from '~/inngest'
import { clerkMiddleware } from '@clerk/express'
import { Webhook } from 'svix'
import compression from 'compression'

const startServer = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.use(helmet())
  app.use(morgan('tiny'))

  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(compression({
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    }
  })
  )

  app.use(clerkMiddleware())

  app.post('/api/webhooks/clerk', express.raw({ type: 'application/json' }),
    async (req, res) => {
      const payload = req.body
      const headers = req.headers

      const wh = new Webhook(env.CLERK_SINGING_KEY)

      let evt

      try {
        evt = wh.verify(payload, headers)
      } catch (err) {
        console.log(err)
        console.error('Clerk signature failed')
        return res.status(400).send('Invalid signature')
      }

      console.log('Clerk event:', evt.type)

      await inngest.send({
        name: `clerk/${evt.type}`,
        data: evt.data
      })

      res.json({ received: true })
    }
  )

  app.use(express.json())

  app.get('/', (req, res) => res.send('Server is running'))
  app.use('/api/inngest', serve({ client: inngest, functions }))
  app.get('/api/hello', async function (req, res, next) {
    await inngest.send({
      name: 'test/hello.world',
      data: {
        email: 'testUser@example.com'
      }
    }).catch(err => next(err))
    res.json({ message: 'Event sent!' })
  })

  // app.use(
  //   morgan('dev', {
  //     skip: (req) => req.method === 'PUT' && req.url.includes('/api/inngest')
  //   })
  // )

  app.use('/v1', API_V1)

  app.use(errorHandlingMiddleware)

  swaggerDocs(app)

  const server = http.createServer(app)

  initSocket(server)
  const PORT = process.env.PORT || 3000
  if (env.BUILD_MODE === 'production') {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Production: Hi ${env.AUTHOR}, Back-end app is running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      logger.info(`Local DEV: Hi ${env.AUTHOR}, Back-end Server is running successfully at Host: ${env.LOCAL_DEV_APP_HOST} and Port: ${env.LOCAL_DEV_APP_PORT}`)
    })
  }
}

(async () => {
  try {
    logger.info('Connecting to MongoDB CLoud Atlas...')
    await connectDB()
    logger.info('Connected to MongoDB Cloud Atlas')
    await seedDB()
    logger.info('DataBase has beed seed')
    startServer()
  }
  catch (error) {
    logger.error(error)
    process.exit(0)
  }
})()
