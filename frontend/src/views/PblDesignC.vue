<template>
  <div class="page">
    <!-- 顶部统计 -->
    <div class="stat-row">
      <div v-for="cat in categories" :key="cat.key" :class="['stat-card', cat.cls]">
        <div class="sc-num">{{ countByCategory(cat.key) }}</div>
        <div class="sc-label">{{ cat.icon }} {{ cat.label }}</div>
      </div>
    </div>

    <!-- 学科 Tab -->
    <div class="tab-bar">
      <button
        v-for="cat in allTabs" :key="cat.key"
        :class="['tab-btn', { active: activeTab === cat.key }]"
        @click="activeTab = cat.key; selectedProject = null"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        <span class="tab-label">{{ cat.label }}</span>
        <span class="tab-count">{{ countByCategory(cat.key) }}</span>
      </button>
    </div>

    <!-- 看板：按学段分列 -->
    <div class="kanban-wrap">
      <div v-for="grade in grades" :key="grade.key" class="kanban-col">
        <div :class="['col-head', grade.cls]">
          <span class="col-title">{{ grade.label }}</span>
          <span class="col-count">{{ getColProjects(grade.key).length }}</span>
        </div>
        <div class="col-body">
          <div
            v-for="p in getColProjects(grade.key)"
            :key="p.id"
            :class="['kanban-card', getCat(p.category)?.cls, { selected: selectedProject?.id === p.id }]"
            @click="selectedProject = selectedProject?.id === p.id ? null : p"
          >
            <div class="kc-head">
              <span :class="['kc-cat', getCat(p.category)?.cls]">{{ p.category }}</span>
              <span :class="['pa-tag', `pa-${p.pa_type}`]">PA{{ p.pa_type }}</span>
            </div>
            <div class="kc-name">{{ p.name_zh || p.name_en }}</div>
            <div v-if="p.name_zh" class="kc-en">{{ p.name_en }}</div>
            <div class="kc-footer">
              <span v-if="p.duration" class="kc-dur">{{ p.duration }}</span>
              <span v-if="p.url_translation" class="kc-has-trans">译文</span>
              <span v-if="p.notes" class="kc-note-dot" :title="p.notes">★</span>
            </div>
          </div>
          <div v-if="getColProjects(grade.key).length === 0" class="col-empty">暂无项目</div>
        </div>
      </div>
    </div>

    <!-- 右侧详情抽屉 -->
    <transition name="drawer">
      <div v-if="selectedProject" class="detail-drawer">
        <div class="drawer-inner">
          <div class="drawer-header">
            <button @click="selectedProject = null" class="drawer-close">← 关闭</button>
            <div class="drawer-badges">
              <span :class="['cat-badge', getCat(selectedProject.category)?.cls]">{{ selectedProject.category }}</span>
              <span :class="['pa-badge', `pa-${selectedProject.pa_type}`]">PA{{ selectedProject.pa_type }}</span>
              <span v-if="selectedProject.is_certified" class="cert-badge">官方认证</span>
            </div>
          </div>

          <h3 class="drawer-title">{{ selectedProject.name_zh || selectedProject.name_en }}</h3>
          <p v-if="selectedProject.name_zh" class="drawer-en">{{ selectedProject.name_en }}</p>

          <div class="info-grid">
            <div class="info-item" v-if="selectedProject.china_grade">
              <div class="info-k">学段</div>
              <div class="info-v">{{ selectedProject.china_grade }}</div>
            </div>
            <div class="info-item" v-if="selectedProject.grade_level">
              <div class="info-k">年级</div>
              <div class="info-v">{{ selectedProject.grade_level }}</div>
            </div>
            <div class="info-item" v-if="selectedProject.subject">
              <div class="info-k">学科</div>
              <div class="info-v">{{ selectedProject.subject }}</div>
            </div>
            <div class="info-item" v-if="selectedProject.course_name">
              <div class="info-k">课程</div>
              <div class="info-v">{{ selectedProject.course_name }}</div>
            </div>
            <div class="info-item" v-if="selectedProject.duration">
              <div class="info-k">时长</div>
              <div class="info-v highlight-amber">{{ selectedProject.duration }}</div>
            </div>
            <div class="info-item" v-if="selectedProject.pa_type">
              <div class="info-k">类型</div>
              <div class="info-v">{{ paTypeLabel(selectedProject.pa_type) }}</div>
            </div>
          </div>

          <div v-if="selectedProject.notes" class="notes-box">
            <div class="notes-label">探月备注</div>
            <p class="notes-text">{{ selectedProject.notes }}</p>
          </div>

          <!-- 适用年级 -->
          <div class="grade-chips-wrap">
            <div class="gc-label">适用年级</div>
            <div class="grade-chips">
              <span v-for="g in [6,7,8,9,10,11,12]" :key="g"
                :class="['grade-chip', { active: selectedProject[`grade_${g}`] }]"
              >{{ g }}年级</span>
            </div>
          </div>

          <div class="drawer-links">
            <a v-if="selectedProject.url_original" :href="selectedProject.url_original" target="_blank" class="dlink orig">
              查看原文 ↗
            </a>
            <a v-if="selectedProject.url_translation" :href="selectedProject.url_translation" target="_blank" class="dlink trans">
              查看译文 ↗
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPblProjects } from '../api/index.js'

