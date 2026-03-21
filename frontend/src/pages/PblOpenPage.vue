<template>
  <div class="po-page">

    <!-- 顶部统计 -->
    <div class="stat-bar" v-if="stats">
      <div class="stat-item">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-lbl">公开项目</span>
      </div>
      <div class="stat-div" />
      <div class="stat-item">
        <span class="stat-num">{{ stats.certified }}</span>
        <span class="stat-lbl">官方认证</span>
      </div>
      <div class="stat-div" />
      <div class="stat-item" v-for="c in stats.byCategory" :key="c.category">
        <span class="stat-num">{{ c.n }}</span>
        <span class="stat-lbl">{{ c.category }}</span>
      </div>
    </div>

    <div class="body">
      <!-- 左侧筛选 -->
      <aside class="filter-panel">
        <div class="fp-title">筛选</div>

        <div class="fp-group">
          <div class="fp-label">学科大类</div>
          <div class="fp-tags">
            <button v-for="c in ['语言','社科','科学','数学']" :key="c"
              class="tag-btn" :class="{ active: filters.category === c }"
              @click="toggleFilter('category', c)">{{ c }}</button>
          </div>
        </div>

        <div class="fp-group">
          <div class="fp-label">学段</div>
          <div class="fp-tags">
            <button v-for="g in gradeOptions" :key="g"
              class="tag-btn" :class="{ active: filters.china_grade === g }"
              @click="toggleFilter('china_grade', g)">{{ g }}</button>
          </div>
        </div>

        <div class="fp-group">
          <div class="fp-label">年级</div>
          <div class="fp-tags">
            <button v-for="n in [6,7,8,9,10,11,12]" :key="n"
              class="tag-btn grade-tag" :class="{ active: filters.grade === n }"
              @click="toggleFilter('grade', n)">{{ n }}年级</button>
          </div>
        </div>

        <div class="fp-group">
          <div class="fp-label">认证</div>
          <div class="fp-tags">
            <button class="tag-btn" :class="{ active: filters.is_certified === 1 }"
              @click="toggleFilter('is_certified', 1)">官方认证</button>
          </div>
        </div>

        <div class="fp-group">
          <div class="fp-label">搜索</div>
          <div class="search-box">
            <input v-model="keyword" placeholder="项目名称 / 课程" @keyup.enter="applySearch" />
            <button @click="applySearch">搜</button>
          </div>
        </div>

        <button class="reset-btn" @click="resetFilters">重置</button>
      </aside>

      <!-- 右侧列表 -->
      <div class="list-area">
        <div class="list-hd">
          <span class="list-count">共 {{ list.length }} 个项目</span>
        </div>

        <div v-if="loading" class="loading">加载中…</div>
        <div class="table-scroll">
          <table v-if="!loading" class="po-table">
            <thead>
              <tr>
                <th style="width:36px">#</th>
                <th style="width:52px">类型</th>
                <th style="width:60px">学科</th>
                <th>项目名称</th>
                <th style="width:70px">学段</th>
                <th style="width:90px">适用年级</th>
                <th style="width:90px">时长</th>
                <th style="width:44px">认证</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.id" class="po-row" @click="openDetail(row)">
                <td class="seq">{{ row.sort_num }}</td>
                <td><span class="pa-badge" :class="`pa-${row.pa_type}`">PA{{ row.pa_type }}</span></td>
                <td><span class="cat-badge" :class="`cat-${row.category}`">{{ row.category }}</span></td>
                <td class="name-cell">
                  <div class="name-zh" v-if="row.name_zh">{{ row.name_zh }}</div>
                  <div class="name-en">{{ row.name_en }}</div>
                </td>
                <td class="grade-lv">{{ row.china_grade }}</td>
                <td class="grade-chips-cell">
                  <span v-for="g in applicableGrades(row)" :key="g" class="grade-dot">{{ g }}</span>
                </td>
                <td class="duration">{{ row.duration }}</td>
                <td class="cert-cell">
                  <span v-if="row.is_certified" class="cert-icon" title="官方认证">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <transition name="modal-fade">
      <div v-if="detail" class="modal-mask" @click.self="detail = null">
        <div class="modal-box">
          <button class="modal-close" @click="detail = null">✕</button>

          <!-- 标题 -->
          <div class="modal-head">
            <span class="pa-badge" :class="`pa-${detail.pa_type}`">PA{{ detail.pa_type }}</span>
            <span class="cat-badge" :class="`cat-${detail.category}`">{{ detail.category }}</span>
            <span v-if="detail.is_certified" class="cert-badge">官方认证</span>
          </div>
          <h2 class="modal-title">{{ detail.name_zh || detail.name_en }}</h2>
          <p class="modal-title-sub" v-if="detail.name_zh">{{ detail.name_en }}</p>

          <!-- 基本信息 -->
          <div class="meta-grid">
            <div class="meta-item" v-if="detail.subject">
              <span class="meta-k">学科</span><span class="meta-v">{{ detail.subject }}</span>
            </div>
            <div class="meta-item" v-if="detail.course_name">
              <span class="meta-k">课程</span><span class="meta-v">{{ detail.course_name }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-k">学段</span><span class="meta-v">{{ detail.china_grade }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-k">时长</span><span class="meta-v">{{ detail.duration }}</span>
            </div>
          </div>

          <!-- 年级标签 -->
          <div class="section-title">适用年级</div>
          <div class="grade-row">
            <span v-for="n in [6,7,8,9,10,11,12]" :key="n"
              class="grade-chip" :class="{ active: detail[`grade_${n}`] }">{{ n }}年级</span>
          </div>

          <!-- 能力维度 -->
          <div class="section-title">涉及能力维度</div>
          <div class="dim-groups">
            <div v-for="grp in dimGroups" :key="grp.label" class="dim-group">
              <div class="dim-group-label">{{ grp.label }}</div>
              <div class="dim-tags">
                <span v-for="d in grp.dims" :key="d.key"
                  class="dim-tag" :class="{ active: detail[d.key] }">{{ d.label }}</span>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div class="modal-meta" v-if="detail.notes">
            <span class="meta-k">备注</span>
            <span class="meta-v">{{ detail.notes }}</span>
          </div>
          <div class="modal-meta" v-if="detail.rubric_notes">
            <span class="meta-k">量规</span>
            <span class="meta-v">{{ detail.rubric_notes }}</span>
          </div>

          <!-- 链接 -->
          <div class="link-row">
            <a v-if="detail.url_original" :href="detail.url_original"
              target="_blank" rel="noopener" class="link-btn primary">原始链接 →</a>
            <a v-if="detail.url_translation" :href="detail.url_translation"
              target="_blank" rel="noopener" class="link-btn secondary">中文翻译 →</a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPblOpen, getPblOpenStats } from '../api/index.js'

