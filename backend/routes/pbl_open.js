const express = require('express')
const router = express.Router()
const pool = require('../db')

// GET /api/pbl-open
router.get('/', async (req, res) => {
  try {
    const { category, china_grade, is_certified, grade, keyword } = req.query
    let sql = `SELECT id, sort_num, pa_type, is_certified, category, subject, course_name,
                      china_grade, grade_6, grade_7, grade_8, grade_9, grade_10, grade_11, grade_12,
                      duration, name_en, name_zh, url_original, url_translation, notes, rubric_notes,
                      download_status
               FROM pbl_open_project WHERE 1=1`
    const params = []
    if (category)     { sql += ' AND category = ?';       params.push(category) }
    if (china_grade)  { sql += ' AND china_grade = ?';    params.push(china_grade) }
    if (is_certified !== undefined && is_certified !== '') {
      sql += ' AND is_certified = ?'; params.push(Number(is_certified))
    }
    if (grade) {
      sql += ` AND grade_${grade} = 1`
    }
    if (keyword) {
      sql += ' AND (name_en LIKE ? OR name_zh LIKE ? OR course_name LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }
    sql += ' ORDER BY sort_num ASC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/pbl-open/stats
router.get('/stats', async (req, res) => {
  try {
    const [[total]]  = await pool.query('SELECT COUNT(*) AS n FROM pbl_open_project')
    const [[cert]]   = await pool.query('SELECT COUNT(*) AS n FROM pbl_open_project WHERE is_certified=1')
    const [byCat]    = await pool.query('SELECT category, COUNT(*) AS n FROM pbl_open_project GROUP BY category ORDER BY n DESC')
    const [byGrade]  = await pool.query('SELECT china_grade, COUNT(*) AS n FROM pbl_open_project GROUP BY china_grade')
    const [byPa]     = await pool.query('SELECT pa_type, COUNT(*) AS n FROM pbl_open_project GROUP BY pa_type')
    res.json({ total: total.n, certified: cert.n, byCategory: byCat, byGrade, byPaType: byPa })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/pbl-open/:id
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pbl_open_project WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ error: '未找到' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