const projects = ref([])
const activeTab = ref('all')
const selectedProject = ref(null)

const categories = [
  { key: '语言', label: '语言', icon: '📖', cls: 'lang' },
  { key: '数学', label: '数学', icon: '📐', cls: 'math' },
  { key: '科学', label: '科学', icon: '🔬', cls: 'sci' },
  { key: '社科', label: '社科', icon: '🌏', cls: 'soc' },
]
const allTabs = [{ key: 'all', label: '全部', icon: '◈' }, ...categories]
const grades  = [
  { key: '小学',   label: '小学',   cls: 'g-primary' },
  { key: '初中',   label: '初中',   cls: 'g-middle' },
  { key: '高中',   label: '高中',   cls: 'g-high' },
  { key: '初高中', label: '初高中', cls: 'g-both' },
]

function getCat(key) { return categories.find(c => c.key === key) }

function countByCategory(key) {
  if (key === 'all') return projects.value.length
  return projects.value.filter(p => p.category === key).length
}

const tabProjects = computed(() =>
  activeTab.value === 'all'
    ? projects.value
    : projects.value.filter(p => p.category === activeTab.value)
)

function getColProjects(gradeKey) {
  return tabProjects.value.filter(p => p.china_grade?.includes(gradeKey))
}

function paTypeLabel(t) {
  return ['', '建构反应式', '独立任务', '课程嵌入', '复杂项目'][t] || t
}

onMounted(async () => {
  const res = await getPblProjects()
  projects.value = res.data
})
</script>

<style scoped>
*{ box-sizing:border-box; }
.page { position:relative; }

