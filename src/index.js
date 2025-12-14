import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { linksRouter } from './routes/links.js'
import { redirectRouter } from './routes/redirect.js'

const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  return res.json({ ok: true })
})

app.use('/api/links', linksRouter)

// redirect router should be last
app.use('/', redirectRouter)

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`Shortener server listening on :${port}`)
})
