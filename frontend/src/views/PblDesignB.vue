<template>
  <div class="layout">
    <!-- 左侧筛选栏 -->
    <aside class="filter-panel">
      <div class="fp-title">筛选</div>

      <div class="fp-section">
        <div class="fp-label">学科</div>
        <div class="fp-options">
          <button
            v-for="cat in categories" :key="cat.key"
            class="fp-chip"
            :class="[cat.cls, { active: filters.category === cat.key }]"
            @click="toggleFilter('category', cat.key)"
          >
            {{ cat.icon }} {{ cat.label }}
            <span class="chip-count">{{ countBy('category', cat.key) }}</span>
          </button>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-label">学段</div>
        <div class="fp-options">
          <button
            v-for="g in grades" :key="g.key"
            class="fp-chip grade-chip"
            :class="{ active: filters.grade === g.key }"
            @click="toggleFilter('grade', g.key)"
          >
            {{ g.label }}
            <span class="chip-count">{{ countBy('grade', g.key) }}</span>
          </button>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-label">所需时长</div>
        <div class="fp-options">
          <button
            v-for="d in durations" :key="d"
            class="fp-chip dur-chip"
            :class="{ active: filters.duration === d }"
            @click="toggleFilter('duration', d)"
          >{{ d }}</button>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-label">仅看已认证</div>
        <label class="toggle">
          <input type="checkbox" v-model="filters.certified" />
          <span class="slider"></span>
        </label>
      </div>

      <button class="reset-btn" @click="resetFilters">重置筛选</button>
    </aside>

    <!-- 右侧卡片区 -->
    <main class="card-area">
      <!-- 顶部搜索 + 结果数 -->
      <div class="top-bar">
        <input v-model="keyword" class="search-input" placeholder="搜索项目名称..." />
        <span class="result-count">共 <b>{{ filtered.length }}</b> 个项目</span>
        <div class="sort-btns">
          <button :class="['sort-btn', { active: sort==='grade' }]" @click="sort='grade'">按学段</button>
          <button :class="['sort-btn', { active: sort==='cat' }]"   @click="sort='cat'">按学科</button>
        </div>
      </div>

      <!-- 分组展示 -->
      <div v-if="filtered.length === 0" class="no-result">没有符合条件的项目</div>
      <div v-else class="groups">
        <div v-for="group in grouped" :key="group.key" class="group-block">
          <div class="group-title">
            <span :class="['group-badge', group.cls]">{{ group.label }}</span>
            <span class="group-num">{{ group.items.length }} 个</span>
          </div>
          <div class="card-grid">
            <div
              v-for="p in group.items" :key="p.id"
              class="pbl-card"
              :class="{ expanded: expanded === p.id, 'has-trans': p.url_translation }"
              @click="expanded = expanded === p.id ? null : p.id"
            >
              <!-- 卡片头 -->
              <div class="card-top">
                <div class="card-badges">
                  <span :class="['cat-dot', getCat(p.category)?.cls]"></span>
                  <span :class="['pa-tag', `pa-${p.pa_type}`]">PA{{ p.pa_type }}</span>
                  <span v-if="p.is_certified" class="cert-tag">✓</span>
                </div>
                <span class="expand-icon">{{ expanded === p.id ? '▲' : '▼' }}</span>
              </div>
              <div class="card-name">{{ p.name_zh || p.name_en }}</div>
              <div class="card-name-en">{{ p.name_en }}</div>
              <div class="card-tags">
                <span v-if="p.china_grade" class="tag-gray">{{ p.china_grade }}</span>
                <span v-if="p.duration" class="tag-amber">{{ p.duration }}</span>
              </div>

              <!-- 展开详情 -->
              <transition name="expand">
                <div v-if="expanded === p.id" class="card-detail" @click.stop>
                  <div v-if="p.course_name" class="det-row"><span class="det-k">课程</span>{{ p.course_name }}</div>
                  <div v-if="p.notes" class="det-row notes-row"><span class="det-k">探月备注</span>{{ p.notes }}</div>
                  <div class="det-links">
                    <a v-if="p.url_original" :href="p.url_original" target="_blank" class="det-link orig">原文 →</a>
                    <a v-if="p.url_translation" :href="p.url_translation" target="_blank" class="det-link trans">译文 →</a>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getPblProjects } from '../api/index.js'