const list    = ref([])
const stats   = ref(null)
const loading = ref(false)
const detail  = ref(null)
const keyword = ref('')
const appliedKeyword = ref('')
const filters = reactive({ category: '', china_grade: '', grade: '', is_certified: '' })

const gradeOptions = ['小学', '初中', '高中', '初高中', '初中高中']

const dimGroups = [
  { label: '文本分析（精读）', dims: [
    { key: 'd_theme_main_idea',   label: '主题与中心思想' },
    { key: 'd_viewpoint_purpose', label: '观点与目的' },
    { key: 'd_development',       label: '发展' },
    { key: 'd_structure',         label: '结构' },
    { key: 'd_word_choice',       label: '用词选择' },
  ]},
  { label: '使用资料', dims: [
    { key: 'd_select_source',        label: '选择相关原始资料' },
    { key: 'd_contextualize_source', label: '情境化原始资料' },
    { key: 'd_synthesize_source',    label: '综合多种原始资料' },
  ]},
  { label: '探究', dims: [
    { key: 'd_raise_question',    label: '提出问题' },
    { key: 'd_predict_hypothesize', label: '预测与假设' },
    { key: 'd_design_procedure',  label: '设计程序与流程' },
  ]},
  { label: '分析与综合', dims: [
    { key: 'd_identify_patterns', label: '识别模式和关系' },
    { key: 'd_compare_contrast',  label: '比较与对比' },
    { key: 'd_build_data',        label: '建立数据和信息' },
    { key: 'd_interpret_connect', label: '阐释联系和推断' },
    { key: 'd_build_reasoning',   label: '建立他人的推理' },
    { key: 'd_evaluate_evidence', label: '评判有证据的解释' },
    { key: 'd_build_evidence',    label: '建立有证据的解释' },
  ]},
  { label: '创作与写作', dims: [
    { key: 'd_argumentation',       label: '立论' },
    { key: 'd_informational_essay', label: '资料性或解释性论文' },
    { key: 'd_narrative',           label: '叙事' },
    { key: 'd_counterargument',     label: '反论' },
    { key: 'd_evidence_selection',  label: '证据选择' },
    { key: 'd_evidence_interpret',  label: '证据解释' },
    { key: 'd_evidence_integration',label: '证据整合' },
    { key: 'd_organization',        label: '组织结构' },
    { key: 'd_intro_conclusion',    label: '开头和结尾' },
  ]},
  { label: '听与说', dims: [
    { key: 'd_discussion',    label: '讨论或贡献' },
    { key: 'd_preparation',   label: '准备' },
    { key: 'd_rules_language',label: '规则和语言' },
    { key: 'd_style_listening',label: '风格和积极倾听' },
  ]},
  { label: '产出与演讲', dims: [
    { key: 'd_oral_expression',   label: '口头表达' },
    { key: 'd_multimedia_written',label: '笔头多媒体' },
    { key: 'd_multimedia_oral',   label: '口头多媒体' },
    { key: 'd_normativity',       label: '规范性' },
    { key: 'd_precision',         label: '精准性' },
  ]},
]

