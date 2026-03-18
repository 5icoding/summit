<template>
  <div class="pbl-layout">

    <!-- 左侧筛选 -->
    <aside class="filter-panel">
      <div class="fp-title">筛选</div>

      <div class="fp-section">
        <div class="fp-label">年级</div>
        <div class="grade-chips">
          <button
            v-for="g in gradeNums" :key="g"
            :class="['g-chip', { active: selectedGrade === g }]"
            @click="toggleGrade(g)"
          >{{ g }}年级</button>
        </div>
      </div>

      <div class="fp-section">
        <div class="fp-label">学科</div>
        <div class="cat-chips">
          <button
            v-for="cat in categories" :key="cat.key"
            :class="['c-chip', cat.cls, { active: selectedCat === cat.key }]"
            @click="toggleCat(cat.key)"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
            <span class="chip-n">{{ countByCat(cat.key) }}</span>
          </button>
        </div>
      </div>

      <button class="reset-btn" @click="resetFilters">重置筛选</button>

      <div class="fp-stat">
        共 <b>{{ filtered.length }}</b> 个项目
      </div>
    </aside>

    <!-- 右侧内容 -->
    <div class="right-wrap">

      <!-- 项目列表表格 -->
      <div class="table-wrap">
        <div class="tw-header">
          <span class="tw-title">项目列表</span>
          <div class="search-wrap">
            <input
              v-model="keyword"
              class="kw-input"
              placeholder="搜索项目名称..."
              @keyup.enter="applySearch"
            />
            <button class="search-btn" @click="applySearch">查询</button>
          </div>
        </div>
        <div class="table-scroll">
          <table class="proj-table">
            <thead>
              <tr>
                <th class="col-name">项目名称</th>
                <th class="col-brief">课程 / 简述</th>
                <th class="col-grade">学段</th>
                <th class="col-dur">时长</th>
                <th class="col-pa">类型</th>
                <th class="col-cert">认证</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in filtered" :key="p.id"
                :class="['proj-row', { selected: selectedProject?.id === p.id }]"
                @click="selectProject(p)"
              >
                <td class="col-name">
                  <div class="pname-zh">{{ p.name_zh || p.name_en }}</div>
                  <div v-if="p.name_zh" class="pname-en">{{ p.name_en }}</div>
                </td>
                <td class="col-brief">
                  <span class="brief-text">{{ p.course_name || p.subject || '—' }}</span>
                </td>
                <td class="col-grade">
                  <span v-if="p.china_grade" class="tag-grade">{{ p.china_grade }}</span>
                </td>
                <td class="col-dur">
                  <span v-if="p.duration" class="tag-dur">{{ p.duration }}</span>
                </td>
                <td class="col-pa">
                  <span :class="['pa-badge', `pa-${p.pa_type}`]">PA{{ p.pa_type }}</span>
                </td>
                <td class="col-cert">
                  <span v-if="p.is_certified" class="cert-dot" title="官方认证">✓</span>
                </td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="6" class="empty-row">没有符合条件的项目</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <!-- 项目详情弹窗 -->
  <transition name="modal-fade">
    <div v-if="selectedProject" class="modal-mask" @click.self="selectedProject = null">
      <div class="modal-box">
        <div class="dp-header">
          <div class="dp-badges">
            <span :class="['cat-badge', getCat(selectedProject.category)?.cls]">
              {{ selectedProject.category }}
            </span>
            <span :class="['pa-badge', `pa-${selectedProject.pa_type}`]">
              PA{{ selectedProject.pa_type }} · {{ paLabel(selectedProject.pa_type) }}
            </span>
            <span v-if="selectedProject.is_certified" class="cert-badge">官方认证</span>
          </div>
          <button class="dp-close" @click="selectedProject = null">✕</button>
        </div>

        <div class="dp-body">
          <div class="dp-title-wrap">
            <h3 class="dp-title">{{ selectedProject.name_zh || selectedProject.name_en }}</h3>
            <p v-if="selectedProject.name_zh" class="dp-en">{{ selectedProject.name_en }}</p>
          </div>

          <div class="dp-meta-grid">
            <div class="dm-item" v-if="selectedProject.name_zh">
              <div class="dm-k">中文名</div>
              <div class="dm-v">{{ selectedProject.name_zh }}</div>
            </div>
            <div class="dm-item" v-if="selectedProject.china_grade">
              <div class="dm-k">学段</div>
              <div class="dm-v">{{ selectedProject.china_grade }}</div>
            </div>
            <div class="dm-item" v-if="selectedProject.grade_level">
              <div class="dm-k">年级</div>
              <div class="dm-v">{{ selectedProject.grade_level }}</div>
            </div>
            <div class="dm-item" v-if="selectedProject.subject">
              <div class="dm-k">学科</div>
              <div class="dm-v">{{ selectedProject.subject }}</div>
            </div>
            <div class="dm-item" v-if="selectedProject.course_name">
              <div class="dm-k">课程</div>
              <div class="dm-v">{{ selectedProject.course_name }}</div>
            </div>
            <div class="dm-item" v-if="selectedProject.duration">
              <div class="dm-k">时长</div>
              <div class="dm-v amber">{{ selectedProject.duration }}</div>
            </div>
            <div class="dm-item dm-item-full" v-if="selectedProject.url_original">
              <div class="dm-k">原链接</div>
              <a :href="selectedProject.url_original" target="_blank" class="dm-link">
                {{ selectedProject.url_original }}
              </a>
            </div>
          </div>

          <!-- 适用年级 -->
          <div class="dp-grades">
            <div class="dg-label">适用年级</div>
            <div class="dg-chips">
              <span
                v-for="g in [6,7,8,9,10,11,12]" :key="g"
                :class="['dg-chip', { active: selectedProject[`grade_${g}`] }]"
              >{{ g }}年级</span>
            </div>
          </div>

          <div v-if="selectedProject.notes" class="dp-notes">
            <div class="dn-label">探月备注</div>
            <p class="dn-text">{{ selectedProject.notes }}</p>
          </div>

          <div class="dp-links">
            <a v-if="selectedProject.url_original"
               :href="selectedProject.url_original"
               target="_blank" class="dp-link orig">查看原文 ↗</a>
            <a v-if="selectedProject.url_translation"
               :href="selectedProject.url_translation"
               target="_blank" class="dp-link trans">查看译文 ↗</a>
            <button
              class="dp-link detail"
              @click="router.push(`/pbl/${selectedProject.id}/detail`)"
            >查看详情 →</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPblProjects } from '../api/index.js'