/* 统计行 */
.stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
.stat-card { border-radius:10px; padding:16px 20px; color:#fff; display:flex; align-items:center; justify-content:space-between; }
.stat-card.lang{background:linear-gradient(135deg,#3b82f6,#60a5fa)}
.stat-card.math{background:linear-gradient(135deg,#8b5cf6,#a78bfa)}
.stat-card.sci{background:linear-gradient(135deg,#22c55e,#4ade80)}
.stat-card.soc{background:linear-gradient(135deg,#f59e0b,#fbbf24)}
.sc-num   { font-size:32px; font-weight:800; }
.sc-label { font-size:14px; opacity:.9; }

/* Tab */
.tab-bar { display:flex; gap:6px; margin-bottom:20px; background:#fff; padding:8px; border-radius:12px; border:1px solid #e8ecf2; }
.tab-btn { display:flex; align-items:center; gap:8px; padding:9px 18px; border-radius:8px; border:none; background:none; cursor:pointer; font-size:13px; color:#64748b; transition:all .15s; flex:1; justify-content:center; }
.tab-btn:hover { background:#f8f9ff; }
.tab-btn.active { background:#6366f1; color:#fff; }
.tab-icon { font-size:15px; }
.tab-count { background:rgba(0,0,0,.1); padding:1px 7px; border-radius:8px; font-size:11px; }
.tab-btn.active .tab-count { background:rgba(255,255,255,.25); }

/* 看板 */
.kanban-wrap { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.kanban-col { background:#f8fafc; border-radius:12px; overflow:hidden; border:1px solid #e8ecf2; }
.col-head { padding:12px 16px; display:flex; justify-content:space-between; align-items:center; color:#fff; font-weight:700; }
.g-primary{ background:#06b6d4; }
.g-middle { background:#6366f1; }
.g-high   { background:#8b5cf6; }
.g-both   { background:#f59e0b; }
.col-title { font-size:13px; }
.col-count { background:rgba(255,255,255,.3); padding:1px 8px; border-radius:8px; font-size:11px; }
.col-body  { padding:10px; display:flex; flex-direction:column; gap:8px; min-height:80px; }
.col-empty { text-align:center; color:#cbd5e1; font-size:12px; padding:16px 0; }

/* 看板卡片 */
.kanban-card { background:#fff; border-radius:8px; padding:12px; cursor:pointer; border:1.5px solid transparent; transition:all .15s; }
.kanban-card:hover { box-shadow:0 2px 12px rgba(0,0,0,.08); }
.kanban-card.selected { border-color:#6366f1; background:#f0f4ff; }
.kanban-card.lang { border-left:3px solid #3b82f6; }
.kanban-card.math { border-left:3px solid #8b5cf6; }
.kanban-card.sci  { border-left:3px solid #22c55e; }
.kanban-card.soc  { border-left:3px solid #f59e0b; }
.kc-head  { display:flex; justify-content:space-between; margin-bottom:6px; }
.kc-cat   { font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; }
.kc-cat.lang{background:#dbeafe;color:#1d4ed8}
.kc-cat.math{background:#ede9fe;color:#6d28d9}
.kc-cat.sci{background:#dcfce7;color:#15803d}
.kc-cat.soc{background:#fef3c7;color:#b45309}
.pa-tag{ font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; color:#fff; }
.pa-3{background:#6366f1}.pa-4{background:#8b5cf6}.pa-2{background:#64748b}.pa-1{background:#94a3b8}
.kc-name  { font-size:13px; font-weight:600; color:#1e293b; line-height:1.4; margin-bottom:3px; }
.kc-en    { font-size:10px; color:#94a3b8; margin-bottom:6px; }
.kc-footer{ display:flex; flex-wrap:wrap; gap:4px; }
.kc-dur   { font-size:10px; background:#fef3c7; color:#b45309; padding:1px 6px; border-radius:3px; }
.kc-has-trans { font-size:10px; background:#dcfce7; color:#15803d; padding:1px 6px; border-radius:3px; }
.kc-note-dot { font-size:10px; color:#f59e0b; }

/* 详情抽屉 */
.detail-drawer { position:fixed; right:0; top:56px; bottom:0; width:340px; background:#fff; border-left:1px solid #e8ecf2; z-index:50; overflow-y:auto; box-shadow:-4px 0 20px rgba(0,0,0,.08); }
.drawer-inner  { padding:24px 20px; }
.drawer-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.drawer-close  { background:none; border:none; cursor:pointer; color:#64748b; font-size:13px; padding:4px; }
.drawer-close:hover { color:#6366f1; }
.drawer-badges { display:flex; gap:6px; }
.cat-badge { padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; color:#fff; }
.cat-badge.lang{background:#3b82f6}.cat-badge.math{background:#8b5cf6}
.cat-badge.sci{background:#22c55e}.cat-badge.soc{background:#f59e0b}
.pa-badge  { padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; color:#fff; }
.pa-3{background:#6366f1}.pa-4{background:#8b5cf6}.pa-2{background:#64748b}.pa-1{background:#94a3b8}
.cert-badge{ padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; background:#fef3c7; color:#b45309; }
.drawer-title { font-size:18px; font-weight:800; color:#1e293b; margin:0 0 4px; line-height:1.4; }
.drawer-en    { font-size:12px; color:#94a3b8; margin:0 0 16px; }
.info-grid    { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
.info-item    { background:#f8fafc; border-radius:8px; padding:10px 12px; }
.info-k       { font-size:10px; color:#94a3b8; margin-bottom:4px; }
.info-v       { font-size:13px; font-weight:600; color:#1e293b; }
.info-v.highlight-amber { color:#b45309; }
.notes-box    { background:#fffbeb; border-radius:8px; padding:14px; margin-bottom:16px; border:1px solid #fef3c7; }
.notes-label  { font-size:11px; font-weight:700; color:#b45309; margin-bottom:6px; }
.notes-text   { font-size:13px; color:#374151; margin:0; line-height:1.6; }
.grade-chips-wrap { margin-bottom:20px; }
.gc-label     { font-size:11px; color:#94a3b8; margin-bottom:8px; }
.grade-chips  { display:flex; gap:6px; flex-wrap:wrap; }
.grade-chip   { padding:4px 10px; border-radius:6px; font-size:12px; background:#f1f5f9; color:#cbd5e1; font-weight:600; }
.grade-chip.active { background:#6366f1; color:#fff; }
.drawer-links { display:flex; gap:10px; flex-direction:column; }
.dlink { display:block; padding:10px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; text-align:center; }
.dlink.orig  { background:#6366f1; color:#fff; }
.dlink.trans { background:#22c55e; color:#fff; }

/* 动画 */
.drawer-enter-active,.drawer-leave-active { transition:transform .25s ease; }
.drawer-enter-from,.drawer-leave-to { transform:translateX(100%); }
</style>
