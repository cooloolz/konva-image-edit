<template>
    <div class="konva-image-edit-container" id="konvaImageEditContainer"></div>
</template>

<script>
import konva from "konva";
import "gifler";

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
            // 音频图标坐标信息数组
            icons: [
                {
                    x: 80,
                    y: 100,
                    isPlaying: false,
                    src: "1.mp4",
                },
                {
                    x: 190,
                    y: 200,
                    isPlaying: false,
                    src: "2.mp4",
                },
            ],
            audioImages: [], //静态音频图标数组
            audioGif: {
                //gif音频图标
                animators: [], //gif动画对象数组
                audioPlayCanvas: [], //gif节点数组
            },
            isDraw: false,
            drawMode: "brush", // 画笔是brush，橡皮檫是Eraser
            lastDrawPoint: null,
            lastDrawLine: null,
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
            for (let i = 0; i < this.icons.length; i++) {
                //为音频创建静态图标
                Konva.Image.fromURL(audioIcon, function (icon) {
                    icon.on("click tap", function () {
                        _this.audioIconOnClickOrTap(icon, i);
                    });
                    icon.on("mousedown touchstart", function (event) {
                        event.cancelBubble = true;
                    });
                    icon.on("dragend", function (e) {
                        const pos = icon.position();
                        const newpos = _this.icons[i];
                        _this.icons[i] = { ...newpos, x: pos.x, y: pos.y };
                    });
                    icon.setAttrs({
                        x: _this.icons[i].x,
                        y: _this.icons[i].y,
                        width: 40,
                        height: 40,
                        draggable: true,
                    });
                    _this.audioImages[i] = icon;
                    _this.markLayer.add(icon);
                    _this.markLayer.draw();
                });
                //为音频创建gif图标
                const canvas = document.createElement("canvas");
                let animator = null;
                gifler(audioPlayIcon).frames(
                    canvas,
                    function (ctx, frame) {
                        if (!animator) {
                            this.stop();
                            this.reset();
                        }
                        animator = this;
                        _this.audioGif.animators[i] = animator;
                        ctx.drawImage(frame.buffer, frame.x, frame.y);
                        _this.markLayer.draw();
                        //console.log("frame", frame.delay, _this.animator.width, _this.animator.height);
                    },
                    true
                );
                _this.audioGif.audioPlayCanvas.push(canvas);
            }
        },
        /**
         * @description: 监听鼠标按下或者触摸开始
         * @param {type}
         * @return {type}
         */
        stageOnMousedownOrTouchstart(event) {
            this.startDraw();
        },
        /**
         * @description: 监听鼠标放开或者触摸结束
         * @param {type}
         * @return {type}
         */
        stageOnMouseupOrTouchend(event) {
            this.endDraw();
        },
        /**
         * @description: 监听鼠标拖动或者触摸过程
         * @param {type}
         * @return {type}
         */
        stageOnMousemoveOrTouchmove(event) {
            this.moveDraw();
        },
        // 画笔部分 start
        /**
         * @description: 开始绘画
         * @param {type}
         * @return {type}
         */
        startDraw() {
            this.isDraw = true;
            this.lastDrawPoint = this.stage.getPointerPosition();
            this.lastDrawLine = new Konva.Line({
                tension: 1,
                stroke: "#df4b26",
                strokeWidth: 2,
                lineCap: "round",
                lineJoin: "round",
                globalCompositeOperation: this.drawMode === "brush" ? "source-over" : "destination-out",
                points: [this.lastDrawPoint.x, this.lastDrawPoint.y],
            });
            this.drawLayer.add(this.lastDrawLine);
        },
        /**
         * @description: 画笔中
         * @param {type}
         * @return {type}
         */
        moveDraw() {
            if (!this.isDraw) return false;
            this.lastDrawPoint = this.stage.getPointerPosition();
            const newPoints = this.lastDrawLine.points().concat([this.lastDrawPoint.x, this.lastDrawPoint.y]);
            this.lastDrawLine.points(newPoints);
            this.drawLayer.batchDraw();
        },
        /**
         * @description: 结束画笔
         * @param {type}
         * @return {type}
         */
        endDraw() {
            this.isDraw = false;
        },
        // 画笔部分 end
        // 音频部分 start
        /**
         * @description: 监听音频图标鼠标按下或者触摸开始
         * @param {type}
         * @return {type}
         */
        audioIconOnClickOrTap(item, index) {
            const _this = this;
            this.icons.forEach((element, i) => {
                element.isPlaying = i == index && !element.isPlaying ? true : false;
                if (element.isPlaying) {
                    //播放
                    _this.audioGif.animators[i].reset();
                    _this.audioGif.animators[i].start();
                    _this.audioImages[i].setAttr("image", _this.audioGif.audioPlayCanvas[i]);
                    _this.audioImages[i].draw();
                    _this.onPlay(i);
                } else {
                    //停播
                    _this.audioGif.animators[i].stop();
                    let imageObj = new Image();
                    imageObj.src = element.isPlaying ? audioPlayIcon : audioIcon;
                    imageObj.onload = function () {
                        _this.audioImages[i].setAttr("image", imageObj);
                        _this.audioImages[i].draw();
                    };
                }
                return element;
            });
        },
        /**
         * @description: 播放音频
         * @param {type}
         * @return {type}
         */
        onPlay(index) {
            console.log("play", index, JSON.parse(JSON.stringify(this.icons[index])));
        },
        // 音频部分
    },
};
</script>
