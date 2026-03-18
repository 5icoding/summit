<template>
  <div class="page">
    <div class="page-header">
      <h2>PBL 项目库</h2>
      <p>按学段与学科交叉查看项目</p>
    </div>

    <!-- 矩阵表格 -->
    <div class="matrix-wrap">
      <table class="matrix">
        <thead>
          <tr>
            <th class="corner">学段 \ 学科</th>
            <th v-for="cat in categories" :key="cat.key" :class="['cat-head', cat.cls]">
              <span class="cat-icon">{{ cat.icon }}</span>{{ cat.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="grade in grades" :key="grade.key">
            <td class="grade-cell">
              <div class="grade-label">{{ grade.label }}</div>
              <div class="grade-sub">{{ grade.sub }}</div>
            </td>
            <td
              v-for="cat in categories" :key="cat.key"
              class="matrix-cell"
              :class="[cat.cls + '-cell', { active: activeCell?.g === grade.key && activeCell?.c === cat.key }]"
              @click="selectCell(grade.key, cat.key)"
            >
              <template v-if="getProjects(grade.key, cat.key).length">
                <div class="cell-count">{{ getProjects(grade.key, cat.key).length }} 个</div>
                <div class="cell-names">
                  <span
                    v-for="p in getProjects(grade.key, cat.key).slice(0,2)"
                    :key="p.id"
                    class="cell-name-tag"
                  >{{ p.name_zh || p.name_en }}</span>
                  <span v-if="getProjects(grade.key,cat.key).length>2" class="cell-more">
                    +{{ getProjects(grade.key,cat.key).length - 2 }}
                  </span>
                </div>
              </template>
              <span v-else class="cell-empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 项目列表面板 -->
    <transition name="slide-up">
      <div v-if="activeCell" class="project-panel">
        <div class="panel-header">
          <div class="panel-title">
            <span :class="['panel-cat', getCat(activeCell.c)?.cls]">{{ getCat(activeCell.c)?.label }}</span>
            <span class="panel-grade">{{ getGrade(activeCell.g)?.label }}</span>
            <span class="panel-count">{{ activeCellProjects.length }} 个项目</span>
          </div>
          <button class="close-btn" @click="activeCell = null">✕</button>
        </div>
        <div class="project-list">
          <div
            v-for="p in activeCellProjects"
            :key="p.id"
            class="project-row"
            :class="{ 'has-trans': p.url_translation }"
            @click="openDetail(p)"
          >
            <div class="pr-left">
              <span :class="['pa-badge', `pa-${p.pa_type}`]">PA{{ p.pa_type }}</span>
              <div class="pr-names">
                <div class="pr-name-zh">{{ p.name_zh || p.name_en }}</div>
                <div class="pr-name-en">{{ p.name_en }}</div>
              </div>
            </div>
            <div class="pr-right">
              <span v-if="p.course_name" class="pr-course">{{ p.course_name }}</span>
              <span v-if="p.duration" class="pr-duration">{{ p.duration }}</span>
              <span v-if="p.notes" class="pr-notes">{{ p.notes }}</span>
              <span v-if="p.url_translation" class="pr-has-trans">有译文</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 项目详情弹窗 -->
    <transition name="modal">
      <div v-if="detail" class="modal-mask" @click.self="detail = null">
        <div class="modal-box">
          <div class="modal-top">
            <div>
              <span :class="['pa-badge', `pa-${detail.pa_type}`]">PA{{ detail.pa_type }}</span>
              <span :class="['cat-badge', getCat(detail.category)?.cls]">{{ detail.category }}</span>
              <span v-if="detail.is_certified" class="cert-badge">官方认证</span>
            </div>
            <button @click="detail = null" class="close-btn">✕</button>
          </div>
          <h3 class="modal-title">{{ detail.name_zh || detail.name_en }}</h3>
          <p class="modal-en">{{ detail.name_en }}</p>
          <div class="modal-meta">
            <div v-if="detail.course_name"><span class="meta-k">课程</span>{{ detail.course_name }}</div>
            <div v-if="detail.china_grade"><span class="meta-k">学段</span>{{ detail.china_grade }}</div>
            <div v-if="detail.duration"><span class="meta-k">时长</span>{{ detail.duration }}</div>
            <div v-if="detail.notes"><span class="meta-k">探月备注</span>{{ detail.notes }}</div>
          </div>
          <div class="modal-links">
            <a v-if="detail.url_original" :href="detail.url_original" target="_blank" class="link-btn orig">查看原文</a>
            <a v-if="detail.url_translation" :href="detail.url_translation" target="_blank" class="link-btn trans">查看译文</a>
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
const activeCell = ref(null)
const detail = ref(null)

const grades = [
  { key: '小学',  label: '小学',  sub: '6年级以下' },
  { key: '初中',  label: '初中',  sub: '7-9年级' },
  { key: '高中',  label: '高中',  sub: '10-12年级' },
  { key: '初高中', label: '初高中', sub: '跨段' },
]
const categories = [
  { key: '语言', label: '语言', icon: '📖', cls: 'lang' },
  { key: '数学', label: '数学', icon: '📐', cls: 'math' },
  { key: '科学', label: '科学', icon: '🔬', cls: 'sci' },
  { key: '社科', label: '社科', icon: '🌏', cls: 'soc' },
]

function getProjects(grade, cat) {
  return projects.value.filter(p =>
    p.china_grade?.includes(grade) && p.category === cat
  )
}
function getCat(key)   { return categories.find(c => c.key === key) }
function getGrade(key) { return grades.find(g => g.key === key) }

function selectCell(g, c) {
  if (activeCell.value?.g === g && activeCell.value?.c === c) {
    activeCell.value = null
  } else {
    activeCell.value = { g, c }
  }
}

const activeCellProjects = computed(() =>
  activeCell.value ? getProjects(activeCell.value.g, activeCell.value.c) : []
)

function openDetail(p) { detail.value = p }

onMounted(async () => {
  const res = await getPblProjects()
  projects.value = res.data
})
</script>

<style scoped>
*{ box-sizing:border-box; }
.page { max-width: 1100px; }
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size:20px; font-weight:800; color:#1e293b; margin:0 0 4px; }
.page-header p  { font-size:13px; color:#94a3b8; margin:0; }

/* 矩阵 */
.matrix-wrap { background:#fff; border-radius:14px; overflow:auto; border:1px solid #e8ecf2; margin-bottom:20px; }
.matrix { border-collapse:collapse; width:100%; }
.corner { background:#1e293b; color:#fff; padding:14px 20px; font-size:13px; min-width:90px; }
.cat-head { padding:14px 20px; font-size:13px; font-weight:700; text-align:center; min-width:200px; border:1px solid rgba(255,255,255,.15); }
.cat-head .cat-icon { margin-right:6px; }
.lang { background:#3b82f6; color:#fff; }
.math { background:#8b5cf6; color:#fff; }
.sci  { background:#22c55e; color:#fff; }
.soc  { background:#f59e0b; color:#fff; }

.grade-cell { background:#f8fafc; padding:14px 16px; border:1px solid #f1f5f9; min-width:90px; }
.grade-label { font-size:14px; font-weight:700; color:#1e293b; }
.grade-sub   { font-size:11px; color:#94a3b8; margin-top:2px; }

.matrix-cell { padding:12px; border:1px solid #f1f5f9; cursor:pointer; vertical-align:top; transition:all .15s; min-height:80px; }
.matrix-cell:hover { filter:brightness(.95); }
.lang-cell { background:#eff6ff; } .lang-cell:hover { background:#dbeafe; }
.math-cell { background:#f5f3ff; } .math-cell:hover { background:#ede9fe; }
.sci-cell  { background:#f0fdf4; } .sci-cell:hover  { background:#dcfce7; }
.soc-cell  { background:#fffbeb; } .soc-cell:hover  { background:#fef3c7; }
.matrix-cell.active { outline:2px solid #6366f1; }
.cell-count { font-size:18px; font-weight:800; color:#1e293b; margin-bottom:6px; }
.cell-names { display:flex; flex-direction:column; gap:3px; }
.cell-name-tag { font-size:11px; color:#64748b; background:rgba(255,255,255,.7); border-radius:4px; padding:2px 6px; }
.cell-more { font-size:11px; color:#94a3b8; }
.cell-empty { color:#cbd5e1; font-size:18px; display:block; text-align:center; padding:8px 0; }

/* 面板 */
.project-panel { background:#fff; border-radius:14px; border:1px solid #e8ecf2; overflow:hidden; margin-bottom:20px; }
.panel-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; background:#f8fafc; }
.panel-title { display:flex; align-items:center; gap:10px; }
.panel-cat { padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; color:#fff; }
.panel-cat.lang{background:#3b82f6} .panel-cat.math{background:#8b5cf6}
.panel-cat.sci{background:#22c55e}  .panel-cat.soc{background:#f59e0b}
.panel-grade { font-size:14px; font-weight:700; color:#1e293b; }
.panel-count { font-size:12px; color:#94a3b8; }
.close-btn { background:none; border:none; font-size:16px; cursor:pointer; color:#94a3b8; padding:4px 8px; }

.project-list { padding:12px; display:flex; flex-direction:column; gap:8px; }
.project-row { display:flex; justify-content:space-between; align-items:flex-start; padding:14px 16px; border-radius:8px; background:#f8fafc; cursor:pointer; border:1.5px solid transparent; transition:all .15s; }
.project-row:hover { background:#f0f4ff; border-color:#c7d2fe; }
.project-row.has-trans { border-left:3px solid #22c55e; }
.pr-left { display:flex; align-items:flex-start; gap:10px; }
.pa-badge { padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700; color:#fff; }
.pa-1{background:#94a3b8} .pa-2{background:#64748b} .pa-3{background:#6366f1} .pa-4{background:#8b5cf6}
.pr-name-zh { font-size:14px; font-weight:600; color:#1e293b; }
.pr-name-en { font-size:11px; color:#94a3b8; margin-top:2px; }
.pr-right { display:flex; flex-wrap:wrap; gap:6px; justify-content:flex-end; }
.pr-course   { font-size:11px; background:#f1f5f9; color:#64748b; padding:2px 8px; border-radius:4px; }
.pr-duration { font-size:11px; background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:4px; }
.pr-notes    { font-size:11px; background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px; }
.pr-has-trans{ font-size:11px; background:#ede9fe; color:#7c3aed; padding:2px 8px; border-radius:4px; }

/* 弹窗 */
.modal-mask { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal-box  { background:#fff; border-radius:16px; padding:32px; width:520px; max-height:80vh; overflow-y:auto; }
.modal-top  { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:12px; }
.cat-badge  { padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; color:#fff; margin-left:6px; }
.cat-badge.lang{background:#3b82f6} .cat-badge.math{background:#8b5cf6}
.cat-badge.sci{background:#22c55e} .cat-badge.soc{background:#f59e0b}
.cert-badge { margin-left:6px; background:#fef3c7; color:#b45309; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:700; }
.modal-title { font-size:20px; font-weight:800; color:#1e293b; margin:0 0 4px; }
.modal-en    { font-size:13px; color:#94a3b8; margin:0 0 16px; }
.modal-meta  { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
.modal-meta div { font-size:13px; color:#374151; }
.meta-k      { background:#f1f5f9; color:#64748b; padding:2px 8px; border-radius:4px; font-size:11px; margin-right:8px; }
.modal-links { display:flex; gap:10px; }
.link-btn    { padding:9px 20px; border-radius:8px; font-size:13px; font-weight:600; text-decoration:none; }
.link-btn.orig  { background:#6366f1; color:#fff; }
.link-btn.trans { background:#22c55e; color:#fff; }

/* 动画 */
.slide-up-enter-active,.slide-up-leave-active { transition:all .25s ease; }
.slide-up-enter-from,.slide-up-leave-to { opacity:0; transform:translateY(20px); }
.modal-enter-active,.modal-leave-active { transition:opacity .2s; }
.modal-enter-from,.modal-leave-to { opacity:0; }
</style>
