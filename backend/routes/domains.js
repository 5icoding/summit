const express = require('express')
const router = express.Router()
const pool = require('../db')

// 获取完整嵌套数据：领域 → 维度 → 课标 + 水平
router.get('/full', async (req, res) => {
  try {
    const [domains] = await pool.query(
      'SELECT id, name, sort_order FROM capability_domain ORDER BY sort_order'
    )
    const [dimensions] = await pool.query(
      'SELECT id, domain_id, name, description, sort_order FROM capability_dimension ORDER BY domain_id, sort_order'
    )
    const [levels] = await pool.query(
      'SELECT id, dimension_id, level, description FROM capability_level ORDER BY dimension_id, level'
    )
    const [curricula] = await pool.query(
      'SELECT dimension_id, language, social, science FROM dimension_curriculum'
    )

    const currMap = {}
    curricula.forEach(c => { currMap[c.dimension_id] = c })

    const levelMap = {}
    levels.forEach(l => {
      if (!levelMap[l.dimension_id]) levelMap[l.dimension_id] = []
      levelMap[l.dimension_id].push({ level: l.level, description: l.description })
    })

    const dimMap = {}
    dimensions.forEach(d => {
      if (!dimMap[d.domain_id]) dimMap[d.domain_id] = []
      dimMap[d.domain_id].push({
        id: d.id,
        name: d.name,
        description: d.description,
        sort_order: d.sort_order,
        curriculum: currMap[d.id] || null,
        levels: levelMap[d.id] || []
      })
    })

    const result = domains.map(d => ({
      id: d.id,
      name: d.name,
      sort_order: d.sort_order,
      dimensions: dimMap[d.id] || []
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 获取所有领域列表
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, sort_order FROM capability_domain ORDER BY sort_order'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 获取单个领域下的维度
router.get('/:id/dimensions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description FROM capability_dimension WHERE domain_id = ? ORDER BY sort_order',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
