<template>
  <div class="dim-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else-if="dim">
      <!-- 返回 -->
      <div class="back-row">
        <button class="back-btn" @click="$router.push('/framework')">← 返回框架</button>
        <span class="breadcrumb-sep">/</span>
        <span class="bc-domain">{{ dim.domain_name }}</span>
        <span class="breadcrumb-sep">/</span>
        <span class="bc-dim">{{ dim.name }}</span>
      </div>

      <!-- 头部 -->
      <div class="header-card">
        <div class="header-left">
          <div class="domain-tag">{{ dim.domain_name }}</div>
          <h1>{{ dim.name }}</h1>
          <p class="desc">{{ dim.description }}</p>
        </div>
        <div class="header-right">
          <div class="curriculum-area">
            <div class="curr-title">参考课标</div>
            <div class="curr-list">
              <div v-if="dim.curriculum?.language" class="curr-item lang">
                <span class="curr-dot">●</span> 语言
              </div>
              <div v-if="dim.curriculum?.social" class="curr-item soc">
                <span class="curr-dot">●</span> 社会
              </div>
              <div v-if="dim.curriculum?.science" class="curr-item sci">
                <span class="curr-dot">●</span> 科学
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 水平步进 -->
      <div class="stepper-card">
        <div class="stepper-header">
          <div class="stepper-title">能力水平描述</div>
          <div class="stepper-nav">
            <button :disabled="activeLevel === 0" @click="activeLevel--" class="nav-btn">◀</button>
            <span class="nav-current">{{ activeLevel === 0 ? '水平0 · 无证据' : `水平 ${activeLevel}` }}</span>
            <button :disabled="activeLevel === 8" @click="activeLevel++" class="nav-btn">▶</button>
          </div>
        </div>

        <!-- 水平指示器 -->
        <div class="level-indicator">
          <div
            v-for="lv in dim.levels"
            :key="lv.level"
            class="indicator-item"
            :class="{ active: activeLevel === lv.level }"
            @click="activeLevel = lv.level"
          >
            <div class="ind-dot" :class="`ind-${lv.level}`"></div>
            <div class="ind-label">{{ lv.level === 0 ? '无' : lv.level }}</div>
          </div>
        </div>

        <!-- 当前水平内容 -->
        <transition name="slide" mode="out-in">
          <div class="level-content" :key="activeLevel">
            <div class="lc-label" :class="{ zero: activeLevel === 0 }">
              {{ activeLevel === 0 ? '水平0 · 无证据' : `水平 ${activeLevel}` }}
            </div>
            <p class="lc-text">{{ currentLevel?.description }}</p>
          </div>
        </transition>
      </div>

      <!-- 全部水平一览 -->
      <div class="all-levels-card">
        <div class="al-title">全部水平一览</div>
        <div class="al-list">
          <div
            v-for="lv in dim.levels"
            :key="lv.level"
            class="al-row"
            :class="{ active: activeLevel === lv.level, zero: lv.level === 0 }"
            @click="activeLevel = lv.level"
          >
            <div class="al-lv-badge" :class="`alb-${lv.level}`">
              {{ lv.level === 0 ? '无' : lv.level }}
            </div>
            <div class="al-desc">{{ lv.description }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDimension } from '../api/index.js'

const route = useRoute()
const dim = ref(null)
const loading = ref(true)
const activeLevel = ref(1)

const currentLevel = computed(() =>
  dim.value?.levels?.find(l => l.level === activeLevel.value)
)

onMounted(async () => {
  const res = await getDimension(route.params.id)
  dim.value = res.data
  loading.value = false
})
</script>

