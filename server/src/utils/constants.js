import { env } from '~/config/environment'

//nhung domain duoc phep truy cap toi tai nguyen server
export const WHITELIST_DOMAINS = [
  'https://mern-social-media-main-client.vercel.app',
  'http://localhost:5173'
]

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

