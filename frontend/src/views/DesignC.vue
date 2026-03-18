<template>
  <div class="page">
    <!-- 顶部标题 -->
    <header class="header">
      <div class="header-inner">
        <h1>萨米特核心素养框架</h1>
        <p>7个能力领域 · 36个能力维度 · 水平0~8</p>
      </div>
    </header>

    <!-- 领域 Tab 导航 -->
    <nav class="domain-nav">
      <button
        v-for="d in domains"
        :key="d.id"
        class="domain-tab"
        :class="{ active: activeDomainId === d.id }"
        @click="activeDomainId = d.id"
      >
        <span class="tab-num">{{ d.dimensions?.length }}</span>
        {{ d.name }}
      </button>
    </nav>

    <!-- 维度卡片网格 -->
    <div class="grid-wrap">
      <transition-group name="card-list" tag="div" class="card-grid">
        <div
          v-for="dim in activeDimensions"
          :key="dim.id"
          class="dim-card"
          :class="{ expanded: expandedId === dim.id }"
          @click="toggleExpand(dim)"
        >
          <!-- 卡片头部 -->
          <div class="card-head">
            <div class="card-title">{{ dim.name }}</div>
            <div class="subject-badges">
              <span v-if="dim.curriculum?.language" class="sbadge lang">语</span>
              <span v-if="dim.curriculum?.social"   class="sbadge soc">社</span>
              <span v-if="dim.curriculum?.science"  class="sbadge sci">科</span>
            </div>
          </div>
          <p class="card-desc">{{ dim.description }}</p>

          <!-- 水平进度条 -->
          <div class="level-bar">
            <div
              v-for="lv in 9"
              :key="lv"
              class="bar-seg"
              :class="[`seg-${lv-1}`, { filled: true }]"
              :title="`水平${lv-1}`"
            ></div>
          </div>
          <div class="bar-labels">
            <span>水平0</span><span>水平8</span>
          </div>

          <!-- 展开区：水平步进器 -->
          <transition name="expand">
            <div v-if="expandedId === dim.id" class="level-stepper" @click.stop>
              <div class="stepper-tabs">
                <button
                  v-for="lv in dim.levels"
                  :key="lv.level"
                  class="step-btn"
                  :class="{ active: selectedLevel[dim.id] === lv.level, zero: lv.level === 0 }"
                  @click="selectedLevel[dim.id] = lv.level"
                >
                  {{ lv.level === 0 ? '无证据' : lv.level }}
                </button>
              </div>
              <div class="step-content">
                <div class="step-label" :class="{ zero: selectedLevel[dim.id] === 0 }">
                  {{ selectedLevel[dim.id] === 0 ? '水平0 · 无证据' : `水平 ${selectedLevel[dim.id]}` }}
                </div>
                <p class="step-desc">
                  {{ dim.levels?.find(l => l.level === selectedLevel[dim.id])?.description || '暂无数据' }}
                </p>
              </div>
            </div>
          </transition>

          <div class="card-footer">
            <span class="expand-hint">{{ expandedId === dim.id ? '▲ 收起' : '▼ 展开水平详情' }}</span>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import axios from 'axios'

const domains = ref([])
const activeDomainId = ref(null)
const expandedId = ref(null)
const selectedLevel = reactive({})

const activeDimensions = computed(() =>
  domains.value.find(d => d.id === activeDomainId.value)?.dimensions || []
)

function toggleExpand(dim) {
  if (expandedId.value === dim.id) {
    expandedId.value = null
  } else {
    expandedId.value = dim.id
    if (selectedLevel[dim.id] === undefined) selectedLevel[dim.id] = 1
  }
}

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/domains/full')
  domains.value = res.data
  if (res.data.length) activeDomainId.value = res.data[0].id
})
</script>

