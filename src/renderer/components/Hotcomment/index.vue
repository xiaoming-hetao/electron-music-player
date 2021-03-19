<template>
  <div
    class="commentContainer"
    ref="commentContainer"
  >

    <div class="hotComments">
      <p style="font-weight: bold;">精彩评论</p>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in handleComments"
          :key="index"
        >
          <div style="display:flex">
            <img
              :src="item.user.avatarUrl"
              width=30
              height=30
              style="border-radius:50%"
              alt="评论者封面"
            >
            <div style="margin-left:10px">
              <span style="color:#409EFF">{{item.user.nickname}}</span>:
              <span>{{item.content}}</span>
              <p
                v-if="item.beReplied.length"
                class="aiteUser"
              >
                <span style="color:#409EFF">@{{item.beReplied[0].user.nickname}}</span>:
                <span>{{item.beReplied[0].content}}</span>
              </p>
              <p style="color:#999">{{getDate(item.time)}}</p>
            </div>
          </div>
          <el-divider></el-divider>
        </el-timeline-item>
      </el-timeline>
      <div
        style="margin:10px 0"
        v-loading="loading"
        element-loading-text="载入中"
        element-loading-spinner="el-icon-loading"
      >

      </div>
    </div>

  </div>
</template>
<script>
import { mapState } from "vuex";
import { getHotComment } from "../../api";
import { getCommentDate } from "../../utils/date";
export default {
  data() {
    return {
      handleComments: [],
      offset: 0,
      loading: false,
      id: ""
    };
  },
  computed: {
    ...mapState({
      hotComments: state => state.player.hotComments
    })
  },
  methods: {
    getDate(timestamp) {
      return getCommentDate(new Date(timestamp));
    },
    scrollGetComment() {
      let dom = this.$refs.commentContainer;

      const that = this;
      // 滚动加载
      dom.addEventListener("scroll", () => {
        const clientHeight = dom.clientHeight;
        const scrollTop = dom.scrollTop;
        const scrollHeight = dom.scrollHeight;

        if (clientHeight + scrollTop >= scrollHeight) {
          that.offset++;
          const limit = 20;
          that.loading = true;

          getHotComment(that.id, limit, that.offset).then(res => {
            that.handleComments.push(...res.hotComments);
            that.loading = false;
          });
        }
      });
    }
  },
  mounted() {
    this.handleComments = this.hotComments;
  },
  activated() {
    let id = this.$route.query.id;
    if (id !== this.id) {
      this.id = id;
      this.scrollGetComment();
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/.el-divider {
  margin: 5px 0;
}
/deep/.el-timeline-item {
  margin-left: -67px;
  padding-right: 20px;
  p,
  span {
    font-size: 13px;
  }
  .aiteUser {
    font-size: 13px;
    width: 100%;
    height: auto;
    padding: 5px 5px;
    line-height: 20px;
    background: #e6e6e6;
    border-radius: 5px;
  }
  .el-timeline-item__tail {
    border-left: none;
  }
  .el-timeline-item__node {
    background-color: #fff;
  }
}
.commentContainer {
  min-height: 430px;
  width: 100%;
  margin-left: 20px;
  overflow-x: auto;
  .hotComments {
    margin-top: 20px;
  }
}
</style>