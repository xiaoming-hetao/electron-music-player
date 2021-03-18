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
    <div class="hotComments">
      <p>精彩评论</p>

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
              <p style="color:#999">{{getDate(item.time)}}</p>
            </div>
          </div>
          <el-divider></el-divider>
        </el-timeline-item>
      </el-timeline>
    </div>
    <div class="comments">
      <p>最新评论</p>
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
import { getCommentDate } from "../../utils/date";
export default {
  computed: {
    ...mapState({
      comments: state => state.player.comments,
      hotComments: state => state.player.hotComments,
      songDetail: state => state.player.songDetail
    })
  },
  methods: {
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
  padding-right: 10px;
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
  margin-top: 20px;
  overflow-x: auto;
  .songDetail {
    display: flex;
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
  .hotComments {
    p {
      font-weight: bold;
    }
    .el-timeline-item {
      p,
      span {
        font-size: 14px;
      }
    }
  }
  .comments {
    p {
      font-weight: bold;
    }
    .el-timeline-item {
      p,
      span {
        font-size: 14px;
      }
    }
  }
}
</style>