const router = useRouter()

const projects        = ref([])
const selectedGrade   = ref(null)   // 单选年级
const selectedCat     = ref(null)
const keyword         = ref('')
const appliedKeyword  = ref('')
const selectedProject = ref(null)

const gradeNums = [6, 7, 8, 9, 10, 11, 12]
const categories = [
  { key: '语言', label: '语言', icon: '📖', cls: 'lang' },
  { key: '数学', label: '数学', icon: '📐', cls: 'math' },
  { key: '科学', label: '科学', icon: '🔬', cls: 'sci' },
  { key: '社科', label: '社科', icon: '🌏', cls: 'soc' },
]

function getCat(key) { return categories.find(c => c.key === key) }
function paLabel(t)  { return ['', '建构反应式', '独立任务', '课程嵌入', '复杂项目'][t] || '' }

function toggleGrade(g) {
  selectedGrade.value   = selectedGrade.value === g ? null : g
  selectedProject.value = null
}
function toggleCat(k) {
  selectedCat.value     = selectedCat.value === k ? null : k
  selectedProject.value = null
  appliedKeyword.value  = keyword.value   // 选学科时自动触发查询
}
function applySearch() {
  appliedKeyword.value  = keyword.value
  selectedProject.value = null
}

function resetFilters() {
  selectedGrade.value   = null
  selectedCat.value     = null
  keyword.value         = ''
  appliedKeyword.value  = ''
  selectedProject.value = null
}

