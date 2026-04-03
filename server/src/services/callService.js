import { StatusCodes } from 'http-status-codes'
import twilio from 'twilio'
import { env } from '~/config/environment'
import userModel from '~/models/userModel'
import ApiError from '~/utils/ApiError'

const getTwilioToken = async (userId, reqQuery) => {
  try {
    const existUser = await userModel.findById({ _id: userId })
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    const { roomName } = reqQuery

    const userData = {
      id: existUser._id,
      username: existUser.username
    }

    const identityString = JSON.stringify(userData)
    const accessToken = twilio.jwt.AccessToken
    const videoGrant = accessToken.VideoGrant

    // console.log(accessToken)
    // console.log(videoGrant)

    const token = new accessToken(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_API_KEY_SID,
      env.TWILIO_API_KEY_SECRET,
      { identity: identityString }
    )

    const grant = new videoGrant({ room: roomName })
    token.addGrant(grant)

    return { token: token.toJwt() }
  } catch (error) {
    throw error
  }
}

export const callService = {
  getTwilioToken
}