<style scoped>
* { box-sizing: border-box; }
.dim-detail { max-width: 900px; }
.loading { color: #94a3b8; padding: 40px; text-align: center; }

.back-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; }
.back-btn { background: none; border: 1px solid #e2e8f0; padding: 5px 12px; border-radius: 6px; cursor: pointer; color: #64748b; font-size: 12px; }
.back-btn:hover { border-color: #6366f1; color: #6366f1; }
.breadcrumb-sep { color: #cbd5e1; }
.bc-domain { color: #94a3b8; }
.bc-dim    { color: #1e293b; font-weight: 600; }

/* 头部卡片 */
.header-card {
  background: #fff; border-radius: 14px;
  padding: 28px; margin-bottom: 16px;
  display: flex; justify-content: space-between; gap: 24px;
  border: 1px solid #e8ecf2;
}
.domain-tag { font-size: 11px; font-weight: 700; color: #6366f1; margin-bottom: 8px; letter-spacing: 1px; }
.header-left h1 { font-size: 26px; font-weight: 800; color: #1e293b; margin: 0 0 10px; }
.desc { color: #64748b; font-size: 14px; line-height: 1.8; margin: 0; }

.curr-title { font-size: 11px; color: #94a3b8; margin-bottom: 10px; }
.curr-list  { display: flex; flex-direction: column; gap: 6px; }
.curr-item  { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.curr-item.lang { color: #3b82f6; }
.curr-item.soc  { color: #22c55e; }
.curr-item.sci  { color: #f59e0b; }

/* 步进卡 */
.stepper-card {
  background: #fff; border-radius: 14px;
  padding: 24px; margin-bottom: 16px;
  border: 1px solid #e8ecf2;
}
.stepper-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.stepper-title { font-size: 14px; font-weight: 700; color: #1e293b; }
.stepper-nav   { display: flex; align-items: center; gap: 12px; }
.nav-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #fff;
  cursor: pointer; font-size: 12px; color: #64748b;
}
.nav-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.nav-btn:disabled { opacity: .3; cursor: default; }
.nav-current { font-size: 14px; font-weight: 700; color: #6366f1; min-width: 100px; text-align: center; }

/* 指示器 */
.level-indicator { display: flex; gap: 8px; margin-bottom: 20px; }
.indicator-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; }
.ind-dot {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid #e2e8f0; background: #f1f5f9;
  transition: all .15s;
}
.indicator-item.active .ind-dot { transform: scale(1.3); border-color: transparent; }
.ind-label { font-size: 10px; color: #94a3b8; }
.indicator-item.active .ind-label { font-weight: 700; color: #6366f1; }
.ind-0 { background: #ef4444; } .ind-1 { background: #f97316; }
.ind-2 { background: #eab308; } .ind-3 { background: #84cc16; }
.ind-4 { background: #22c55e; } .ind-5 { background: #06b6d4; }
.ind-6 { background: #3b82f6; } .ind-7 { background: #8b5cf6; }
.ind-8 { background: #a855f7; }

.level-content { background: #f8f9ff; border-radius: 10px; padding: 20px; }
.lc-label { font-size: 13px; font-weight: 700; color: #6366f1; margin-bottom: 12px; }
.lc-label.zero { color: #ef4444; }
.lc-text  { color: #374151; font-size: 14px; line-height: 1.9; margin: 0; }

/* 全部水平 */
.all-levels-card {
  background: #fff; border-radius: 14px;
  padding: 24px; border: 1px solid #e8ecf2;
}
.al-title { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
.al-list  { display: flex; flex-direction: column; gap: 8px; }
.al-row {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 12px; border-radius: 8px; cursor: pointer;
  border: 1.5px solid transparent; transition: all .15s;
}
.al-row:hover  { background: #f8f9ff; border-color: #e0e7ff; }
.al-row.active { background: #eef2ff; border-color: #6366f1; }
.al-row.zero:hover  { background: #fff1f2; border-color: #fecdd3; }
.al-row.zero.active { background: #fff1f2; border-color: #f43f5e; }
.al-lv-badge {
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.alb-0{background:#ef4444}.alb-1{background:#f97316}.alb-2{background:#eab308}
.alb-3{background:#84cc16}.alb-4{background:#22c55e}.alb-5{background:#06b6d4}
.alb-6{background:#3b82f6}.alb-7{background:#8b5cf6}.alb-8{background:#a855f7}
.al-desc { font-size: 13px; color: #64748b; line-height: 1.7; }
.al-row.active .al-desc { color: #374151; }

/* 动画 */
.slide-enter-active, .slide-leave-active { transition: all .2s ease; }
.slide-enter-from { opacity: 0; transform: translateX(10px); }
.slide-leave-to   { opacity: 0; transform: translateX(-10px); }
</style>
