<template>
  <div class="ref-page">
    <!-- 顶部统计栏 -->
    <div class="stat-bar" v-if="stats">
      <div class="stat-item">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">参考文献</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item" v-for="s in stats.byType" :key="s.type">
        <span class="stat-num">{{ s.n }}</span>
        <span class="stat-label">{{ s.type }}</span>
      </div>
    </div>

    <div class="body">
      <!-- 左侧筛选 -->
      <aside class="filter-panel">
        <div class="filter-title">筛选</div>

        <div class="filter-group">
          <div class="filter-label">文献类型</div>
          <div class="filter-tags">
            <button
              v-for="t in typeOptions"
              :key="t"
              class="tag-btn"
              :class="{ active: filters.type === t }"
              @click="toggleFilter('type', t)"
            >{{ t }}</button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">链接类型</div>
          <div class="filter-tags">
            <button
              v-for="l in linkTypeOptions"
              :key="l.value"
              class="tag-btn"
              :class="{ active: filters.linkType === l.value }"
              @click="toggleFilter('linkType', l.value)"
            >{{ l.label }}</button>
          </div>
        </div>

        <div class="filter-group">
          <div class="filter-label">关键词</div>
          <div class="search-box">
            <input
              v-model="keyword"
              placeholder="标题 / 作者"
              @keyup.enter="applySearch"
            />
            <button @click="applySearch">搜</button>
          </div>
        </div>

        <button class="reset-btn" @click="resetFilters">重置</button>
      </aside>

      <!-- 右侧列表 -->
      <div class="list-area">
        <div class="list-header">
          <span class="list-count">共 {{ list.length }} 条</span>
        </div>

        <div v-if="loading" class="loading">加载中…</div>

        <div class="table-scroll">
        <table v-if="!loading" class="ref-table">
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th style="width:64px">类型</th>
              <th style="width:120px">作者</th>
              <th style="width:52px">年份</th>
              <th>标题</th>
              <th style="width:70px">链接</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in list"
              :key="row.id"
              @click="openDetail(row)"
              class="ref-row"
            >
              <td class="seq">{{ row.seq }}</td>
              <td><span class="type-badge" :class="`type-${row.type}`">{{ row.type }}</span></td>
              <td class="author-cell">{{ shortAuthor(row.author) }}</td>
              <td class="year">{{ row.year }}</td>
              <td class="title-cell">
                <div class="title-zh">{{ row.title_zh }}</div>
                <div class="title-en">{{ row.title }}</div>
              </td>
              <td>
                <span v-if="row.link_type === 'url'" class="link-tag url">URL</span>
                <span v-else-if="row.link_type === 'pdf'" class="link-tag pdf">PDF</span>
                <span v-else-if="row.link_type === 'text'" class="link-tag text">书购</span>
                <span v-else class="link-tag none">—</span>
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

          <div class="modal-head">
            <span class="type-badge" :class="`type-${detail.type}`">{{ detail.type }}</span>
            <span class="modal-year">{{ detail.year }}</span>
          </div>

          <h2 class="modal-title">{{ detail.title_zh }}</h2>
          <p class="modal-title-en">{{ detail.title }}</p>
          <p class="modal-author">{{ detail.author }}</p>

          <div class="modal-meta" v-if="detail.source">
            <span class="meta-label">出处</span>
            <span class="meta-val">{{ detail.source }}</span>
          </div>

          <div class="modal-meta" v-if="detail.notes">
            <span class="meta-label">备注</span>
            <span class="meta-val">{{ detail.notes }}</span>
          </div>

          <div class="modal-link-row" v-if="detail.link">
            <template v-if="detail.link_type === 'url'">
              <a :href="cleanUrl(detail.link)" target="_blank" rel="noopener" class="link-btn">
                打开链接 →
              </a>
              <span class="dl-status" :class="detail.download_status?.startsWith('ok_200') ? 'ok' : 'warn'">
                {{ detail.download_status }}
              </span>
            </template>
            <template v-else-if="detail.link_type === 'pdf'">
              <span class="link-tag pdf">{{ detail.local_file }}</span>
              <span class="dl-status ok">本地文件</span>
            </template>
            <template v-else>
              <span class="meta-val link-text">{{ detail.link }}</span>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getReferences, getReferencesStats } from '../api/index.js'

const list    = ref([])
const stats   = ref(null)
const loading = ref(false)
const detail  = ref(null)
const keyword = ref('')
const appliedKeyword = ref('')

const filters = reactive({ type: '', linkType: '' })

const typeOptions     = ['书', '报告', '文章', '网站', '课程标准']
const linkTypeOptions = [
  { value: 'url',  label: 'URL' },
  { value: 'pdf',  label: 'PDF' },
  { value: 'text', label: '购书链接' },
]

function toggleFilter(key, val) {
  filters[key] = filters[key] === val ? '' : val
  fetchList()
}

function applySearch() {
  appliedKeyword.value = keyword.value
  fetchList()
}

