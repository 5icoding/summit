<template>
  <div class="layout">
    <!-- 左侧树形导航 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">能力领域</div>
        <input v-model="keyword" class="search-box" placeholder="搜索维度..." />
      </div>

      <div class="domain-list">
        <div v-for="domain in filteredDomains" :key="domain.id" class="domain-block">
          <div class="domain-name" @click="domain.open = !domain.open">
            <span class="arrow" :class="{ rotated: domain.open }">▶</span>
            <span class="d-name">{{ domain.name }}</span>
            <span class="d-count">{{ domain.dimensions.length }}</span>
          </div>
          <transition name="collapse">
            <div v-if="domain.open" class="dim-list">
              <div
                v-for="dim in domain.dimensions"
                :key="dim.id"
                class="dim-item"
                :class="{ active: selectedDim?.id === dim.id }"
                @click="selectDim(dim)"
              >
                <span class="dim-name">{{ dim.name }}</span>
                <span class="subject-tags">
                  <span v-if="dim.curriculum?.language" class="tag lang">语</span>
                  <span v-if="dim.curriculum?.social"   class="tag soc">社</span>
                  <span v-if="dim.curriculum?.science"  class="tag sci">科</span>
                </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main">
      <!-- 空状态 -->
      <div v-if="!selectedDim" class="empty-state">
        <div class="empty-icon">◈</div>
        <p>请从左侧选择一个能力维度查看详情</p>
      </div>

      <template v-else>
        <!-- 维度信息头 -->
        <div class="dim-header">
          <div class="dim-header-left">
            <div class="dim-domain-label">{{ selectedDomain?.name }}</div>
            <h2 class="dim-title">{{ selectedDim.name }}</h2>
            <p class="dim-desc">{{ selectedDim.description }}</p>
          </div>
          <div class="dim-header-right">
            <div class="curriculum-block">
              <div class="curriculum-title">参考课标</div>
              <div class="curriculum-tags">
                <span
                  v-if="selectedDim.curriculum?.language"
                  class="c-badge lang"
                >语言</span>
                <span
                  v-if="selectedDim.curriculum?.social"
                  class="c-badge soc"
                >社会</span>
                <span
                  v-if="selectedDim.curriculum?.science"
                  class="c-badge sci"
                >科学</span>
                <span
                  v-if="!selectedDim.curriculum?.language && !selectedDim.curriculum?.social && !selectedDim.curriculum?.science"
                  class="c-badge none"
                >暂无</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 水平选择 Tab -->
        <div class="level-tab-row">
          <button
            v-for="lv in selectedDim.levels"
            :key="lv.level"
            class="lv-tab"
            :class="{
              active: activeLevel === lv.level,
              'lv-zero': lv.level === 0
            }"
            @click="activeLevel = lv.level"
          >
            <span class="lv-num">{{ lv.level }}</span>
            <span class="lv-tag">{{ lv.level === 0 ? '无证据' : `水平${lv.level}` }}</span>
          </button>
        </div>

        <!-- 当前水平详情卡 -->
        <transition name="fade" mode="out-in">
          <div class="level-detail-card" :key="activeLevel"
            :class="{ 'zero-card': activeLevel === 0 }"
          >
            <div class="ldc-top">
              <div class="ldc-badge" :class="{ zero: activeLevel === 0 }">
                {{ activeLevel === 0 ? '水平0 · 无证据' : `水平 ${activeLevel}` }}
              </div>
              <div class="ldc-progress">
                <div
                  v-for="i in 9" :key="i"
                  class="prog-seg"
                  :class="[`seg-${i-1}`, { reached: (i-1) <= activeLevel }]"
                ></div>
              </div>
            </div>
            <p class="ldc-desc">{{ currentLevel?.description }}</p>
          </div>
        </transition>

        <!-- 所有水平概览网格 -->
        <div class="overview-title">所有水平概览</div>
        <div class="overview-grid">
          <div
            v-for="lv in selectedDim.levels"
            :key="lv.level"
            class="ov-card"
            :class="{
              active: activeLevel === lv.level,
              'ov-zero': lv.level === 0
            }"
            @click="activeLevel = lv.level"
          >
            <div class="ov-level">
              {{ lv.level === 0 ? '无证据' : `水平${lv.level}` }}
            </div>
            <div class="ov-desc">
              {{ lv.description?.slice(0, 50) }}{{ lv.description?.length > 50 ? '…' : '' }}
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDomainsFull } from '../api/index.js'

