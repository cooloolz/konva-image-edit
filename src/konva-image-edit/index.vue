<template>
    <div class="konva-image-edit">
        <konva-image-edit-container
            ref="edit"
            :width="width"
            :height="height - 160"
            :image-url="imageUrl"
        ></konva-image-edit-container>

        <konva-image-edit-tool-bar @undo="undo"></konva-image-edit-tool-bar>
    </div>
</template>

<script>
import KonvaImageEditContainer from "@/konva-image-edit/container";
import KonvaImageEditToolBar from "@/konva-image-edit/tool-bar";

export default {
    components: {
        KonvaImageEditContainer,
        KonvaImageEditToolBar,
    },

    props: {
        width: {
            requried: true,
            type: Number,
        },
        height: {
            requried: true,
            type: Number,
        },
        imageUrl: {
            required: true,
            type: String,
        },
    },

    data() {
        return {};
    },

    mounted() {},

    methods: {
        undo() {
            this.$refs.edit.undo();
        },
    },
};
</script>

<style lang="scss" scoped>
.konva-image-edit {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
}
</style>
