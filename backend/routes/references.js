const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/references
// 可选 query: type, link_type, keyword
router.get('/', async (req, res) => {
  try {
    const { type, link_type, keyword } = req.query
    let sql = `SELECT id, seq, type, author, year, title, title_zh, source, link, notes,
                      link_type, local_file, download_status
               FROM pbl_references WHERE 1=1`
    const params = []
    if (type)      { sql += ' AND type = ?';             params.push(type) }
    if (link_type) { sql += ' AND link_type = ?';        params.push(link_type) }
    if (keyword)   { sql += ' AND (title LIKE ? OR title_zh LIKE ? OR author LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`) }
    sql += ' ORDER BY seq ASC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/references/stats
router.get('/stats', async (req, res) => {
  try {
    const [byType]     = await pool.query(`SELECT type, COUNT(*) AS n FROM pbl_references GROUP BY type ORDER BY n DESC`)
    const [byLinkType] = await pool.query(`SELECT IFNULL(link_type,'无链接') AS link_type, COUNT(*) AS n FROM pbl_references GROUP BY link_type`)
    const [[total]]    = await pool.query(`SELECT COUNT(*) AS n FROM pbl_references`)
    const [[urlOk]]    = await pool.query(`SELECT COUNT(*) AS n FROM pbl_references WHERE download_status LIKE 'ok_200'`)
    res.json({ total: total.n, urlOk: urlOk.n, byType, byLinkType })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/references/:id
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pbl_references WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ error: '未找到' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
