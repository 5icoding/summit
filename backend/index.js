const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const pool = require('./db')
pool.getConnection()
  .then(conn => { console.log('MySQL 数据库连接成功'); conn.release() })
  .catch(err => { console.error('MySQL 连接失败:', err.message) })

// 路由
app.use('/api/domains',    require('./routes/domains'))
app.use('/api/dimensions', require('./routes/dimensions'))
app.use('/api/pbl',        require('./routes/pbl'))

app.get('/', (req, res) => res.json({ message: 'Summit API 运行中' }))

app.listen(port, () => console.log(`后端服务运行在 http://localhost:${port}`))
