<script lang="ts" setup>
const props = defineProps({ visible: { default: false }, closable: { default: true } });
const emit = defineEmits(["update:visible"]);

function close() {
    if (!props.closable) return;
    emit("update:visible", false);
}
</script>

<template>
    <div class="modal-wrapper" v-if="props.visible" @click="close">
        <div class="modal" @click.stop="">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-wrapper {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;

    .modal {
        background-color: white;
        padding: 5px;
        border: 1px solid black;
    }
}
</style>
