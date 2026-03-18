<template>
  <div class="detail-wrap">

    <!-- 左侧目录 -->
    <aside class="toc-panel">
      <button class="back-btn" @click="$router.back()">← 返回</button>
      <div class="toc-head">目录</div>
      <button
        v-for="sec in tree" :key="sec.id"
        :class="['toc-link', { active: activeSecId === sec.id }]"
        @click="activeSecId = sec.id"
      >{{ sec.title || sec.number }}</button>
    </aside>

    <!-- 右侧内容 -->
    <div class="detail-main">

      <!-- 项目头部（始终显示） -->
      <div class="proj-header" v-if="project">
        <div class="ph-badges">
          <span :class="['cat-badge', catCls(project.category)]">{{ project.category }}</span>
          <span :class="['pa-badge', `pa-${project.pa_type}`]">PA{{ project.pa_type }}</span>
          <span v-if="project.is_certified" class="cert-badge">官方认证</span>
        </div>
        <div class="ph-title-row">
          <h1 class="ph-title">{{ project.name_zh || project.name_en }}</h1>
          <div class="ph-meta">
            <span v-if="project.china_grade" class="meta-tag">{{ project.china_grade }}</span>
            <span v-if="project.duration"    class="meta-tag amber">{{ project.duration }}</span>
            <span v-if="project.subject"     class="meta-tag purple">{{ project.subject }}</span>
          </div>
        </div>
        <p v-if="project.name_zh" class="ph-en">{{ project.name_en }}</p>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading">加载中...</div>

      <!-- 当前选中节内容 -->
      <template v-if="activeSection">
        <div class="sec-block">

          <!-- 标题栏 + 展开全部按钮 -->
          <div class="sec-title-bar">
            <span class="sec-title-text">{{ activeSection.title || activeSection.number }}</span>
            <button class="expand-all-btn" @click="toggleAll">
              {{ allExpanded ? '收起全部 ▲' : '展开全部 ▼' }}
            </button>
          </div>

          <!-- 折叠条目 -->
          <div
            v-for="item in activeSection.children"
            :key="item.id"
            class="item-block"
          >
            <!-- 可点击的标题行 -->
            <div class="item-header" @click="toggleItem(item.id)">
              <span v-if="item.number" class="item-num">{{ item.number }}</span>
              <span class="item-label">{{ item.title || item.number }}</span>
              <span class="chevron" :class="{ open: expandedIds[item.id] }">▼</span>
            </div>

            <!-- 折叠内容 -->
            <transition name="slide">
              <div v-if="expandedIds[item.id]" class="item-body">
                <div v-if="item.content" class="item-content" v-html="renderContent(item.content)"></div>
                <div v-else class="item-empty">暂无内容</div>
              </div>
            </transition>
          </div>

        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPblProject, getPblInstructions } from '../api/index.js'

const route       = useRoute()
const project     = ref(null)
const tree        = ref([])
const loading     = ref(true)
const activeSecId = ref(null)
const expandedIds = ref({})   // { [item.id]: boolean }

const activeSection = computed(() => tree.value.find(s => s.id === activeSecId.value) || null)

const allExpanded = computed(() => {
  const children = activeSection.value?.children || []
  return children.length > 0 && children.every(c => expandedIds.value[c.id])
})

// 切换章节时重置展开状态
watch(activeSecId, () => { expandedIds.value = {} })

function toggleItem(id) {
  expandedIds.value = { ...expandedIds.value, [id]: !expandedIds.value[id] }
}

function toggleAll() {
  const children = activeSection.value?.children || []
  if (allExpanded.value) {
    expandedIds.value = {}
  } else {
    const all = {}
    children.forEach(c => { all[c.id] = true })
    expandedIds.value = all
  }
}

const catMap = { '语言': 'lang', '数学': 'math', '科学': 'sci', '社科': 'soc' }
function catCls(c) { return catMap[c] || '' }

