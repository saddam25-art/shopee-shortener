import UAParser from 'ua-parser-js'

export function detectDevice(req) {
  const ua = req.headers['user-agent'] || ''
  const parser = new UAParser(ua)
  const os = parser.getOS()

  const name = (os.name || '').toLowerCase()
  if (name.includes('android')) return { device: 'android', ua }
  if (name.includes('ios') || name.includes('iphone') || name.includes('ipad')) return { device: 'ios', ua }
  return { device: 'desktop', ua }
}
