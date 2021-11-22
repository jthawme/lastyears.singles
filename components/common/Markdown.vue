<template>
  <div v-html="$md.render(content)"></div>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
span p {
  display: inline;
}
</style>