const domains = ref([])
const selectedDim = ref(null)
const activeLevel = ref(1)
const keyword = ref('')

const selectedDomain = computed(() =>
  domains.value.find(d => d.dimensions?.some(dim => dim.id === selectedDim.value?.id))
)
const currentLevel = computed(() =>
  selectedDim.value?.levels?.find(l => l.level === activeLevel.value)
)
const filteredDomains = computed(() => {
  if (!keyword.value.trim()) return domains.value
  return domains.value.map(d => ({
    ...d,
    open: true,
    dimensions: d.dimensions.filter(dim => dim.name.includes(keyword.value))
  })).filter(d => d.dimensions.length > 0)
})

function selectDim(dim) {
  selectedDim.value = dim
  activeLevel.value = 1
}

onMounted(async () => {
  const res = await getDomainsFull()
  domains.value = res.data.map(d => ({ ...d, open: d.id === 1 }))
})
</script>

<style scoped>
* { box-sizing: border-box; }
.layout { display: flex; height: calc(100vh - 56px - 56px); gap: 0; }

/* ── 左侧 ── */
.sidebar {
  width: 248px; flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  display: flex; flex-direction: column;
  overflow: hidden;
  border: 1px solid #e8ecf2;
  margin-right: 20px;
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.sidebar-title { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px; }
.search-box {
  width: 100%; padding: 7px 10px;
  border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 12px; color: #374151; outline: none;
}
.search-box:focus { border-color: #6366f1; }

.domain-list { flex: 1; overflow-y: auto; padding: 8px 0; }

.domain-block { border-bottom: 1px solid #f8fafc; }
.domain-name {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; cursor: pointer;
  color: #334155; font-size: 13px; font-weight: 600;
}
.domain-name:hover { background: #f8f9ff; }
.arrow { font-size: 9px; color: #94a3b8; transition: transform .2s; flex-shrink: 0; }
.arrow.rotated { transform: rotate(90deg); }
.d-name { flex: 1; }
.d-count {
  background: #f1f5f9; color: #64748b;
  font-size: 10px; padding: 1px 6px; border-radius: 8px;
  font-weight: 400;
}

.dim-list { background: #fafbff; }
.dim-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px 8px 28px;
  cursor: pointer; font-size: 12px; color: #64748b;
  transition: all .15s;
}
.dim-item:hover { background: #ede9fe; color: #4f46e5; }
.dim-item.active { background: #6366f1; color: #fff; }
.dim-name { flex: 1; }
.subject-tags { display: flex; gap: 2px; flex-shrink: 0; }
.tag { padding: 1px 4px; border-radius: 3px; font-size: 10px; font-weight: 600; }
.tag.lang { background: #dbeafe; color: #1d4ed8; }
.tag.soc  { background: #dcfce7; color: #15803d; }
.tag.sci  { background: #fef3c7; color: #b45309; }
.dim-item.active .tag { background: rgba(255,255,255,.25); color: #fff; }

/* ── 右侧 ── */
.main { flex: 1; overflow-y: auto; min-width: 0; }

.empty-state {
  text-align: center; color: #94a3b8;
  padding-top: 100px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; }

/* 维度头 */
.dim-header {
  background: #fff; border-radius: 12px;
  padding: 24px; margin-bottom: 16px;
  display: flex; justify-content: space-between; align-items: flex-start;
  border: 1px solid #e8ecf2;
}
.dim-domain-label {
  font-size: 11px; font-weight: 700; color: #6366f1;
  letter-spacing: 1px; margin-bottom: 6px;
  text-transform: uppercase;
}
.dim-title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0 0 8px; }
.dim-desc  { font-size: 13px; color: #64748b; line-height: 1.7; margin: 0; max-width: 560px; }

.curriculum-block { text-align: right; }
.curriculum-title { font-size: 11px; color: #94a3b8; margin-bottom: 8px; }
.curriculum-tags  { display: flex; gap: 6px; justify-content: flex-end; }
.c-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.c-badge.lang { background: #dbeafe; color: #1d4ed8; }
.c-badge.soc  { background: #dcfce7; color: #15803d; }
.c-badge.sci  { background: #fef3c7; color: #b45309; }
.c-badge.none { background: #f1f5f9; color: #94a3b8; }

/* 水平 Tab */
.level-tab-row {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-bottom: 16px;
}
.lv-tab {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 14px;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  background: #fff; cursor: pointer;
  transition: all .2s; min-width: 60px;
}
.lv-tab:hover { border-color: #6366f1; }
.lv-tab.active { background: #6366f1; border-color: #6366f1; color: #fff; }
.lv-tab.lv-zero { border-color: #fecdd3; }
.lv-tab.lv-zero.active { background: #f43f5e; border-color: #f43f5e; }
.lv-num { font-size: 18px; font-weight: 800; line-height: 1; color: #1e293b; }
.lv-tag { font-size: 10px; color: #94a3b8; margin-top: 2px; white-space: nowrap; }
.lv-tab.active .lv-num,
.lv-tab.active .lv-tag { color: #fff; }

/* 水平详情卡 */
.level-detail-card {
  background: #fff; border-radius: 12px;
  padding: 24px; margin-bottom: 20px;
  border-left: 5px solid #6366f1;
  border: 1px solid #e8ecf2;
  border-left: 5px solid #6366f1;
}
.zero-card { border-left-color: #f43f5e; }
.ldc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.ldc-badge {
  background: #6366f1; color: #fff;
  padding: 4px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 700;
}
.ldc-badge.zero { background: #f43f5e; }
.ldc-progress { display: flex; gap: 4px; }
.prog-seg { width: 20px; height: 6px; border-radius: 3px; background: #e2e8f0; transition: background .2s; }
.prog-seg.reached.seg-0 { background: #ef4444; }
.prog-seg.reached.seg-1 { background: #f97316; }
.prog-seg.reached.seg-2 { background: #eab308; }
.prog-seg.reached.seg-3 { background: #84cc16; }
.prog-seg.reached.seg-4 { background: #22c55e; }
.prog-seg.reached.seg-5 { background: #06b6d4; }
.prog-seg.reached.seg-6 { background: #3b82f6; }
.prog-seg.reached.seg-7 { background: #8b5cf6; }
.prog-seg.reached.seg-8 { background: #a855f7; }
.ldc-desc { color: #374151; font-size: 14px; line-height: 1.9; margin: 0; }

/* 概览网格 */
.overview-title { font-size: 13px; font-weight: 700; color: #94a3b8; margin-bottom: 12px; letter-spacing: 1px; }
.overview-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.ov-card {
  background: #fff; border-radius: 8px;
  padding: 14px; cursor: pointer;
  border: 1.5px solid #e8ecf2;
  transition: all .15s;
}
.ov-card:hover { border-color: #a5b4fc; }
.ov-card.active { border-color: #6366f1; background: #eef2ff; }
.ov-card.ov-zero { border-color: #fecdd3; }
.ov-card.ov-zero.active { background: #fff1f2; border-color: #f43f5e; }
.ov-level { font-size: 12px; font-weight: 700; color: #6366f1; margin-bottom: 5px; }
.ov-card.ov-zero .ov-level { color: #f43f5e; }
.ov-desc { font-size: 11px; color: #94a3b8; line-height: 1.5; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.collapse-enter-active, .collapse-leave-active { transition: all .2s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { max-height: 0; opacity: 0; }
.collapse-enter-to, .collapse-leave-from { max-height: 800px; opacity: 1; }
</style>
