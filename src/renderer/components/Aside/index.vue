<template>
  <div class="wrap">
    <div style="margin-top: 20px;">
      <menus />
    </div>
  </div>
</template>
<script>
import Menus from "./Menu";
export default {
  components: {
    Menus
  }
};
</script>
<style lang="scss" scoped>
.wrap {
  background: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