function selectProject(p) {
  selectedProject.value = selectedProject.value?.id === p.id ? null : p
}

const filtered = computed(() => {
  return projects.value.filter(p => {
    if (selectedCat.value   && p.category !== selectedCat.value) return false
    if (selectedGrade.value && !p[`grade_${selectedGrade.value}`]) return false
    if (appliedKeyword.value) {
      const kw = appliedKeyword.value.toLowerCase()
      if (!`${p.name_zh || ''}${p.name_en || ''}`.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

function countByCat(key) { return projects.value.filter(p => p.category === key).length }

onMounted(async () => {
  const res = await getPblProjects()
  projects.value = res.data
})
</script>

<style scoped>
* { box-sizing: border-box; }

.pbl-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 56px - 56px);
  min-height: 0;
}

/* ── 左侧筛选 ── */
.filter-panel {
  width: 210px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 20px 14px;
  border: 1px solid #e8ecf2;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}
.fp-title   { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 18px; }
.fp-section { margin-bottom: 20px; }
.fp-label   { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px; }

/* 年级多选 */
.grade-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.g-chip {
  padding: 4px 8px; border-radius: 6px; border: 1.5px solid #e2e8f0;
  background: #fff; cursor: pointer; font-size: 11px; color: #64748b; transition: all .15s;
}
.g-chip:hover { border-color: #6366f1; color: #6366f1; }
.g-chip.active { background: #6366f1; border-color: #6366f1; color: #fff; }

/* 学科单选 */
.cat-chips { display: flex; flex-direction: column; gap: 5px; }
.c-chip {
  display: flex; align-items: center; gap: 6px; padding: 7px 10px;
  border-radius: 7px; border: 1.5px solid #e2e8f0; background: #fff;
  cursor: pointer; font-size: 12px; color: #64748b; transition: all .15s;
}
.c-chip:hover { border-color: #6366f1; }
.c-chip.active { color: #fff; border-color: transparent; }
.c-chip.lang.active { background: #3b82f6; }
.c-chip.math.active { background: #8b5cf6; }
.c-chip.sci.active  { background: #22c55e; }
.c-chip.soc.active  { background: #f59e0b; }
.chip-n { margin-left: auto; background: rgba(0,0,0,.08); padding: 1px 6px; border-radius: 8px; font-size: 10px; }
.c-chip.active .chip-n { background: rgba(255,255,255,.25); }

.reset-btn {
  width: 100%; padding: 8px; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #fff; cursor: pointer; font-size: 12px; color: #64748b; margin-top: 4px;
}
.reset-btn:hover { background: #f8f9ff; border-color: #6366f1; color: #6366f1; }
.fp-stat { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 12px; }
.fp-stat b { color: #1e293b; }

/* ── 右侧 ── */
.right-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* 表格区 */
.table-wrap {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ecf2;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.tw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.tw-title { font-size: 14px; font-weight: 700; color: #1e293b; }
.search-wrap { display: flex; gap: 6px; align-items: center; }
.kw-input {
  padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 12px; outline: none; width: 200px;
}
.kw-input:focus { border-color: #6366f1; }
.search-btn {
  padding: 6px 14px; border-radius: 8px; border: none;
  background: #6366f1; color: #fff; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
}
.search-btn:hover { background: #4f46e5; }

.table-scroll { overflow-y: auto; flex: 1; }
.proj-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.proj-table thead th {
  background: #f8fafc; padding: 10px 14px; font-size: 11px; font-weight: 700;
  color: #94a3b8; text-align: left; border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0;
}
.proj-row {
  cursor: pointer; border-bottom: 1px solid #f8fafc; transition: background .12s;
}
.proj-row:hover { background: #f8f9ff; }
.proj-row.selected { background: #eef2ff; }
.proj-table td { padding: 10px 14px; vertical-align: middle; }

.col-name  { min-width: 200px; }
.col-brief { min-width: 140px; }
.col-grade { width: 80px; }
.col-dur   { width: 110px; }
.col-pa    { width: 70px; }
.col-cert  { width: 50px; text-align: center; }

.pname-zh  { font-weight: 600; color: #1e293b; line-height: 1.4; }
.pname-en  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.brief-text { font-size: 12px; color: #64748b; }

.tag-grade { background: #ede9fe; color: #6d28d9; font-size: 11px; padding: 2px 7px; border-radius: 4px; }
.tag-dur   { background: #fef3c7; color: #b45309; font-size: 11px; padding: 2px 7px; border-radius: 4px; }
.pa-badge  { padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #fff; white-space: nowrap; }
.pa-1 { background: #94a3b8; } .pa-2 { background: #64748b; }
.pa-3 { background: #6366f1; } .pa-4 { background: #8b5cf6; }
.cert-dot  { color: #22c55e; font-size: 14px; font-weight: 700; }
.empty-row { text-align: center; padding: 40px; color: #cbd5e1; }

/* 弹窗遮罩 */
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center; z-index: 200;
}
.modal-box {
  background: #fff; border-radius: 16px; width: 560px;
  max-height: 82vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.dp-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;
  border-radius: 16px 16px 0 0; position: sticky; top: 0;
}
.dp-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.cat-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: #fff; }
.cat-badge.lang { background: #3b82f6; } .cat-badge.math { background: #8b5cf6; }
.cat-badge.sci  { background: #22c55e; } .cat-badge.soc  { background: #f59e0b; }
.cert-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #fef3c7; color: #b45309; }
.dp-close { background: none; border: none; cursor: pointer; font-size: 12px; color: #94a3b8; padding: 4px 8px; border-radius: 6px; }
.dp-close:hover { background: #fee2e2; color: #ef4444; }

.dp-body { padding: 20px; }
.dp-title-wrap { margin-bottom: 14px; }
.dp-title { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0 0 4px; line-height: 1.4; }
.dp-en    { font-size: 12px; color: #94a3b8; margin: 0; }

.dp-meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 14px; }
.dm-item  { background: #f8fafc; border-radius: 8px; padding: 8px 12px; }
.dm-item-full { grid-column: 1 / -1; }
.dm-k     { font-size: 10px; color: #94a3b8; margin-bottom: 3px; }
.dm-v     { font-size: 13px; font-weight: 600; color: #1e293b; }
.dm-v.amber { color: #b45309; }
.dm-link  { font-size: 12px; color: #6366f1; word-break: break-all; text-decoration: none; }
.dm-link:hover { text-decoration: underline; }

.dp-grades { margin-bottom: 14px; }
.dg-label  { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
.dg-chips  { display: flex; gap: 5px; flex-wrap: wrap; }
.dg-chip   { padding: 3px 10px; border-radius: 6px; font-size: 11px; background: #f1f5f9; color: #cbd5e1; font-weight: 600; }
.dg-chip.active { background: #6366f1; color: #fff; }

.dp-notes  { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
.dn-label  { font-size: 11px; font-weight: 700; color: #b45309; margin-bottom: 4px; }
.dn-text   { font-size: 13px; color: #374151; margin: 0; line-height: 1.6; }

.dp-links  { display: flex; gap: 10px; }
.dp-link   { padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }
.dp-link.orig   { background: #6366f1; color: #fff; }
.dp-link.trans  { background: #22c55e; color: #fff; }
.dp-link.detail { background: #0f172a; color: #fff; border: none; cursor: pointer; font-family: inherit; }

/* 弹窗动画 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-box, .modal-fade-leave-active .modal-box { transition: transform .2s ease; }
.modal-fade-enter-from .modal-box, .modal-fade-leave-to .modal-box { transform: scale(.95); }
</style>
