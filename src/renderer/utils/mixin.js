import { run } from "./runlyric";
export const lyricMixin = {
  data() {
    return {
      timer: "",
      cur: 0,
      currentTime: 0,
      mousein: false
    };
  },
  computed: {
    audio() {
      return this.$store.state.player.song;
    },
    is_play() {
      return this.$store.state.player.is_play;
    }
  },
  updated() {
    this.toWordPosition();
  },
  methods: {
    // 调到指定歌词
    toWord() {
      var _this = this;
      this.audio.addEventListener("timeupdate", function(e) {
        let currentTime = e.target.currentTime;
        for (let key in _this.lyc) {
          if (key == Math.floor(currentTime)) {
            if (_this.lyc[key] == "&#8197;") {
              continue;
            }
            _this.cur = key;
          }
        }
      });
    },
    // 调到指定歌词的位置
    toWordPosition() {
      if (this.mousein) {
        return;
      }
      this.$nextTick(() => {
        let lis = this.$refs.wordContainer.children;
        setTimeout(() => {
          clearTimeout(this.timer);
          for (let i = 0; i < lis.length; i++) {
            if (lis[i].classList[1] == "active" && lis[i - 1]) {
              let prevOffsetTop = lis[i - 1].offsetTop ? lis[i - 1].offsetTop : "",
                nowOffsetTop = lis[i].offsetTop ? lis[i].offsetTop : "",
                diff = nowOffsetTop - prevOffsetTop,
                t = 0,
                d = 30,
                height = this.$refs.outsideContainer.offsetHeight;
              run(this.$refs.outsideContainer, this.timer, t, prevOffsetTop, diff, d, height);
            }
          }
        }, 50);
      });
    }
  }
};
