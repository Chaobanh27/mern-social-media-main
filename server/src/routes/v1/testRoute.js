import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { Promise } from 'mongoose'
import commentModel from '~/models/commentModel'
import conversationModel from '~/models/conversationModel'
import conversationParticipantModel from '~/models/conversationParticipantModel'
import messageModel from '~/models/messageModel'
import reactionModel from '~/models/reactionModel'
import { allUsersData } from '~/utils/testData'


const Router = express.Router()

Router.route('/fetchAllUsers')
  .get((req, res) => {
    res.json(allUsersData)
  })

Router.route('/delete-all')
  .delete(async (req, res, next) => {
    try {
      await messageModel.deleteMany({})
      await conversationModel.deleteMany({})
      await reactionModel.deleteMany({})
      await conversationParticipantModel.deleteMany({})
      res.status(StatusCodes.OK).json({ message: 'everything is deleted' })
    } catch (error) {
      next(error)
    }

  })

export const testRoute = Router