function applicableGrades(row) {
  return [6,7,8,9,10,11,12].filter(n => row[`grade_${n}`])
}

function toggleFilter(key, val) {
  filters[key] = filters[key] === val ? '' : val
  fetchList()
}

function applySearch() {
  appliedKeyword.value = keyword.value
  fetchList()
}

function resetFilters() {
  filters.category = ''; filters.china_grade = ''; filters.grade = ''; filters.is_certified = ''
  keyword.value = ''; appliedKeyword.value = ''
  fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const params = {}
    if (filters.category)    params.category    = filters.category
    if (filters.china_grade) params.china_grade = filters.china_grade
    if (filters.grade)       params.grade       = filters.grade
    if (filters.is_certified !== '') params.is_certified = filters.is_certified
    if (appliedKeyword.value) params.keyword    = appliedKeyword.value
    const res = await getPblOpen(params)
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function openDetail(row) { detail.value = row }

onMounted(async () => {
  fetchList()
  const res = await getPblOpenStats()
  stats.value = res.data
})
</script>

<style scoped>
.po-page { display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 56px - 56px); min-height: 0; }

/* 统计栏 */
.stat-bar {
  display: flex; align-items: center; gap: 24px;
  background: #fff; border-radius: 10px; padding: 14px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); flex-shrink: 0;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num  { font-size: 20px; font-weight: 700; color: #1e293b; }
.stat-lbl  { font-size: 11px; color: #94a3b8; }
.stat-div  { width: 1px; height: 28px; background: #e8ecf2; }

/* body */
.body { display: flex; gap: 16px; flex: 1; min-height: 0; }

/* 筛选 */
.filter-panel {
  width: 188px; flex-shrink: 0;
  background: #fff; border-radius: 10px; padding: 18px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}
.fp-title { font-size: 13px; font-weight: 700; color: #1e293b; }
.fp-group { display: flex; flex-direction: column; gap: 7px; }
.fp-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: .05em; }
.fp-tags  { display: flex; flex-wrap: wrap; gap: 5px; }
.tag-btn {
  padding: 3px 9px; border-radius: 20px; font-size: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
  cursor: pointer; transition: all .12s;
}
.tag-btn:hover { border-color: #6366f1; color: #6366f1; }
.tag-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
.grade-tag { padding: 3px 7px; }

.search-box { display: flex; gap: 5px; }
.search-box input {
  flex: 1; min-width: 0; border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 5px 8px; font-size: 12px; outline: none;
}
.search-box input:focus { border-color: #6366f1; }
.search-box button {
  padding: 5px 9px; border-radius: 6px; border: none;
  background: #6366f1; color: #fff; font-size: 12px; cursor: pointer;
}
.reset-btn {
  margin-top: auto; width: 100%; padding: 7px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #94a3b8; font-size: 12px; cursor: pointer;
}
.reset-btn:hover { background: #f1f5f9; color: #475569; }

/* 列表 */
.list-area {
  flex: 1; min-width: 0; background: #fff; border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  display: flex; flex-direction: column; overflow: hidden;
}
.list-hd { padding: 12px 20px 8px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0; }
.list-count { font-size: 12px; color: #94a3b8; }
.loading { padding: 40px; text-align: center; color: #94a3b8; }
.table-scroll { flex: 1; overflow-y: auto; min-height: 0; }

.po-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.po-table thead { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
.po-table th {
  padding: 9px 12px; text-align: left;
  font-size: 11px; color: #94a3b8; font-weight: 600;
  border-bottom: 1px solid #e8ecf2;
}
.po-row { cursor: pointer; transition: background .1s; }
.po-row:hover { background: #f8f7ff; }
.po-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.seq { color: #cbd5e1; font-size: 12px; }
.name-cell { line-height: 1.5; }
.name-zh { color: #1e293b; font-weight: 500; }
.name-en { color: #94a3b8; font-size: 11px; margin-top: 1px; }
.grade-lv { color: #64748b; font-size: 12px; }
.duration { color: #64748b; font-size: 12px; }
.grade-chips-cell { display: flex; flex-wrap: wrap; gap: 3px; }
.grade-dot {
  display: inline-block; width: 22px; height: 22px; line-height: 22px;
  text-align: center; border-radius: 50%; font-size: 10px; font-weight: 600;
  background: #6366f1; color: #fff;
}
.cert-cell { text-align: center; }
.cert-icon { color: #16a34a; font-weight: 700; font-size: 14px; }

/* 徽章 */
.pa-badge {
  display: inline-block; padding: 2px 7px; border-radius: 4px;
  font-size: 11px; font-weight: 700;
}
.pa-3 { background: #ede9fe; color: #6d28d9; }
.pa-4 { background: #dbeafe; color: #1d4ed8; }
.pa-2 { background: #f3f4f6; color: #6b7280; }

.cat-badge {
  display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600;
}
.cat-语言 { background: #fef3c7; color: #b45309; }
.cat-社科 { background: #dcfce7; color: #15803d; }
.cat-科学 { background: #dbeafe; color: #1d4ed8; }
.cat-数学 { background: #fce7f3; color: #be185d; }

/* 弹窗 */
.modal-mask {
  position: fixed; inset: 0; background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-box {
  background: #fff; border-radius: 14px; width: 640px;
  max-width: 92vw; max-height: 88vh; overflow-y: auto;
  padding: 30px 30px 26px; position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; font-size: 16px; color: #94a3b8; cursor: pointer;
}
.modal-close:hover { color: #1e293b; }
.modal-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.cert-badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.modal-title { font-size: 17px; font-weight: 700; color: #1e293b; line-height: 1.5; margin-bottom: 4px; }
.modal-title-sub { font-size: 12px; color: #94a3b8; margin-bottom: 14px; }

.meta-grid { display: flex; flex-wrap: wrap; gap: 10px 24px; margin-bottom: 16px; }
.meta-item { display: flex; align-items: center; gap: 6px; }
.meta-k { font-size: 11px; color: #94a3b8; font-weight: 600; }
.meta-v { font-size: 13px; color: #374151; }

.section-title {
  font-size: 11px; font-weight: 700; color: #6366f1;
  letter-spacing: .06em; margin: 14px 0 8px; padding-bottom: 4px;
  border-bottom: 1px solid #ede9fe;
}

/* 年级 */
.grade-row { display: flex; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.grade-chip {
  padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  border: 1.5px solid #e2e8f0; color: #cbd5e1; background: #f8fafc;
  transition: all .12s;
}
.grade-chip.active { background: #6366f1; color: #fff; border-color: #6366f1; }

/* 维度 */
.dim-groups { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.dim-group { }
.dim-group-label { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 5px; }
.dim-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.dim-tag {
  padding: 3px 9px; border-radius: 4px; font-size: 11px;
  border: 1px solid #e2e8f0; color: #cbd5e1; background: #f8fafc;
  transition: all .12s;
}
.dim-tag.active { background: #ede9fe; color: #6d28d9; border-color: #c4b5fd; font-weight: 500; }

.modal-meta { display: flex; gap: 8px; font-size: 13px; margin-bottom: 8px; align-items: flex-start; }

/* 链接 */
.link-row { display: flex; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
.link-btn {
  padding: 7px 18px; border-radius: 6px; font-size: 13px;
  text-decoration: none; transition: background .12s;
}
.link-btn.primary { background: #6366f1; color: #fff; }
.link-btn.primary:hover { background: #4f46e5; }
.link-btn.secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.link-btn.secondary:hover { background: #e2e8f0; }

/* 动画 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