function renderContent(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

onMounted(async () => {
  try {
    const [pRes, iRes] = await Promise.all([
      getPblProject(route.params.id),
      getPblInstructions()
    ])
    project.value = pRes.data
    tree.value    = iRes.data
    if (tree.value.length) activeSecId.value = tree.value[0].id
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.detail-wrap {
  display: flex;
  height: calc(100vh - 56px - 56px);
  gap: 20px;
  min-height: 0;
}

/* ── 左侧目录 ── */
.toc-panel {
  width: 180px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ecf2;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.back-btn {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  color: #6366f1;
  font-weight: 600;
  text-align: left;
  margin-bottom: 12px;
  font-family: inherit;
}
.back-btn:hover { background: #eef2ff; }
.toc-head {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
  padding: 0 6px;
  margin-bottom: 4px;
}
.toc-link {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border-radius: 7px;
  border: none;
  background: none;
  font-size: 12px;
  color: #64748b;
  text-align: left;
  cursor: pointer;
  transition: all .12s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: inherit;
}
.toc-link:hover  { background: #f1f5f9; color: #6366f1; }
.toc-link.active { background: #eef2ff; color: #6366f1; font-weight: 700; }

/* ── 右侧内容 ── */
.detail-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
}

/* 项目头部 */
.proj-header {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ecf2;
  padding: 24px 28px;
  flex-shrink: 0;
}
.ph-badges { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.cat-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: #fff; }
.cat-badge.lang { background: #3b82f6; }
.cat-badge.math { background: #8b5cf6; }
.cat-badge.sci  { background: #22c55e; }
.cat-badge.soc  { background: #f59e0b; }
.pa-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: #fff; }
.pa-1 { background: #94a3b8; } .pa-2 { background: #64748b; }
.pa-3 { background: #6366f1; } .pa-4 { background: #8b5cf6; }
.cert-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; background: #fef3c7; color: #b45309; }
.ph-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
.ph-title { font-size: 22px; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.4; }
.ph-en    { font-size: 13px; color: #94a3b8; margin: 0; }
.ph-meta  { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.meta-tag        { padding: 3px 10px; border-radius: 6px; font-size: 12px; background: #ede9fe; color: #6d28d9; font-weight: 600; }
.meta-tag.amber  { background: #fef3c7; color: #b45309; }
.meta-tag.purple { background: #f3e8ff; color: #7c3aed; }

.loading { text-align: center; padding: 40px; color: #94a3b8; }

/* ── 章节块 ── */
.sec-block {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ecf2;
  overflow: hidden;
  flex-shrink: 0;
}

.sec-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #6366f1;
  padding: 12px 20px;
}
.sec-title-text {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}
.expand-all-btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1.5px solid rgba(255,255,255,.5);
  background: transparent;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background .12s;
  white-space: nowrap;
}
.expand-all-btn:hover { background: rgba(255,255,255,.15); }

/* ── 折叠条目 ── */
.item-block {
  border-bottom: 1px solid #f1f5f9;
}
.item-block:last-child { border-bottom: none; }

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  cursor: pointer;
  user-select: none;
  transition: background .1s;
}
.item-header:hover { background: #f8f9ff; }

.item-num {
  flex-shrink: 0;
  background: #eef2ff;
  color: #6366f1;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
}
.item-label {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.chevron {
  font-size: 10px;
  color: #94a3b8;
  transition: transform .2s;
  flex-shrink: 0;
}
.chevron.open { transform: rotate(180deg); color: #6366f1; }

/* 折叠内容区 */
.item-body {
  padding: 0 20px 16px 20px;
  border-top: 1px dashed #f1f5f9;
}
.item-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.9;
  padding-top: 12px;
}
.item-empty {
  font-size: 13px;
  color: #cbd5e1;
  padding-top: 12px;
}

/* 展开动画 */
.slide-enter-active { transition: all .2s ease; }
.slide-leave-active { transition: all .15s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
