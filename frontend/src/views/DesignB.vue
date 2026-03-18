<template>
  <div class="wrapper">
    <div class="toolbar">
      <h1>萨米特核心素养框架</h1>
      <div class="filters">
        <label v-for="s in subjects" :key="s.key">
          <input type="checkbox" v-model="s.checked" />
          <span :class="['chip', s.key]">{{ s.label }}</span>
        </label>
        <input v-model="keyword" placeholder="🔍 搜索维度..." class="search" />
      </div>
    </div>

    <div class="table-wrap">
      <table class="main-table">
        <thead>
          <tr>
            <th rowspan="2" class="th-domain">能力领域</th>
            <th rowspan="2" class="th-dim">能力维度</th>
            <th rowspan="2" class="th-desc">高阶思维能力描述</th>
            <th colspan="3" class="th-std">参考课标</th>
            <th v-for="lv in 9" :key="lv" class="th-level" :class="`lv-${lv-1}`">
              {{ lv === 1 ? '水平0' : `水平${lv - 1}` }}
            </th>
          </tr>
          <tr>
            <th class="th-sub lang">语言</th>
            <th class="th-sub soc">社会</th>
            <th class="th-sub sci">科学</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="domain in filteredDomains" :key="domain.id">
            <tr
              v-for="(dim, di) in domain.dimensions"
              :key="dim.id"
              class="data-row"
              :class="{ 'alt-row': domain.id % 2 === 0 }"
            >
              <!-- 领域合并单元格 -->
              <td
                v-if="di === 0"
                :rowspan="domain.dimensions.length"
                class="td-domain"
              >
                <div class="domain-cell">{{ domain.name }}</div>
              </td>
              <!-- 维度 -->
              <td class="td-dim">{{ dim.name }}</td>
              <!-- 描述 -->
              <td class="td-desc">{{ dim.description }}</td>
              <!-- 课标 -->
              <td class="td-sub">
                <span v-if="dim.curriculum?.language" class="dot lang">▲</span>
              </td>
              <td class="td-sub">
                <span v-if="dim.curriculum?.social" class="dot soc">▲</span>
              </td>
              <td class="td-sub">
                <span v-if="dim.curriculum?.science" class="dot sci">▲</span>
              </td>
              <!-- 水平0~8 -->
              <td
                v-for="lv in dim.levels"
                :key="lv.level"
                class="td-level"
                :class="{ 'lv-zero': lv.level === 0, 'lv-high': lv.level >= 6 }"
                @click="openModal(dim, lv)"
              >
                <div class="level-cell">
                  {{ lv.description?.slice(0, 35) }}{{ lv.description?.length > 35 ? '...' : '' }}
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 弹窗 -->
    <transition name="modal-fade">
      <div v-if="modal.show" class="modal-mask" @click.self="modal.show = false">
        <div class="modal-box">
          <div class="modal-header">
            <div>
              <span class="modal-dim">{{ modal.dim?.name }}</span>
              <span class="modal-lv" :class="{ zero: modal.lv?.level === 0 }">
                {{ modal.lv?.level === 0 ? '水平0·无证据' : `水平 ${modal.lv?.level}` }}
              </span>
            </div>
            <button class="close-btn" @click="modal.show = false">✕</button>
          </div>
          <p class="modal-desc-title">高阶思维能力描述</p>
          <p class="modal-sub-desc">{{ modal.dim?.description }}</p>
          <hr />
          <p class="modal-desc-title">水平描述</p>
          <p class="modal-content">{{ modal.lv?.description }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import axios from 'axios'

const domains = ref([])
const keyword = ref('')
const subjects = reactive([
  { key: 'lang', label: '语言', checked: true },
  { key: 'soc',  label: '社会', checked: true },
  { key: 'sci',  label: '科学', checked: true },
])
const modal = reactive({ show: false, dim: null, lv: null })

const filteredDomains = computed(() => {
  return domains.value.map(d => ({
    ...d,
    dimensions: d.dimensions.filter(dim => {
      if (keyword.value && !dim.name.includes(keyword.value)) return false
      return true
    })
  })).filter(d => d.dimensions.length > 0)
})

function openModal(dim, lv) {
  modal.dim = dim
  modal.lv = lv
  modal.show = true
}

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/domains/full')
  domains.value = res.data
})
</script>

