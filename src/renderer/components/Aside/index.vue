<template>
  <div class="wrap">
    <logo />
    <menus />
  </div>
</template>
<script>
import Logo from "./Logo";
import Menus from "./Menu";
export default {
  components: {
    Logo,
    Menus
  }
};
</script>
<style lang="scss" scoped>
.wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
