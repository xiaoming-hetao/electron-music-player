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
          path: "song-detail",
          name: "song-detail",
          component: () => import("../components/Songdetail")
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
          path: "show-mvlist",
          name: "show-mvlist",
          component: () => import("../views/music/mvlist")
        },
        {
          path: "show-singerdetail",
          name: "show-singerdetail",
          component: () => import("../views/music/singerdetail")
        },
        {
          path: "show-localmusic",
          name: "show-localmusic",
          component: () => import("../views/music/localmusic")
        },
        {
          path: "show-playhistory",
          name: "show-playhistory",
          component: () => import("../views/music/playhistory")
        },
        {
          path: "show-albumdetail",
          name: "show-albumdetail",
          component: () => import("../views/music/albumdetail")
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
          path: "song-comment",
          name: "song-comment",
          component: () => import("../components/Songcomment")
        },
        {
          path: "hot-comment",
          name: "hot-comment",
          component: () => import("../components/Hotcomment")
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