<style scoped>
* { box-sizing: border-box; }
.wrapper { display: flex; flex-direction: column; height: 100vh; background: #f8fafc; font-family: 'PingFang SC', sans-serif; }

.toolbar { padding: 16px 24px; background: #1e293b; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.toolbar h1 { color: #fff; font-size: 18px; margin: 0; }
.filters { display: flex; align-items: center; gap: 12px; }
.filters label { display: flex; align-items: center; gap: 4px; cursor: pointer; }
.chip { padding: 3px 10px; border-radius: 12px; font-size: 12px; color: #fff; }
.chip.lang { background: #3b82f6; }
.chip.soc  { background: #22c55e; }
.chip.sci  { background: #f59e0b; }
.search { padding: 6px 12px; border-radius: 8px; border: none; font-size: 13px; width: 180px; }

.table-wrap { flex: 1; overflow: auto; padding: 16px 24px; }

.main-table { border-collapse: collapse; width: max-content; min-width: 100%; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 8px rgba(0,0,0,.06); }

thead tr th { background: #1e293b; color: #fff; padding: 10px 12px; font-size: 12px; white-space: nowrap; border: 1px solid #334155; text-align: center; }
.th-domain { width: 90px; background: #0f172a; }
.th-dim    { width: 120px; background: #1e293b; }
.th-desc   { width: 160px; background: #1e293b; }
.th-std    { background: #1e3a5f; }
.th-sub    { font-weight: 400; font-size: 11px; }
.th-sub.lang { background: #1d4ed8; }
.th-sub.soc  { background: #15803d; }
.th-sub.sci  { background: #b45309; }
.th-level  { width: 140px; }
.lv-0  { background: #7f1d1d; }
.lv-1  { background: #92400e; }
.lv-2  { background: #713f12; }
.lv-3  { background: #365314; }
.lv-4  { background: #14532d; }
.lv-5  { background: #164e63; }
.lv-6  { background: #1e3a8a; }
.lv-7  { background: #312e81; }
.lv-8  { background: #4c1d95; }

.data-row td { border: 1px solid #e2e8f0; vertical-align: top; padding: 8px 10px; font-size: 12px; }
.alt-row td { background: #f8f9ff; }
.td-domain { background: #eef2ff !important; text-align: center; vertical-align: middle; }
.domain-cell { font-weight: 700; color: #3730a3; font-size: 13px; writing-mode: vertical-rl; text-orientation: mixed; margin: 0 auto; min-height: 60px; display: flex; align-items: center; justify-content: center; }
.td-dim  { font-weight: 600; color: #1e293b; white-space: nowrap; }
.td-desc { color: #64748b; line-height: 1.5; max-width: 160px; }
.td-sub  { text-align: center; }
.dot     { font-size: 14px; font-weight: 700; }
.dot.lang { color: #3b82f6; }
.dot.soc  { color: #22c55e; }
.dot.sci  { color: #f59e0b; }
.td-level { cursor: pointer; color: #374151; line-height: 1.5; transition: background .15s; }
.td-level:hover { background: #e0e7ff !important; }
.td-level.lv-zero { background: #fef2f2; color: #ef4444; font-style: italic; }
.td-level.lv-high { background: #f0fdf4; }
.level-cell { max-width: 140px; }

/* 弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { background: #fff; border-radius: 16px; padding: 32px; width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.modal-dim { font-size: 20px; font-weight: 700; color: #1e293b; display: block; margin-bottom: 6px; }
.modal-lv  { display: inline-block; background: #4f46e5; color: #fff; padding: 3px 12px; border-radius: 12px; font-size: 13px; }
.modal-lv.zero { background: #ef4444; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #94a3b8; }
.modal-desc-title { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px; }
.modal-sub-desc { color: #64748b; font-size: 14px; line-height: 1.7; margin-bottom: 16px; }
hr { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
.modal-content { color: #1e293b; font-size: 15px; line-height: 1.9; margin: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
