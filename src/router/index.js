import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/power/Rights.vue'
import Roles from '@/components/power/Roles.vue'
import Cate from '@/components/goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    redirect:'/welcome',
    name: 'home',
    component: Home,
    children:[
      {
        path:'/welcome',
        component:Welcome
      },{
        path:'/users',
        component:Users
      },{
        path:'/rights',
        component:Rights
      },{
        path:'/roles',
        component:Roles
      },{
        path:'/categories',
        component:Cate
      },
    ]
  },

]

const router = new VueRouter({
  routes
})
//挂在路由导航守卫，token验证，如果不通过则跳转到登录页
router.beforeEach((to,from,next)=>{
  if(to.path=='/login') return next()
  const tokenStr=window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next();
})
export default router
