<template>
  <el-dialog
    @close="handleClose"
    :visible.sync="dialogVisible"
    :append-to-body="true"
    width="340px"
    :close-on-click-modal="false"
    custom-class="login-dialog"
  >
    <div slot="title">
      <span
        v-show="showRegister"
        class="dialog-title"
        @click="() => ((showLogin = true), (showRegister = false), (changeIcon = false))"
      >&lt;返回登录</span>
      <span
        v-show="showLogin && isLoginByPhone"
        class="dialog-title"
        @click="handleLogin"
      >扫码登录</span>
    </div>
    <div class="login-body">
      <i
        v-show="isLoginByPhone && !changeIcon"
        class="icon el-icon-mobile-phone"
      ></i>
      <i
        v-show="changeIcon"
        class="icon el-icon-sunny"
      ></i>
      <div v-if="showLogin">
        <div v-if="isLoginByPhone">
          <div class="from">
            <div class="input-items">
              <div class="input-box">
                <div class="l-icon flex-c-c">
                  <i class="iconfont icon-shoujihao"></i>
                </div>
                <el-input
                  :autofocus="true"
                  v-model="phone"
                  clearable
                  placeholder="请输入手机号"
                ></el-input>
              </div>
              <div class="input-box border-t">
                <div class="l-icon flex-c-c">
                  <i class="iconfont icon-mima"></i>
                </div>
                <el-input
                  v-model="password"
                  type="password"
                  clearable
                  placeholder="请输入密码"
                ></el-input>
              </div>
            </div>

            <div class="btns">
              <el-button
                type="danger"
                :disabled="!disabled"
                @click="loginClick"
                :loading="loading"
              >立即登录</el-button>
            </div>
          </div>
          <div>
            <p
              style="text-align:center;cursor:pointer;text-decoration:underline;"
              @click="handleRegister"
            >注册</p>
          </div>
        </div>
        <div
          v-else
          style="text-align: center;"
        >
          <p style="font-size: 24px;">扫码登录</p>
          <div class="container">
            <img
              ref="qrimg"
              alt="二维码"
              src="https://music.163.com/login?codekey=7ac2dc9d-880d-482f-89ee-56dd9d501b9b"
            />
            <div
              class="mask"
              v-if="codeIsExpire"
            >
              <span style="color: #fff;line-height:180px;">二维码已经失效</span>
              <div
                class="refresh-btn"
                @click="loginByQRcode"
              >
                点击刷新
              </div>
            </div>
          </div>
          <p>使用<span style="color: #409EFF;">网易云音乐APP</span>扫码登录</p>
        </div>
        <div
          style="cursor:pointer;text-align: center;"
          @click="() => (isLoginByPhone = true)"
          v-if="!isLoginByPhone"
        >
          <p>选择其他登录方式 ></p>
        </div>
      </div>

      <Register
        v-if="showRegister"
        v-model="changeIcon"
        :dialogVisible="dialogVisible"
        @changeVisible="() => (this.dialogVisible = false)"
      />
    </div>
  </el-dialog>
