import { env } from '~/config/environment'

const domains = env.WHITELIST_DOMAINS
  ? env.WHITELIST_DOMAINS.split(',')
  : []

//nhung domain duoc phep truy cap toi tai nguyen server
export const WHITELIST_DOMAINS = domains


export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

