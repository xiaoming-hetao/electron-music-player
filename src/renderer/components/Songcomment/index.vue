<template>
  <div class="commentContainer">
    <div class="songDetail">
      <img
        :src="songDetail.al.picUrl"
        alt="歌曲封面"
      >
      <div style="margin-left:20px">
        <p>{{songDetail.name}}</p>
        <span>专辑：{{songDetail.al.name}}</span>
        &emsp;
        <span>歌手：{{songDetail.ar[0].name}}</span>
      </div>
    </div>

    <div style="margin: 25px 20px 50px 0px; ">
      <el-input
        type="textarea"
        :rows="3"
        v-model="comment"
        maxlength="140"
        show-word-limit
      >
      </el-input>
      <el-button
        style="margin-top:10px;float:right;"
        size="small"
        round
        @click="handleComment"
      >评 论</el-button>
    </div>

    <div class="hotComments">
      <p style="font-weight: bold;">精彩评论</p>

      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in hotComments"
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
    </div>
    <div style="text-align:center; ">
      <el-button
        size="small"
        style="margin-top: 10px;margin-bottom:40px;"
        round
        @click="handleGetHotComment"
      >更多精彩评论 ></el-button>
    </div>
    <div class="comments">
      <p style="font-weight: bold;">最新评论</p>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in comments"
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
    </div>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { sendComment } from "../../api/user";
import { getHotComment } from "../../api";
import { getCommentDate } from "../../utils/date";
export default {
  inject: ["reloadRouterView"],
  data() {
    return {
      comment: ""
    };
  },
  computed: {
    ...mapState({
      comments: state => state.player.comments,
      hotComments: state => state.player.hotComments,
      songDetail: state => state.player.songDetail
    })
  },
  methods: {
    handleGetHotComment() {
      this.$router.push({ name: "hot-comment", query: { id: this.songDetail.id } });
      this.reloadRouterView();
      this.$store.dispatch("getSongComment", this.songDetail);
    },
    handleComment() {
      sendComment(this.songDetail.id, this.comment).then(res => {
        if (res.code === 200) {
          this.$message({
            message: "评论成功",
            type: "success",
            center: true
          });
          this.comment = "";
          this.$store.dispatch("getSongComment", this.songDetail);
        }
      });
    },
    getDate(timestamp) {
      return getCommentDate(new Date(timestamp));
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
    font-size: 14px;
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
  .songDetail {
    display: flex;
    margin-top: 20px;
    p {
      font-size: 20px;
    }
    span {
      font-size: 12px;
      color: #999;
    }
    img {
      width: 100px;
      height: 100px;
      border-radius: 5px;
    }
  }
}
</style>