<template>
    <div class="konva-image-edit">
        <konva-image-edit-container
            ref="edit"
            :width="width"
            :height="height - 160"
            :image-url="imageUrl"
            :lineColor="lineColor"
            :lineWidth="lineWidth"
            :drawMode="drawMode"
            :canDraw="toolType == 'brush' || toolType == 'eraser'"
        ></konva-image-edit-container>

        <konva-image-edit-tool-bar
            :type="toolType"
            @changeToolType="changeToolType"
            @changeLineColor="changeLineColor"
            @changeLineWidth="changeLineWidth"
            @changeDrawMode="changeDrawMode"
            @undo="undo"
        ></konva-image-edit-tool-bar>
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
        return {
            toolType: "main",
            lineColor: "red",
            lineWidth: 2,
            drawMode: "brush",
        };
    },

    mounted() {},

    methods: {
        changeToolType(type) {
            this.toolType = type;
        },
        changeLineColor(color) {
            this.lineColor = color;
        },
        changeLineWidth(width) {
            this.lineWidth = width;
        },
        changeDrawMode(mode) {
            this.drawMode = mode;
        },
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
