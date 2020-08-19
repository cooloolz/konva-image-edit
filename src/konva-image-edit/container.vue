<template>
    <div class="konva-image-edit-container" id="konvaImageEditContainer">
        <van-popup v-model="show" get-container="body">
            <input type="text" v-model="text" />
            <button @click="onClickConfirmText">确定</button>
        </van-popup>
    </div>
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
            isDraw: false,
            drawMode: "brush", // 画笔是brush，橡皮檫是Eraser
            lastDrawPoint: null,
            lastDrawLine: null,
            show: false,
            text: "",
            activeTextObj: "",
        };
    },

    mounted() {
        this.initStage();
        this.initLayer();
        this.initImageLayerBackImage();
        this.initText();
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
        // ======================================== 画笔部分 start
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
        // ======================================== 画笔部分 end

        // ======================================== 文字部分 start
        /**
         * @description: 初始化一个文字做测试
         * @param {type}
         * @return {type}
         */
        initText() {
            const _this = this;

            var simpleText = new Konva.Text({
                x: 100,
                y: 100,
                text: "请点击输入文字",
                fontSize: 30,
                fontFamily: "Calibri",
                fill: "green",
            });

            simpleText.on("click tap", function(event) {
                _this.clickText(event);
            });

            this.markLayer.add(simpleText);
            this.markLayer.batchDraw();
        },
        /**
         * @description: 点击文字事件
         * @param {type}
         * @return {type}
         */
        clickText(event) {
            console.log(event);
            this.activeTextObj = event.currentTarget;
            this.show = true;
        },
        /**
         * @description: 确定文字
         * @param {type}
         * @return {type}
         */
        onClickConfirmText() {
            this.activeTextObj.text(this.text);
            this.markLayer.batchDraw();
            this.show = false;
        },
        // ======================================== 文字部分 end
    },
};
</script>
