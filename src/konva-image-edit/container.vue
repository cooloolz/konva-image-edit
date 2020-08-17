<template>
    <div class="konva-image-edit-container" id="konvaImageEditContainer"></div>
</template>

<script>
import konva from "konva";

const audioIcon = require("@/image-editor/audio.png");
const audioPlayIcon = require("@/image-editor/audio-on.gif");
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
        canDraw: {
            // 可画
            type: Boolean,
            default: true,
        },
        lineColor: {
            // 画笔颜色
            type: String,
            default: "red",
        },
        lineWidth: {
            // 画笔宽度
            type: Number,
            default: 2,
        },
    },

    data() {
        return {
            stage: null,
            imageLayer: null,
            backImage: null,
            drawLayer: null,
            markLayer: null,
            line: null,
            // 是否处于绘制状态
            canvasMoveUse: false,
            // 储存坐标信息
            icons: [
                {
                    x: 80,
                    y: 100,
                    isPlaying: false,
                },
                {
                    x: 190,
                    y: 200,
                    isPlaying: false,
                },
            ],
        };
    },

    mounted() {
        this.initStage();
        this.initLayer();
        this.initImageLayerBackImage();
        this.initIcons();
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
            this.stage.on("mousedown touchstart", function (event) {
                _this.stageOnMousedownOrTouchstart(event);
            });
            this.stage.on("mouseup touchend", function (event) {
                _this.stageOnMouseupOrTouchend(event);
            });
            this.stage.on("mousemove touchmove", function (event) {
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
            imageObj.onload = function () {
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
         * @description: 初始化音频图标
         * @param {type}
         * @return {type}
         */
        initIcons() {
            const _this = this;
            this.icons.forEach((item, index) => {
                const imageObj = new Image();
                imageObj.onload = function () {
                    const icon = new Konva.Image({
                        image: imageObj,
                        x: item.x,
                        y: item.y,
                        width: 40,
                        height: 40,
                        draggable: true,
                    });
                    // add cursor styling
                    icon.on("click", function () {
                        console.log("click");
                        event.cancelBubble = true;
                    });
                    icon.on("mousedown touchstart", function (event) {
                        console.log("touchstart", index, icon);
                        event.cancelBubble = true;
                        icon.attrs.image.src = audioPlayIcon;
                        console.log("image", icon.attrs.image.src);
                    });
                    icon.on("mouseover", function () {
                        document.body.style.cursor = "pointer";
                    });
                    icon.on("mouseout", function () {
                        document.body.style.cursor = "default";
                    });
                    _this.markLayer.add(icon);
                    _this.markLayer.batchDraw();
                };
                imageObj.src = audioIcon;
            });
        },
        /**
         * @description: 监听鼠标按下或者触摸开始
         * @param {type}
         * @return {type}
         */
        stageOnMousedownOrTouchstart(event) {
            if (this.canDraw) {
                this.canvasMoveUse = true;
                const pos = this.stage.getPointerPosition();
                this.line = new Konva.Line({
                    stroke: "#df4b26",
                    strokeWidth: 5,
                    globalCompositeOperation: "source-over",
                    points: [pos.x, pos.y],
                });
                this.drawLayer.add(this.line);
            }
        },
        /**
         * @description: 监听鼠标放开或者触摸结束
         * @param {type}
         * @return {type}
         */
        stageOnMouseupOrTouchend(event) {
            if (this.canDraw) {
                this.canvasMoveUse = false;
                this.line = null;
            }
        },
        /**
         * @description: 监听鼠标拖动或者触摸过程
         * @param {type}
         * @return {type}
         */
        stageOnMousemoveOrTouchmove(event) {
            if (this.canvasMoveUse) {
                // 只有允许移动时调用

                const pos = this.stage.getPointerPosition();
                var newPoints = this.line.points().concat([pos.x, pos.y]);
                this.line.points(newPoints);
                this.drawLayer.batchDraw();
            }
        },
    },
};
</script>
