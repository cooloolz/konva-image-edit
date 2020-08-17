<template>
    <div class="konva-image-edit-container" id="konvaImageEditContainer"></div>
</template>

<script>
import konva from "konva";

export default {
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
            stage: null,
            imageLayer: null,
            backImage: null,
            drawLayer: null,
            markLayer: null,
        };
    },

    mounted() {
        this.initStage();
        this.initLayer();
        this.initImageLayerBackImage();
    },

    methods: {
        /**
         * @description: 初始化
         * @param {type}
         * @return {type}
         */
        initStage() {
            const _this = this;
            this.stage = new Konva.Stage({
                container: "konvaImageEditContainer",
                width: this.width,
                height: this.height,
            });
            this.stage.on("mousedown touchstart", function(event) {
                _this.stageOnMousedownOrTouchstart(event);
            });
            this.stage.on("mouseup touchend", function(event) {
                _this.stageOnMouseupOrTouchend(event);
            });
            this.stage.on("mousemove touchmove", function(event) {
                _this.stageOnMousemoveOrTouchmove(event);
            });
        },
        /**
         * @description: 初始化层,初始化三层layer，最底层为图片，中间为自由绘图，第三层为音频坐标或者文字
         * @param {type}
         * @return {type}
         */
        initLayer() {
            this.imageLayer = new Konva.Layer();
            this.drawLayer = new Konva.Layer();
            this.markLayer = new Konva.Layer();
            this.stage.add(this.imageLayer);
            this.stage.add(this.drawLayer);
            this.stage.add(this.markLayer);
        },
        /**
         * @description: 初始化图片层背景图撑满屏
         * @param {type}
         * @return {type}
         */
        initImageLayerBackImage() {
            const _this = this;
            const imageObj = new Image();
            imageObj.onload = function() {
                _this.backImage = new Konva.Image({
                    x: 0,
                    y: 0,
                    image: imageObj,
                    width: _this.width,
                    height: _this.height,
                });
                _this.imageLayer.add(_this.backImage);
                _this.imageLayer.batchDraw();
            };
            imageObj.src = this.imageUrl;
        },
        /**
         * @description: 监听鼠标按下或者触摸开始
         * @param {type}
         * @return {type}
         */
        stageOnMousedownOrTouchstart(event) {},
        /**
         * @description: 监听鼠标放开或者触摸结束
         * @param {type}
         * @return {type}
         */
        stageOnMouseupOrTouchend(event) {},
        /**
         * @description: 监听鼠标拖动或者触摸过程
         * @param {type}
         * @return {type}
         */
        stageOnMousemoveOrTouchmove(event) {},
    },
};
</script>