const projects = ref([])
const keyword  = ref('')
const sort     = ref('cat')
const expanded = ref(null)

const filters = reactive({ category: null, grade: null, duration: null, certified: false })

const categories = [
  { key: '语言', label: '语言', icon: '📖', cls: 'lang' },
  { key: '数学', label: '数学', icon: '📐', cls: 'math' },
  { key: '科学', label: '科学', icon: '🔬', cls: 'sci' },
  { key: '社科', label: '社科', icon: '🌏', cls: 'soc' },
]
const grades    = [
  { key: '小学',   label: '小学' },
  { key: '初中',   label: '初中' },
  { key: '高中',   label: '高中' },
  { key: '初高中', label: '初高中' },
]
const durations = ['1周内3至5天', '1至2周', '2至3周', '4周及以上']

function getCat(key) { return categories.find(c => c.key === key) }

function toggleFilter(field, val) {
  filters[field] = filters[field] === val ? null : val
  expanded.value = null
}
function resetFilters() {
  Object.assign(filters, { category: null, grade: null, duration: null, certified: false })
  keyword.value = ''
}

function countBy(field, val) {
  if (field === 'category') return projects.value.filter(p => p.category === val).length
  if (field === 'grade')    return projects.value.filter(p => p.china_grade?.includes(val)).length
  return 0
}

const filtered = computed(() => {
  return projects.value.filter(p => {
    if (filters.category && p.category !== filters.category) return false
    if (filters.grade    && !p.china_grade?.includes(filters.grade)) return false
    if (filters.duration && p.duration !== filters.duration) return false
    if (filters.certified && !p.is_certified) return false
    if (keyword.value && !`${p.name_en}${p.name_zh}`.toLowerCase().includes(keyword.value.toLowerCase())) return false
    return true
  })
})

const grouped = computed(() => {
  const groupKey = sort.value === 'cat' ? 'category' : 'china_grade'
  const map = {}
  filtered.value.forEach(p => {
    const k = p[groupKey] || '其他'
    if (!map[k]) map[k] = []
    map[k].push(p)
  })
  return Object.entries(map).map(([key, items]) => {
    const cat = getCat(key)
    return {
      key,
      label: key,
      cls: cat ? cat.cls : 'grade',
      items
    }
  })
})

onMounted(async () => {
  const res = await getPblProjects()
  projects.value = res.data
})
</script>

<style scoped>
*{ box-sizing:border-box; }
.layout { display:flex; gap:20px; min-height:calc(100vh - 56px - 56px); }

