<template>
  <div>
    <div class="avatar-div">
      <div class="avatar">
        <img src="../../assets/images/logo.png" />
      </div>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style lang="scss" scoped>
.avatar-div {
  -webkit-app-region: drag;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .avatar {
    width: 100px;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}
</style>
