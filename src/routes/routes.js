import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: 'CountryList',
        path: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;