function resetFilters() {
  filters.type = ''
  filters.linkType = ''
  keyword.value = ''
  appliedKeyword.value = ''
  fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const params = {}
    if (filters.type)          params.type      = filters.type
    if (filters.linkType)      params.link_type = filters.linkType
    if (appliedKeyword.value)  params.keyword   = appliedKeyword.value
    const res = await getReferences(params)
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function shortAuthor(author) {
  if (!author) return ''
  const parts = author.split(',')
  if (parts.length > 2) return parts[0].trim() + ' 等'
  return author.length > 24 ? author.slice(0, 22) + '…' : author
}

function cleanUrl(link) {
  return link?.replace(/\s+/g, '') ?? '#'
}

function openDetail(row) {
  detail.value = row
}

onMounted(async () => {
  fetchList()
  const res = await getReferencesStats()
  stats.value = res.data
})
</script>

<style scoped>
.ref-page { display: flex; flex-direction: column; gap: 16px; height: calc(100vh - 56px - 56px); min-height: 0; }

/* 统计栏 */
.stat-bar {
  display: flex; align-items: center; gap: 0;
  background: #fff; border-radius: 10px;
  padding: 14px 24px; gap: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  flex-shrink: 0;
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num  { font-size: 22px; font-weight: 700; color: #1e293b; }
.stat-label{ font-size: 11px; color: #94a3b8; }
.stat-divider { width: 1px; height: 32px; background: #e8ecf2; }

/* body */
.body { display: flex; gap: 16px; flex: 1; min-height: 0; }

/* 筛选面板 */
.filter-panel {
  width: 180px; flex-shrink: 0;
  background: #fff; border-radius: 10px;
  padding: 18px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  display: flex; flex-direction: column; gap: 18px;
}
.filter-title { font-size: 13px; font-weight: 700; color: #1e293b; }
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: .05em; }
.filter-tags  { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-btn {
  padding: 3px 10px; border-radius: 20px; font-size: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; color: #64748b;
  cursor: pointer; transition: all .15s;
}
.tag-btn:hover { border-color: #6366f1; color: #6366f1; }
.tag-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }

.search-box { display: flex; gap: 6px; }
.search-box input {
  flex: 1; min-width: 0;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 5px 8px; font-size: 12px; outline: none;
}
.search-box input:focus { border-color: #6366f1; }
.search-box button {
  padding: 5px 9px; border-radius: 6px; border: none;
  background: #6366f1; color: #fff; font-size: 12px; cursor: pointer;
}

.reset-btn {
  margin-top: auto; width: 100%;
  padding: 7px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #94a3b8; font-size: 12px; cursor: pointer;
}
.reset-btn:hover { background: #f1f5f9; color: #475569; }

/* 列表区 */
.list-area {
  flex: 1; min-width: 0;
  background: #fff; border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.list-header {
  padding: 14px 20px 10px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.list-count { font-size: 12px; color: #94a3b8; }

.loading { padding: 40px; text-align: center; color: #94a3b8; }

.table-scroll { flex: 1; overflow-y: auto; min-height: 0; }

.ref-table {
  width: 100%; border-collapse: collapse;
  font-size: 13px;
}
.ref-table thead { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
.ref-table th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; color: #94a3b8; font-weight: 600;
  border-bottom: 1px solid #e8ecf2;
}
.ref-row { cursor: pointer; transition: background .1s; }
.ref-row:hover { background: #f8f7ff; }
.ref-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }

.seq   { color: #94a3b8; font-size: 12px; }
.year  { color: #64748b; }
.author-cell { color: #475569; font-size: 12px; }
.title-cell  { line-height: 1.5; }
.title-zh { color: #1e293b; font-weight: 500; }
.title-en { color: #94a3b8; font-size: 11px; margin-top: 2px; }

/* 类型徽章 */
.type-badge {
  display: inline-block; padding: 2px 8px;
  border-radius: 4px; font-size: 11px; font-weight: 600;
}
.type-书     { background: #ede9fe; color: #7c3aed; }
.type-报告   { background: #dbeafe; color: #1d4ed8; }
.type-文章   { background: #dcfce7; color: #15803d; }
.type-网站   { background: #fef3c7; color: #b45309; }
.type-课程标准{ background: #fce7f3; color: #be185d; }

/* 链接标签 */
.link-tag {
  display: inline-block; padding: 2px 7px;
  border-radius: 4px; font-size: 11px; font-weight: 600;
}
.link-tag.url  { background: #ede9fe; color: #6d28d9; }
.link-tag.pdf  { background: #fee2e2; color: #b91c1c; }
.link-tag.text { background: #fef9c3; color: #92400e; }
.link-tag.none { color: #cbd5e1; }

/* 弹窗 */
.modal-mask {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal-box {
  background: #fff; border-radius: 14px;
  width: 580px; max-width: 90vw; max-height: 85vh;
  overflow-y: auto; padding: 32px 32px 28px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.modal-close {
  position: absolute; top: 16px; right: 18px;
  background: none; border: none; font-size: 16px;
  color: #94a3b8; cursor: pointer;
}
.modal-close:hover { color: #1e293b; }
.modal-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.modal-year { font-size: 13px; color: #94a3b8; }
.modal-title {
  font-size: 16px; font-weight: 700; color: #1e293b;
  line-height: 1.6; margin-bottom: 4px;
}
.modal-title-en { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 10px; }
.modal-author { font-size: 13px; color: #64748b; margin-bottom: 16px; }
.modal-meta {
  display: flex; gap: 10px; font-size: 13px;
  margin-bottom: 10px; align-items: flex-start;
}
.meta-label {
  flex-shrink: 0; width: 34px; color: #94a3b8; font-weight: 600; padding-top: 1px;
}
.meta-val { color: #374151; line-height: 1.6; }

.modal-link-row {
  margin-top: 18px; padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 12px;
}
.link-btn {
  padding: 7px 18px; border-radius: 6px;
  background: #6366f1; color: #fff;
  font-size: 13px; text-decoration: none;
  transition: background .15s;
}
.link-btn:hover { background: #4f46e5; }
.dl-status {
  font-size: 12px; padding: 3px 10px;
  border-radius: 20px;
}
.dl-status.ok   { background: #dcfce7; color: #15803d; }
.dl-status.warn { background: #fef3c7; color: #92400e; }
.link-text { font-size: 12px; color: #94a3b8; word-break: break-all; }

/* 动画 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-box, .modal-fade-leave-active .modal-box { transition: transform .2s; }
.modal-fade-enter-from .modal-box { transform: scale(.96); }
</style>
