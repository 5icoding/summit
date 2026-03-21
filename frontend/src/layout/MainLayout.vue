<template>
  <div class="app-shell">
    <!-- 左侧菜单 -->
    <aside class="sidebar" :class="{ collapsed }">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">S</div>
        <transition name="fade-text">
          <span v-if="!collapsed" class="logo-text">萨米特素养</span>
        </transition>
        <button class="collapse-btn" @click="collapsed = !collapsed">
          {{ collapsed ? '→' : '←' }}
        </button>
      </div>

      <!-- 菜单 -->
      <nav class="menu">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="menu-item"
          active-class="menu-active"
          exact-active-class="menu-exact"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <transition name="fade-text">
            <span v-if="!collapsed" class="menu-label">{{ item.label }}</span>
          </transition>
          <transition name="fade-text">
            <span v-if="!collapsed && item.badge" class="menu-badge">{{ item.badge }}</span>
          </transition>
        </router-link>
      </nav>

      <!-- 底部版本 -->
      <div class="sidebar-footer">
        <transition name="fade-text">
          <span v-if="!collapsed" class="version">v1.0.0</span>
        </transition>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <div class="main-wrap">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="breadcrumb">
          <span class="bc-home">首页</span>
          <template v-if="route.meta.title !== '首页'">
            <span class="bc-sep">/</span>
            <span class="bc-current">{{ route.meta.title }}</span>
          </template>
        </div>
        <div class="topbar-right">
          <span class="sys-label">萨米特核心素养系统</span>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const collapsed = ref(false)
const route = useRoute()

const menuItems = [
  { to: '/',           icon: '⊞', label: '首页',       badge: '' },
  { to: '/framework',  icon: '◈', label: '核心素养框架', badge: '36' },
  { to: '/curriculum', icon: '◉', label: '参考课标',    badge: '' },
  { to: '/pbl',        icon: '◧', label: 'PBL 项目库',  badge: '36' },
  { to: '/pbl-open',   icon: '◩', label: '公开PBL项目', badge: '36' },
  { to: '/references', icon: '◎', label: '参考文献',    badge: '60' },
]
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f0f2f7;
}

/* ── 侧边栏 ── */
.sidebar {
  width: 220px;
  background: #1a1d2e;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width .25s ease;
  overflow: hidden;
}
.sidebar.collapsed { width: 64px; }

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  position: relative;
}
.logo-icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: #fff; font-size: 16px;
  flex-shrink: 0;
}
.logo-text {
  font-size: 14px; font-weight: 700;
  color: #e2e8f0;
  white-space: nowrap;
  flex: 1;
}
.collapse-btn {
  background: rgba(255,255,255,.08);
  border: none; cursor: pointer;
  color: #94a3b8; font-size: 12px;
  width: 22px; height: 22px;
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.collapse-btn:hover { background: rgba(255,255,255,.15); color: #fff; }

.menu {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #94a3b8;
  font-size: 13px;
  transition: all .15s;
  white-space: nowrap;
  overflow: hidden;
}
.menu-item:hover {
  background: rgba(255,255,255,.07);
  color: #e2e8f0;
}
.menu-item.menu-active, .menu-item.menu-exact {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
}
.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}
.menu-label { flex: 1; }
.menu-badge {
  background: rgba(255,255,255,.2);
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,.08);
}
.version { font-size: 11px; color: #475569; }

/* ── 右侧 ── */
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8ecf2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.bc-home  { color: #94a3b8; }
.bc-sep   { color: #cbd5e1; }
.bc-current { color: #1e293b; font-weight: 600; }
.topbar-right { font-size: 12px; color: #cbd5e1; }
.sys-label { }

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

/* ── 动画 ── */
.fade-text-enter-active, .fade-text-leave-active { transition: opacity .15s; }
.fade-text-enter-from, .fade-text-leave-to { opacity: 0; }

.page-fade-enter-active, .page-fade-leave-active { transition: opacity .2s ease; }
.page-fade-enter-from, .page-fade-leave-to { opacity: 0; }
</style>
