import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/login/Login.vue'
import HomePage from '../views/home/HomePage.vue'

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/homePage',
    name: 'HomePage',
    component: HomePage,
    children: [
      // WelcomPage
      {
        path: 'home',
        component: () => import('../views/home/Home.vue'),
        name: 'home'
      },
      {
        path: 'config',
        component: () => import('../views/config/SystemConfig.vue'),
        name: 'SystemConfig'
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

export default router;