<style scoped>
* { box-sizing: border-box; }
.page { min-height: 100vh; background: #0f172a; font-family: 'PingFang SC', sans-serif; color: #e2e8f0; }

/* Header */
.header { background: linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%); padding: 40px 32px 32px; border-bottom: 1px solid #334155; }
.header-inner h1 { margin: 0 0 6px; font-size: 26px; color: #fff; letter-spacing: -0.5px; }
.header-inner p  { margin: 0; color: #94a3b8; font-size: 14px; }

/* Domain Tab */
.domain-nav { display: flex; gap: 0; overflow-x: auto; background: #1e293b; border-bottom: 1px solid #334155; padding: 0 24px; }
.domain-tab { padding: 14px 20px; border: none; background: none; color: #94a3b8; font-size: 13px; cursor: pointer; white-space: nowrap; border-bottom: 3px solid transparent; transition: all .2s; display: flex; align-items: center; gap: 8px; }
.domain-tab:hover { color: #e2e8f0; }
.domain-tab.active { color: #818cf8; border-bottom-color: #818cf8; }
.tab-num { background: #334155; color: #94a3b8; border-radius: 10px; padding: 1px 7px; font-size: 11px; }
.domain-tab.active .tab-num { background: #3730a3; color: #c7d2fe; }

/* Card Grid */
.grid-wrap { padding: 24px 32px; }
.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

/* Dim Card */
.dim-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; cursor: pointer; transition: all .25s; position: relative; }
.dim-card:hover { border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5, 0 8px 24px rgba(79,70,229,.15); }
.dim-card.expanded { border-color: #818cf8; background: #1e1b4b; grid-column: span 2; }

.card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.card-title { font-size: 16px; font-weight: 700; color: #e2e8f0; }
.subject-badges { display: flex; gap: 4px; }
.sbadge { padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.sbadge.lang { background: #1d4ed8; color: #bfdbfe; }
.sbadge.soc  { background: #15803d; color: #bbf7d0; }
.sbadge.sci  { background: #b45309; color: #fde68a; }

.card-desc { font-size: 12px; color: #64748b; line-height: 1.6; margin: 0 0 16px; }

/* 水平进度条 */
.level-bar { display: flex; gap: 3px; margin-bottom: 4px; }
.bar-seg { flex: 1; height: 6px; border-radius: 3px; }
.seg-0 { background: #7f1d1d; }
.seg-1 { background: #9a3412; }
.seg-2 { background: #a16207; }
.seg-3 { background: #4d7c0f; }
.seg-4 { background: #15803d; }
.seg-5 { background: #0e7490; }
.seg-6 { background: #1d4ed8; }
.seg-7 { background: #5b21b6; }
.seg-8 { background: #6d28d9; }
.bar-labels { display: flex; justify-content: space-between; font-size: 10px; color: #475569; margin-bottom: 8px; }

/* 步进器 */
.level-stepper { margin-top: 16px; border-top: 1px solid #334155; padding-top: 16px; }
.stepper-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.step-btn { padding: 5px 12px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all .15s; }
.step-btn:hover { border-color: #818cf8; color: #818cf8; }
.step-btn.active { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.step-btn.zero { border-color: #7f1d1d; color: #fca5a5; }
.step-btn.zero.active { background: #ef4444; border-color: #ef4444; color: #fff; }
.step-content { background: #0f172a; border-radius: 8px; padding: 16px; }
.step-label { font-size: 12px; font-weight: 700; color: #818cf8; margin-bottom: 10px; letter-spacing: 0.5px; }
.step-label.zero { color: #f87171; }
.step-desc { color: #cbd5e1; font-size: 13px; line-height: 1.8; margin: 0; }

/* 卡片底部 */
.card-footer { margin-top: 12px; text-align: center; }
.expand-hint { font-size: 11px; color: #475569; }

/* 动画 */
.expand-enter-active, .expand-leave-active { transition: all .3s ease; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 800px; }

.card-list-enter-active, .card-list-leave-active { transition: all .3s ease; }
.card-list-enter-from { opacity: 0; transform: translateY(20px); }
.card-list-leave-to   { opacity: 0; transform: translateY(-10px); }
</style>
