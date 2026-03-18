<template>
  <div class="home">
    <div class="welcome-block">
      <h1>欢迎使用萨米特核心素养系统</h1>
      <p>基于萨米特学习（Summit Learning）认知能力框架，包含 7 个能力领域、36 个能力维度，每个维度设有水平 0 至 8 共 9 级描述。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card purple">
        <div class="stat-num">7</div>
        <div class="stat-label">能力领域</div>
        <div class="stat-icon">◈</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-num">36</div>
        <div class="stat-label">能力维度</div>
        <div class="stat-icon">◉</div>
      </div>
      <div class="stat-card green">
        <div class="stat-num">{{ stats.language }}</div>
        <div class="stat-label">语言课标维度</div>
        <div class="stat-icon">语</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-num">{{ stats.social }}</div>
        <div class="stat-label">社会课标维度</div>
        <div class="stat-icon">社</div>
      </div>
      <div class="stat-card rose">
        <div class="stat-num">{{ stats.science }}</div>
        <div class="stat-label">科学课标维度</div>
        <div class="stat-icon">科</div>
      </div>
      <div class="stat-card slate">
        <div class="stat-num">324</div>
        <div class="stat-label">水平描述条目</div>
        <div class="stat-icon">≡</div>
      </div>
    </div>

    <!-- 7个领域卡片 -->
    <div class="section-title">能力领域概览</div>
    <div class="domain-grid">
      <div
        v-for="d in domains"
        :key="d.id"
        class="domain-card"
        @click="$router.push('/framework')"
      >
        <div class="dc-num">{{ String(d.sort_order).padStart(2,'0') }}</div>
        <div class="dc-name">{{ d.name }}</div>
        <div class="dc-count">{{ d.dimensions?.length }} 个维度</div>
        <div class="dc-dims">
          <span v-for="dim in d.dimensions?.slice(0,3)" :key="dim.id" class="dc-dim-tag">
            {{ dim.name }}
          </span>
          <span v-if="d.dimensions?.length > 3" class="dc-dim-more">
            +{{ d.dimensions.length - 3 }} 个
          </span>
        </div>
        <div class="dc-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDomainsFull, getStats } from '../api/index.js'

const domains = ref([])
const stats = ref({ language: 0, social: 0, science: 0 })

onMounted(async () => {
  const [d, s] = await Promise.all([getDomainsFull(), getStats()])
  domains.value = d.data
  stats.value = s.data
})
</script>

<style scoped>
.home { max-width: 1100px; }

.welcome-block {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 32px 36px;
  margin-bottom: 28px;
  color: #fff;
}
.welcome-block h1 { font-size: 22px; margin: 0 0 10px; }
.welcome-block p  { font-size: 14px; opacity: .85; line-height: 1.7; margin: 0; }

/* 统计卡 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 32px;
}
.stat-card {
  border-radius: 12px;
  padding: 20px 16px;
  position: relative;
  overflow: hidden;
}
.stat-num   { font-size: 32px; font-weight: 800; color: #fff; line-height: 1; }
.stat-label { font-size: 12px; color: rgba(255,255,255,.8); margin-top: 4px; }
.stat-icon  {
  position: absolute; right: 14px; top: 14px;
  font-size: 22px; opacity: .25; color: #fff;
}
.purple { background: linear-gradient(135deg,#6366f1,#8b5cf6); }
.blue   { background: linear-gradient(135deg,#3b82f6,#60a5fa); }
.green  { background: linear-gradient(135deg,#22c55e,#4ade80); }
.amber  { background: linear-gradient(135deg,#f59e0b,#fbbf24); }
.rose   { background: linear-gradient(135deg,#f43f5e,#fb7185); }
.slate  { background: linear-gradient(135deg,#475569,#64748b); }

/* 领域网格 */
.section-title {
  font-size: 16px; font-weight: 700; color: #1e293b;
  margin-bottom: 14px;
  padding-left: 4px;
  border-left: 4px solid #6366f1;
  padding-left: 12px;
}
.domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.domain-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  border: 1.5px solid #e2e8f0;
  transition: all .2s;
  position: relative;
}
.domain-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 20px rgba(99,102,241,.1);
  transform: translateY(-2px);
}
.dc-num   { font-size: 11px; font-weight: 700; color: #6366f1; margin-bottom: 6px; letter-spacing: 1px; }
.dc-name  { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.dc-count { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
.dc-dims  { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.dc-dim-tag {
  background: #f1f5f9; color: #475569;
  font-size: 11px; padding: 3px 8px; border-radius: 4px;
}
.dc-dim-more { font-size: 11px; color: #94a3b8; padding: 3px 0; }
.dc-arrow {
  position: absolute; right: 20px; top: 50%;
  transform: translateY(-50%);
  font-size: 18px; color: #cbd5e1;
  transition: all .2s;
}
.domain-card:hover .dc-arrow { color: #6366f1; transform: translateY(-50%) translateX(4px); }
</style>
