export const sanitizeUsername = (email) => {
  return email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_|_$/g, '')
}
