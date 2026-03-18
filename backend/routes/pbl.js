const express = require('express')
const router = express.Router()
const pool = require('../db')

// ── 列表 ──────────────────────────────────────────────
// GET /api/pbl
router.get('/', async (req, res) => {
  try {
    const { category, grade, certified } = req.query
    let sql = `SELECT id, sort_id, pa_type, is_certified, category, subject,
      course_name, china_grade, grade_level,
      grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,grade_12,
      duration, name_en, name_zh, url_original, url_translation, notes
      FROM pbl_project WHERE 1=1`
    const params = []
    if (category)             { sql += ' AND category = ?';        params.push(category) }
    if (grade)                { sql += ' AND china_grade LIKE ?';  params.push(`%${grade}%`) }
    if (certified !== undefined) { sql += ' AND is_certified = ?'; params.push(certified) }
    sql += ' ORDER BY is_certified DESC, sort_id ASC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── 统计（必须在 /:id 之前）────────────────────────────
// GET /api/pbl/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const [[total]]    = await pool.query('SELECT COUNT(*) AS n FROM pbl_project')
    const [[cert]]     = await pool.query('SELECT COUNT(*) AS n FROM pbl_project WHERE is_certified=1')
    const [byCat]      = await pool.query('SELECT category, COUNT(*) AS n FROM pbl_project GROUP BY category')
    const [byGrade]    = await pool.query('SELECT china_grade, COUNT(*) AS n FROM pbl_project GROUP BY china_grade')
    const [byDuration] = await pool.query('SELECT duration, COUNT(*) AS n FROM pbl_project WHERE duration IS NOT NULL GROUP BY duration')
    res.json({ total: total.n, certified: cert.n, byCategory: byCat, byGrade, byDuration })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── 指导结构树 + 案例内容（必须在 /:id 之前）────────────
// GET /api/pbl/instructions
router.get('/instructions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.id, i.parent_id, i.title, i.en_title, i.number, s.content
      FROM pbl_project_instructions i
      LEFT JOIN pbl_project_sample s ON s.instruction_id = i.id
      ORDER BY i.id
    `)
    const parents  = rows.filter(r => !r.parent_id)
    const children = rows.filter(r =>  r.parent_id)
    const tree = parents.map(p => ({
      ...p,
      children: children.filter(c => c.parent_id === p.id)
    }))
    res.json(tree)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── 单个项目详情 ───────────────────────────────────────
// GET /api/pbl/:id
router.get('/:id', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pbl_project WHERE id = ?', [req.params.id])
    if (!row) return res.status(404).json({ error: '未找到' })
    res.json(row)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
