<template>
  <div>
    <!-- 注册 -->
    <div class="from" v-if="showRegister">
      <div class="input-items">
        <div class="input-box">
          <div class="l-icon flex-c-c">
            <i class="iconfont icon-shoujihao"></i>
          </div>
          <el-input :autofocus="true" v-model="phone" clearable placeholder="请输入手机号"></el-input>
        </div>
        <div class="input-box border-t">
          <div class="l-icon flex-c-c">
            <i class="iconfont icon-mima"></i>
          </div>
          <el-input v-model="password" type="password" clearable placeholder="设置登录密码"></el-input>
        </div>
      </div>

      <div class="btns">
        <el-button type="danger" :disabled="!disabled" @click="registerClick" :loading="loading">注册</el-button>
      </div>
    </div>
    <!-- 验证验证码 -->
    <div v-if="verifyCaptcha" style="text-align:center;margin-top: 10px;">
      <span style="font-size: 12px;text-align:center;">为了安全，我们会向您的手机发送安全校验码</span>
      <div class="from">
        <div class="input-items">
          <div class="input-box">
            <div class="l-icon flex-c-c">
              <i class="el-icon-key"></i>
            </div>
            <el-input v-model="captcha" clearable placeholder="填写验证码"></el-input>
            <el-button type="danger" v-if="countTime === '00'" @click="() => registerClick()">重新获取</el-button>
            <el-button disabled v-if="countTime !== '00'">00:{{ countTime }}</el-button>
          </div>
        </div>

        <div class="btns">
          <el-button type="danger" @click="nextStep">下一步</el-button>
        </div>
      </div>
    </div>
    <!-- 昵称 -->
    <div v-if="getNickname" style="text-align:center;margin-top: 15px;">
      <span style="font-size: 12px;">取个昵称，让大家记住您</span>
      <div class="from">
        <div class="input-items">
          <div class="input-box">
            <div class="l-icon flex-c-c">
              <i class="el-icon-user"></i>
            </div>
            <el-input v-model="nickname" clearable placeholder="请输入昵称"></el-input>
          </div>
        </div>

        <div class="btns">
          <el-button type="danger" @click="finishRegister">开启音乐之旅</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { sendCaptcha, verifyCaptcha, checkPhone, register, initNickname } from "../../api/user";
export default {
  props: {
    dialogVisible: Boolean
  },
  data() {
    return {
      phone: "",
      password: "",
      nickname: "",
      captcha: "",
      loading: false,
      showRegister: true,
      verifyCaptcha: false,
      getNickname: false,
      timer: null,
      countTime: -1
    };
  },
  methods: {
    // 一分钟倒计时
    countDown() {
      this.countTime = 59;
      this.timer = setInterval(() => {
        if (this.countTime === "00") {
          clearInterval(this.timer);
          this.timer = null;
        } else {
          this.countTime--;
          if (this.countTime < 10) {
            this.countTime = "0" + this.countTime;
          }
        }
      }, 1000);
    },
    registerClick() {
      this.countDown();
      this.showRegister = false;
      this.verifyCaptcha = true;
      sendCaptcha(this.phone).then(res => {
        console.log(res.data);
      });
    },
    async nextStep() {
      if (!this.captcha.length) {
        this.$message({
          type: "info",
          center: true,
          message: "请填写验证码"
        });
      } else {
        console.log(this.phone);
        console.log(this.captcha);
        try {
          let verifyRes = await verifyCaptcha(this.phone, this.captcha);
          console.log(verifyRes, "verifyRes");
          if (verifyRes.data === true) {
            //验证码正确
            checkPhone(this.phone).then(res => {
              if (res.exist === 1) {
                this.$message({
                  message: "该手机号已注册,请返回登录",
                  center: true,
                  type: "info"
                });
              } else {
                this.verifyCaptcha = false;
                this.getNickname = true;
                this.$emit("input", true);
              }
            });
          } else {
            //验证码错误
            this.$message({
              message: "验证码错误",
              center: true,
              type: "error"
            });
          }
        } catch (error) {
          console.log("出错了");
        }
      }
    },
    finishRegister() {
      register(this.phone, this.password, this.captcha, this.nickname).then(res => {
        if (res.code === 505) {
          this.$message({
            type: "error",
            center: true,
            message: res.message
          });
        } else {
          console.log("注册成功");

          initNickname(this.nickname);
          let res = {
            profile: {
              nickname: this.nickname,
              avatarUrl: "../../assets/images/initAvatar.png"
            }
          };
          this.$store.dispatch("SET_LOGIN", res);
          this.$emit("changeVisible", false);
        }
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
.from {
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
</style>
