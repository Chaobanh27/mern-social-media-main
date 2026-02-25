import { Inngest } from 'inngest'
import userModel from '~/models/userModel'
import { sanitizeUsername } from '~/utils/formatters'
import { generateUniqueUsername } from '~/utils/genericHelper'

// Create a client to send and receive events
export const inngest = new Inngest({ id: 'social-media-app' })

//test function
const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  // eslint-disable-next-line no-unused-vars
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    return { message: 'Hello world!' }
  }
)

const clerkUserCreated = inngest.createFunction(
  { id: 'clerk-user-created' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data
    let email = email_addresses[0].email_address
    // eslint-disable-next-line no-console
    console.log('New Clerk user:', event.data)

    const baseUsername = sanitizeUsername(email)

    const username = await generateUniqueUsername(baseUsername)

    const newUser = {
      clerkId: id,
      username: username,
      email: email_addresses[0].email_address,
      fullName: first_name + ' ' + last_name,
      normalizedUsername: username,
      profilePicture: image_url
    }

    await userModel.create(newUser)
  }
)

// Create an empty array where we'll export future Inngest functions
export const functions = [
  helloWorld,
  clerkUserCreated
]