/* ── 左侧筛选 ── */
.filter-panel { width:220px; flex-shrink:0; background:#fff; border-radius:12px; padding:20px 16px; border:1px solid #e8ecf2; height:fit-content; position:sticky; top:0; }
.fp-title { font-size:14px; font-weight:800; color:#1e293b; margin-bottom:16px; }
.fp-section { margin-bottom:18px; }
.fp-label { font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1px; margin-bottom:8px; }
.fp-options { display:flex; flex-direction:column; gap:5px; }
.fp-chip { display:flex; align-items:center; justify-content:space-between; padding:7px 10px; border-radius:7px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; font-size:12px; color:#64748b; transition:all .15s; }
.fp-chip:hover { border-color:#6366f1; }
.fp-chip.active { color:#fff; border-color:transparent; }
.fp-chip.lang.active{background:#3b82f6}.fp-chip.math.active{background:#8b5cf6}
.fp-chip.sci.active{background:#22c55e}.fp-chip.soc.active{background:#f59e0b}
.grade-chip.active { background:#6366f1; }
.dur-chip.active   { background:#475569; color:#fff; }
.chip-count { background:rgba(0,0,0,.08); padding:1px 6px; border-radius:8px; font-size:10px; }
.fp-chip.active .chip-count { background:rgba(255,255,255,.25); }

/* 开关 */
.toggle { display:inline-flex; align-items:center; cursor:pointer; }
.toggle input { display:none; }
.slider { width:40px; height:22px; background:#e2e8f0; border-radius:11px; position:relative; transition:.2s; }
.slider::after { content:''; position:absolute; left:3px; top:3px; width:16px; height:16px; background:#fff; border-radius:50%; transition:.2s; }
.toggle input:checked + .slider { background:#6366f1; }
.toggle input:checked + .slider::after { left:21px; }
.reset-btn { width:100%; padding:8px; border-radius:8px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; font-size:12px; color:#64748b; margin-top:4px; }
.reset-btn:hover { background:#f8f9ff; border-color:#6366f1; color:#6366f1; }

/* ── 右侧卡片 ── */
.card-area { flex:1; min-width:0; }
.top-bar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
.search-input { flex:1; min-width:200px; padding:9px 14px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; outline:none; }
.search-input:focus { border-color:#6366f1; }
.result-count { font-size:13px; color:#94a3b8; white-space:nowrap; }
.result-count b { color:#1e293b; }
.sort-btns { display:flex; gap:4px; }
.sort-btn { padding:6px 14px; border-radius:6px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; font-size:12px; color:#64748b; }
.sort-btn.active { background:#6366f1; border-color:#6366f1; color:#fff; }

.no-result { text-align:center; padding:60px; color:#94a3b8; }

.groups { display:flex; flex-direction:column; gap:24px; }
.group-block { }
.group-title { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.group-badge { padding:4px 14px; border-radius:20px; font-size:13px; font-weight:700; color:#fff; }
.group-badge.lang{background:#3b82f6}.group-badge.math{background:#8b5cf6}
.group-badge.sci{background:#22c55e}.group-badge.soc{background:#f59e0b}
.group-badge.grade { background:#6366f1; }
.group-num { font-size:12px; color:#94a3b8; }
.card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px; }

/* 卡片 */
.pbl-card { background:#fff; border-radius:12px; padding:16px; border:1.5px solid #e8ecf2; cursor:pointer; transition:all .2s; }
.pbl-card:hover { border-color:#c7d2fe; box-shadow:0 4px 16px rgba(99,102,241,.08); }
.pbl-card.expanded { border-color:#6366f1; background:#f8f9ff; }
.pbl-card.has-trans { border-left:3px solid #22c55e; }
.card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.card-badges { display:flex; align-items:center; gap:6px; }
.cat-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.cat-dot.lang{background:#3b82f6}.cat-dot.math{background:#8b5cf6}
.cat-dot.sci{background:#22c55e}.cat-dot.soc{background:#f59e0b}
.pa-tag { padding:1px 6px; border-radius:4px; font-size:10px; font-weight:700; color:#fff; }
.pa-3{background:#6366f1}.pa-4{background:#8b5cf6}.pa-2{background:#64748b}.pa-1{background:#94a3b8}
.cert-tag { background:#fef3c7; color:#b45309; font-size:10px; padding:1px 6px; border-radius:4px; font-weight:700; }
.expand-icon { font-size:10px; color:#94a3b8; }
.card-name    { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:3px; line-height:1.4; }
.card-name-en { font-size:11px; color:#94a3b8; margin-bottom:8px; }
.card-tags    { display:flex; flex-wrap:wrap; gap:5px; }
.tag-gray  { background:#f1f5f9; color:#64748b; font-size:11px; padding:2px 7px; border-radius:4px; }
.tag-amber { background:#fef3c7; color:#b45309; font-size:11px; padding:2px 7px; border-radius:4px; }

.card-detail { margin-top:14px; padding-top:14px; border-top:1px solid #e8ecf2; }
.det-row { font-size:12px; color:#374151; margin-bottom:7px; display:flex; align-items:flex-start; gap:8px; }
.notes-row { color:#15803d; }
.det-k { background:#f1f5f9; color:#94a3b8; font-size:10px; padding:2px 6px; border-radius:3px; flex-shrink:0; }
.det-links { display:flex; gap:8px; margin-top:10px; }
.det-link { padding:6px 14px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; }
.det-link.orig  { background:#6366f1; color:#fff; }
.det-link.trans { background:#22c55e; color:#fff; }

/* 动画 */
.expand-enter-active,.expand-leave-active { transition:all .2s ease; overflow:hidden; }
.expand-enter-from,.expand-leave-to { opacity:0; max-height:0; }
.expand-enter-to,.expand-leave-from { opacity:1; max-height:300px; }
</style>
