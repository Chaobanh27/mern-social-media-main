import { StatusCodes } from 'http-status-codes'
import { callService } from '~/services/callService'

const getTwilioToken = async (req, res, next) => {
  try {
    const userId = req.authInfo.mongoId
    const result = await callService.getTwilioToken(userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const callController = {
  getTwilioToken
}