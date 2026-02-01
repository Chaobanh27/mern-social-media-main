import express from 'express'
import { allUsersData } from '~/utils/testData'


const Router = express.Router()

Router.route('/fetchAllUsers')
  .get((req, res) => {
    res.json(allUsersData)
  })

export const testRoute = Router
