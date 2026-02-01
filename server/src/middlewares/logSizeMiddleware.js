/* eslint-disable no-console */
export const logResponseSize = (req, res, next) => {
  const oldJson = res.json
  res.json = function (data) {
    const jsonString = JSON.stringify(data)
    const rawBytes = Buffer.byteLength(jsonString, 'utf8')
    console.log(`[BE] Response size for ${req.path}: ${rawBytes / 1024} KB (before compression)`)
    return oldJson.call(this, data)
  }
  next()
}