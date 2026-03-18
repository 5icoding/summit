const express = require('express')
const router = express.Router()
const pool = require('../db')

// 获取单个维度详情（含水平 + 课标）
router.get('/:id', async (req, res) => {
  try {
    const [[dim]] = await pool.query(
      'SELECT cd.*, d.name AS domain_name FROM capability_dimension cd JOIN capability_domain d ON cd.domain_id = d.id WHERE cd.id = ?',
      [req.params.id]
    )
    if (!dim) return res.status(404).json({ error: '未找到' })

    const [levels] = await pool.query(
      'SELECT level, description FROM capability_level WHERE dimension_id = ? ORDER BY level',
      [req.params.id]
    )
    const [[curriculum]] = await pool.query(
      'SELECT language, social, science FROM dimension_curriculum WHERE dimension_id = ?',
      [req.params.id]
    )
    res.json({ ...dim, levels, curriculum: curriculum || null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 统计数据
router.get('/stats/summary', async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM capability_dimension')
    const [[{ lang }]] = await pool.query('SELECT COUNT(*) AS lang FROM dimension_curriculum WHERE language = 1')
    const [[{ soc  }]] = await pool.query('SELECT COUNT(*) AS soc  FROM dimension_curriculum WHERE social  = 1')
    const [[{ sci  }]] = await pool.query('SELECT COUNT(*) AS sci  FROM dimension_curriculum WHERE science = 1')
    res.json({ total, language: lang, social: soc, science: sci })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
