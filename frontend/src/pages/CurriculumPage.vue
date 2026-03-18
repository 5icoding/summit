<template>
  <div class="curriculum-page">
    <div class="page-header">
      <h2>参考课标对应关系</h2>
      <p>36个能力维度与语言、社会、科学三类课标的对应关系</p>
    </div>

    <!-- 筛选器 -->
    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-btn"
        :class="[f.cls, { active: activeFilter === f.key }]"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        <span class="filter-count">{{ getCounts(f.key) }}</span>
      </button>
    </div>

    <!-- 表格 -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th class="th-domain">能力领域</th>
            <th class="th-dim">能力维度</th>
            <th class="th-desc">高阶思维能力描述</th>
            <th class="th-sub lang-h">语言</th>
            <th class="th-sub soc-h">社会</th>
            <th class="th-sub sci-h">科学</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="domain in filteredData" :key="domain.id">
            <tr
              v-for="(dim, di) in domain.dimensions"
              :key="dim.id"
              class="data-row"
            >
              <td
                v-if="di === 0"
                :rowspan="domain.dimensions.length"
                class="td-domain"
              >
                {{ domain.name }}
              </td>
              <td class="td-dim" @click="$router.push(`/dimension/${dim.id}`)">
                {{ dim.name }}
                <span class="link-icon">→</span>
              </td>
              <td class="td-desc">{{ dim.description }}</td>
              <td class="td-sub">
                <span v-if="dim.curriculum?.language" class="dot lang">▲</span>
              </td>
              <td class="td-sub">
                <span v-if="dim.curriculum?.social" class="dot soc">▲</span>
              </td>
              <td class="td-sub">
                <span v-if="dim.curriculum?.science" class="dot sci">▲</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDomainsFull } from '../api/index.js'

const domains = ref([])
const activeFilter = ref('all')

const filters = [
  { key: 'all',  label: '全部',    cls: 'f-all' },
  { key: 'lang', label: '语言',    cls: 'f-lang' },
  { key: 'soc',  label: '社会',    cls: 'f-soc' },
  { key: 'sci',  label: '科学',    cls: 'f-sci' },
]

function getCounts(key) {
  if (key === 'all') return domains.value.flatMap(d => d.dimensions).length
  return domains.value.flatMap(d => d.dimensions).filter(dim => {
    if (key === 'lang') return dim.curriculum?.language
    if (key === 'soc')  return dim.curriculum?.social
    if (key === 'sci')  return dim.curriculum?.science
    return true
  }).length
}

const filteredData = computed(() => {
  return domains.value.map(d => ({
    ...d,
    dimensions: d.dimensions.filter(dim => {
      if (activeFilter.value === 'all')  return true
      if (activeFilter.value === 'lang') return dim.curriculum?.language
      if (activeFilter.value === 'soc')  return dim.curriculum?.social
      if (activeFilter.value === 'sci')  return dim.curriculum?.science
      return true
    })
  })).filter(d => d.dimensions.length > 0)
})

onMounted(async () => {
  const res = await getDomainsFull()
  domains.value = res.data
})
</script>

<style scoped>
* { box-sizing: border-box; }
.curriculum-page { max-width: 1200px; }

.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0 0 4px; }
.page-header p  { font-size: 13px; color: #94a3b8; margin: 0; }

/* 筛选器 */
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.filter-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff; cursor: pointer;
  font-size: 13px; color: #64748b;
  transition: all .15s;
}
.filter-btn:hover { border-color: #6366f1; color: #6366f1; }
.filter-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; }
.filter-count {
  background: rgba(0,0,0,.08); color: inherit;
  font-size: 11px; padding: 1px 6px; border-radius: 8px;
}
.filter-btn.active .filter-count { background: rgba(255,255,255,.25); }
.f-lang.active { background: #3b82f6; border-color: #3b82f6; }
.f-soc.active  { background: #22c55e; border-color: #22c55e; }
.f-sci.active  { background: #f59e0b; border-color: #f59e0b; }

/* 表格 */
.table-wrap { background: #fff; border-radius: 12px; overflow: auto; border: 1px solid #e8ecf2; }
.table { border-collapse: collapse; width: 100%; }
thead th { background: #1e293b; color: #fff; padding: 12px 14px; font-size: 12px; white-space: nowrap; border: 1px solid #334155; }
.th-domain { width: 100px; }
.th-dim    { width: 130px; }
.th-desc   { min-width: 200px; }
.th-sub    { width: 60px; text-align: center; }
.lang-h    { background: #1d4ed8; }
.soc-h     { background: #15803d; }
.sci-h     { background: #b45309; }

.data-row td { border: 1px solid #f1f5f9; padding: 10px 14px; font-size: 12px; vertical-align: top; }
.data-row:hover td { background: #f8f9ff; }
.td-domain { background: #eef2ff; font-weight: 700; color: #3730a3; text-align: center; vertical-align: middle; font-size: 13px; }
.td-dim {
  font-weight: 600; color: #1e293b; cursor: pointer;
  white-space: nowrap;
}
.td-dim:hover { color: #6366f1; }
.link-icon { color: #c7d2fe; margin-left: 4px; }
.td-dim:hover .link-icon { color: #6366f1; }
.td-desc { color: #64748b; line-height: 1.5; }
.td-sub  { text-align: center; }
.dot     { font-size: 14px; font-weight: 700; }
.dot.lang { color: #3b82f6; }
.dot.soc  { color: #22c55e; }
.dot.sci  { color: #f59e0b; }
</style>