</template>
<script>
import { login, getUserPlayList, getUserPlayHistory } from "../../api/user";
import Register from "../Register/index";
import axios from "axios";
const { ipcRenderer } = require("electron");
export default {
  components: {
    Register
  },
  data() {
    return {
      dialogVisible: false,
      phone: "",
      password: "",
      codeIsExpire: false,
      loading: false,
      isLoginByPhone: false,
      changeIcon: false,
      showLogin: true,
      showRegister: false
    };
  },
  mounted() {
    this.$bus.$on("login", res => {
      this.dialogVisible = true;
      this.loginByQRcode();
    });
    this.$bus.$on("logout", res => {
      // location.reload();
    });
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
      this.$forceUpdate();
    },
    async loginByQRcode() {
      this.codeIsExpire = false;

      async function getLoginStatus() {
        const res = await axios({
          url: `http://localhost:4000/login/status?timerstamp=${Date.now()}`,
          withCredentials: true
        });

        return res.data.data;
      }

      async function checkStatus(key) {
        const res = await axios({
          url: `http://localhost:4000/login/qr/check?key=${key}&timerstamp=${Date.now()}`,
          withCredentials: true
        });

        return res.data;
      }

      // 生成二维码(为了防止缓存，请求时要带上时间戳)
      let timer;
      // let timestamp = Date.now();
      const keyRes = await axios({
        url: `http://localhost:4000/login/qr/key?timerstamp=${Date.now()}`,
        withCredentials: true
      });

      //生成二维码需要的key
      const key = keyRes.data.data.unikey;

      // 生成二维码
      const qrcodeRes = await axios({
        url: `http://localhost:4000/login/qr/create?key=${key}&qrimg=true&timerstamp=${Date.now()}`,
        withCredentials: true
      });
      this.$refs.qrimg.src = qrcodeRes.data.data.qrimg;

      // 轮询检测二维码的有效性
      timer = setInterval(async () => {
        const statusRes = await checkStatus(key);
        if (statusRes.code === 800) {
          console.log("二维码已过期，请重新获取");
          clearInterval(timer);
          this.codeIsExpire = true;
        }

        if (statusRes.code === 803) {
          clearInterval(timer);
          console.log("授权登录成功");

          const res = await getLoginStatus();
          ipcRenderer.send("set_user", res);

          // const uid = res.profile.userId;
          // getUserPlayList(uid).then(res => {
          //   console.log(res);
          // });

          // 存储用户的播放记录
          const store = localStorage.getItem("userPlayHistory");
          if (!store) {
            const userPlayHistory = [];
            localStorage.setItem("userPlayHistory", JSON.stringify(userPlayHistory));
          }

          this.$store.dispatch("SET_LOGIN", res);
          this.dialogVisible = false;
        }

        if (this.isLoginByPhone) {
          clearInterval(timer);
        }
      }, 3000);
    },

    handleRegister() {
      this.showLogin = false;
      this.showRegister = true;
    },
    handleLogin() {
      this.isLoginByPhone = false;
      this.loginByQRcode();
    },
    loginClick() {
      this.loading = true;
      login(this.phone, this.password)
        .then(res => {
          this.loading = false;
          this.dialogVisible = false;
          this.$store.dispatch("SET_LOGIN", res);
        })
        .catch(res => {
          this.loading = false;
        });
    }
  },
  computed: {
    disabled() {
      return this.phone.length === 11 && this.password.length > 1;
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 200px;
  height: 200px;
}
.container > img {
  width: 200px;
  height: 200px;
}

.container > .mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background: rgba(0, 0, 0, 0.7);
}
.container > .mask > .refresh-btn {
  margin-top: -70px;
  margin-left: 60px;
  background-color: #409eff;
  border: none;
  color: white;
  border-radius: 4px;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  width: 60px;
  cursor: pointer;
}
/deep/ .el-dialog {
  min-height: 540px;
}
.dialog-title {
  cursor: pointer;
  font-size: 14px;
  color: #666;
}
.login-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  .icon {
    color: #f56c6c;
    font-size: 80px;
  }
  /deep/ .from {
    width: 260px;
    margin-top: 50px;
    .input-items {
      background: white;
      border: 1px solid #f0f0f0;
      border-radius: 2px;
      overflow: hidden;
    }
    .input-box {
      display: flex;
      align-items: center;
      .l-icon {
        width: 40px;
        height: 40px;
        i {
          font-size: 20px;
          color: #999;
        }
      }
      .el-input__inner {
        border: none;
        padding: 0;
      }
    }
    .border-t {
      border-top: 1px solid #f0f0f0;
    }
    .btns {
      margin-top: 30px;
      margin-bottom: 50px;
      button {
        width: 100%;
      }
    }
  }
}
</style>
