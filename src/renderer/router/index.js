import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "main",
      redirect: { name: "music" },
      component: require("@/views/main").default,
      children: [
        {
          path: "music",
          name: "music",
          component: () => import("../views/music/index.vue")
        },
        {
          path: "playlist-detail",
          name: "playlist-detail",
          component: () => import("../views/playlist/detail")
        },
        {
          path: "show-searchlist",
          name: "show-searchlist",
          component: () => import("../views/music/searchlist")
        },
        {
          path: "show-singerdetail",
          name: "show-singerdetail",
          component: () => import("../views/music/singerdetail")
        },
        {
          path: "show-likelist",
          name: "show-likelist",
          component: () => import("../views/music/likelist")
        },

        {
          path: "play-mv",
          name: "play-mv",
          component: () => import("../components/Mvdetail")
        },
        {
          path: "userplaylist-detail",
          name: "userplaylist-detail",
          component: () => import("../views/music/userplaylist/")
        }
      ]
    },
    {
      path: "*",
      redirect: "/"
    }
  ]
});
