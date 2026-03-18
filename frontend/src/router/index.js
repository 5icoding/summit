import { createRouter, createWebHistory } from 'vue-router'

import HomePage        from '../pages/HomePage.vue'
import FrameworkPage   from '../pages/FrameworkPage.vue'
import DimensionPage   from '../pages/DimensionPage.vue'
import CurriculumPage  from '../pages/CurriculumPage.vue'
import PblPage         from '../pages/PblPage.vue'
import PblDetailPage  from '../pages/PblDetailPage.vue'

const routes = [
  { path: '/',            name: 'home',       component: HomePage,       meta: { title: '首页' } },
  { path: '/framework',   name: 'framework',  component: FrameworkPage,  meta: { title: '核心素养框架' } },
  { path: '/dimension/:id', name: 'dimension', component: DimensionPage, meta: { title: '维度详情' } },
  { path: '/curriculum',  name: 'curriculum', component: CurriculumPage, meta: { title: '参考课标' } },
  { path: '/pbl',              name: 'pbl',       component: PblPage,       meta: { title: 'PBL 项目库' } },
  { path: '/pbl/:id/detail',  name: 'pblDetail', component: PblDetailPage, meta: { title: 'PBL 项目详情' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach(to => {
  document.title = `${to.meta.title || ''} · 萨米特核心素养`
})

export default router
