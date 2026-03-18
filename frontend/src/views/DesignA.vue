<template>
  <div class="layout">
    <!-- 左侧树形导航 -->
    <aside class="sidebar">
      <div class="sidebar-title">能力领域</div>
      <div v-for="domain in domains" :key="domain.id" class="domain-block">
        <div class="domain-name" @click="domain.open = !domain.open">
          <span class="arrow" :class="{ rotated: domain.open }">▶</span>
          {{ domain.name }}
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
              {{ dim.name }}
              <span class="subject-tags">
                <span v-if="dim.curriculum?.language" class="tag lang">语</span>
                <span v-if="dim.curriculum?.social"   class="tag soc">社</span>
                <span v-if="dim.curriculum?.science"  class="tag sci">科</span>
              </span>
            </div>
          </div>
        </transition>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="main">
      <div v-if="!selectedDim" class="empty-tip">← 请从左侧选择一个能力维度</div>
      <template v-else>
        <!-- 维度标题 -->
        <div class="dim-header">
          <h2>{{ selectedDim.name }}</h2>
          <p class="desc">{{ selectedDim.description }}</p>
          <div class="subject-row">
            <span>参考课标：</span>
            <span v-if="selectedDim.curriculum?.language" class="badge lang">语言</span>
            <span v-if="selectedDim.curriculum?.social"   class="badge soc">社会</span>
            <span v-if="selectedDim.curriculum?.science"  class="badge sci">科学</span>
          </div>
        </div>

        <!-- 水平选择器 -->
        <div class="level-tabs">
          <button
            v-for="lv in selectedDim.levels"
            :key="lv.level"
            class="level-tab"
            :class="{ active: activeLevel === lv.level, zero: lv.level === 0 }"
            @click="activeLevel = lv.level"
          >
            {{ lv.level === 0 ? '无证据' : `水平${lv.level}` }}
          </button>
        </div>

        <!-- 水平描述卡片 -->
        <transition name="fade" mode="out-in">
          <div class="level-card" :key="activeLevel">
            <div class="level-badge" :class="`lv-${activeLevel}`">
              {{ activeLevel === 0 ? '水平0·无证据' : `水平 ${activeLevel}` }}
            </div>
            <p class="level-desc">
              {{ currentLevel?.description || '暂无描述' }}
            </p>
          </div>
        </transition>

        <!-- 所有水平概览 -->
        <div class="all-levels">
          <div
            v-for="lv in selectedDim.levels"
            :key="lv.level"
            class="mini-card"
            :class="{ active: activeLevel === lv.level }"
            @click="activeLevel = lv.level"
          >
            <div class="mini-level">{{ lv.level === 0 ? '无证据' : `水平${lv.level}` }}</div>
            <div class="mini-desc">{{ lv.description?.slice(0, 40) }}...</div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const domains = ref([])
const selectedDim = ref(null)
const activeLevel = ref(1)

const currentLevel = computed(() =>
  selectedDim.value?.levels?.find(l => l.level === activeLevel.value)
)

function selectDim(dim) {
  selectedDim.value = dim
  activeLevel.value = 1
}

onMounted(async () => {
  const res = await axios.get('http://localhost:3000/api/domains/full')
  domains.value = res.data.map(d => ({ ...d, open: false }))
})
</script>

<style scoped>
.layout { display: flex; height: 100vh; font-family: 'PingFang SC', sans-serif; background: #f5f7fa; }

/* 左侧 */
.sidebar { width: 260px; background: #fff; border-right: 1px solid #e8ecf0; overflow-y: auto; flex-shrink: 0; }
.sidebar-title { padding: 20px 16px 12px; font-size: 15px; font-weight: 700; color: #1a1a2e; border-bottom: 2px solid #4f46e5; }
.domain-block { border-bottom: 1px solid #f0f0f0; }
.domain-name { padding: 10px 16px; cursor: pointer; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; }
.domain-name:hover { background: #f8f9ff; }
.arrow { font-size: 10px; transition: transform 0.2s; display: inline-block; }
.arrow.rotated { transform: rotate(90deg); }
.dim-list { background: #fafbff; }
.dim-item { padding: 8px 16px 8px 32px; cursor: pointer; color: #64748b; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
.dim-item:hover { background: #ede9fe; color: #4f46e5; }
.dim-item.active { background: #4f46e5; color: #fff; border-radius: 0; }
.subject-tags { display: flex; gap: 3px; }
.tag { padding: 1px 4px; border-radius: 3px; font-size: 10px; }
.dim-item.active .tag { opacity: 0.8; }
.tag.lang { background: #dbeafe; color: #1d4ed8; }
.tag.soc  { background: #dcfce7; color: #15803d; }
.tag.sci  { background: #fef3c7; color: #b45309; }
.dim-item.active .tag.lang { background: rgba(255,255,255,0.3); color: #fff; }
.dim-item.active .tag.soc  { background: rgba(255,255,255,0.3); color: #fff; }
.dim-item.active .tag.sci  { background: rgba(255,255,255,0.3); color: #fff; }

/* 右侧 */
.main { flex: 1; overflow-y: auto; padding: 32px; }
.empty-tip { color: #94a3b8; font-size: 16px; margin-top: 120px; text-align: center; }
.dim-header { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.dim-header h2 { margin: 0 0 8px; color: #1e293b; font-size: 22px; }
.desc { color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 12px; }
.subject-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; }
.badge { padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge.lang { background: #dbeafe; color: #1d4ed8; }
.badge.soc  { background: #dcfce7; color: #15803d; }
.badge.sci  { background: #fef3c7; color: #b45309; }

/* 水平选择器 */
.level-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.level-tab { padding: 6px 16px; border: 1.5px solid #e2e8f0; border-radius: 20px; cursor: pointer; background: #fff; font-size: 13px; color: #64748b; transition: all .2s; }
.level-tab:hover { border-color: #4f46e5; color: #4f46e5; }
.level-tab.active { background: #4f46e5; color: #fff; border-color: #4f46e5; }
.level-tab.zero { border-color: #fca5a5; color: #ef4444; }
.level-tab.zero.active { background: #ef4444; border-color: #ef4444; color: #fff; }

/* 水平描述卡 */
.level-card { background: #fff; border-radius: 12px; padding: 28px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(79,70,229,.08); border-left: 5px solid #4f46e5; }
.level-card .lv-0 { color: #ef4444; }
.level-badge { font-size: 13px; font-weight: 700; color: #4f46e5; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.level-desc { color: #374151; font-size: 15px; line-height: 1.8; margin: 0; }

/* 概览 */
.all-levels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.mini-card { background: #fff; border-radius: 8px; padding: 14px; cursor: pointer; border: 1.5px solid transparent; transition: all .2s; }
.mini-card:hover { border-color: #c7d2fe; }
.mini-card.active { border-color: #4f46e5; background: #eef2ff; }
.mini-level { font-size: 12px; font-weight: 700; color: #4f46e5; margin-bottom: 6px; }
.mini-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; }

/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.collapse-enter-active, .collapse-leave-active { transition: all .25s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { max-height: 0; opacity: 0; }
.collapse-enter-to, .collapse-leave-from { max-height: 600px; opacity: 1; }
</style>
