<template>
    <div class="horizontal-stack-container">
        <slot></slot>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.horizontal-stack-container {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    flex-wrap: nowrap;
}
</style>