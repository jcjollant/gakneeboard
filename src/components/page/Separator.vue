<template>
    <div class="separator">{{  name  }}</div>
</template>

<script setup>
defineProps({
    name: String
})
</script>

<style scoped>
.separator {
  display: flex;
  color: var(--bg);

  &:before,
  &:after {
    content: "";
    flex: 1;
    height: 1px;
    margin: 0 1em;
    background: lightblue;
  }

  align-items: center;
  padding-top: 5px;
  margin: 0;

}

</style>