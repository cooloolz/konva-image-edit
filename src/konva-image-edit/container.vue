<template>
    <div class="konva-image-edit-container" id="konvaImageEditContainer">
        <v-ons-modal :visible="show" @click="onClickConfirmText(false)">
            <div class="content" @click.stop="">
                <div class="top">
                    <span @click="onClickConfirmText(false)">取消</span>
                    <van-button type="primary" color="#5daeff" @click="onClickConfirmText(true)">完成</van-button>
                </div>
                <div class="center" :style="{ color: activeColor }">{{ text ? text : "请输入您想发送的文字" }}</div>
                <div class="bottom-colors">
                    <div
                        v-for="(color, index) in colors"
                        :key="index"
                        :class="['color', activeColor === color ? 'active' : '']"
                        :style="{ backgroundColor: color }"
                        @click="changeTextColor(color)"
                    ></div>
                </div>
                <van-field
                    ref="field"
                    v-model="text"
                    rows="1"
                    autosize
                    clearable
                    type="textarea"
                    placeholder="请输入您想发送的文字"
                />
            </div>
        </v-ons-modal>
        <!-- <van-popup v-model="show" get-container="#image-edit-content">
        </van-popup> -->
    </div>
</template>

<script>
import Konva from "konva";
import "gifler";
import Hammer from "hammerjs";
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
            default: false,
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
        drawMode: {
            // 画笔是brush，橡皮檫是Eraser
            type: String,
            default: "brush",
        },
    },

    data() {
        return {
            hammer: null,
            stage: null,
            imageLayer: null,
            backImage: null,
            drawLayer: null,
            markLayer: null,
            zoomAndPan: {
                scale: 1,
                lastScale: 1,
            },
            lastPosition: {
                x: 0,
                y: 0,
            },
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
            hammerPanDisable: false,
            isDraw: false,
            lastDrawPoint: null,
            lastDrawLine: null,
            show: false,
            text: "",
            textObjs: [],
            activeTextObj: "",
            activeTab: "colors",
            activeColor: "#F85251",
            colors: ["#F2F2F2", "#2C2C2C", "#F85251", "#FEC314", "#12C261", "#19ADFF", "#8569EC"],
            operate: [],
        };
    },
    computed: {
        middlePoint() {
            return {
                x: this.width / 2,
                y: this.height / 2,
            };
        },
    },

    mounted() {
        this.initStage();
        this.initHammer();
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

            this.stage.on("mousedown touchstart", function(event) {
                _this.stageOnMousedownOrTouchstart(event);
            });
            this.stage.on("mouseup touchend", function(event) {
                _this.stageOnMouseupOrTouchend(event);
            });
            this.stage.on("mousemove touchmove", function(event) {
                _this.stageOnMousemoveOrTouchmove(event);
            });
            this.stage.on("click tap", function(e) {
                console.log("e", e.target);
                // if click on empty area - remove all transformers
                if (e.target == _this.stage) {
                    _this.stage.find("Transformer").destroy();
                    _this.markLayer.draw();
                    return;
                }
                // do nothing if clicked NOT on our rectangles
                if (!e.target.hasName("text")) {
                    _this.stage.find("Transformer").destroy();
                    _this.markLayer.draw();
                    return;
                }
                // remove old transformers
                // TODO: we can skip it if current rect is already selected
                _this.stage.find("Transformer").destroy();

                // create new transformer
                const tr = new Konva.Transformer({
                    centeredScaling: true,
                    keepRatio: true,
                    enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
                    boundBoxFunc: function(oldBoundBox, newBoundBox) {
                        if (Math.abs(newBoundBox.width) > _this.width || Math.abs(newBoundBox.height) <= 20) {
                            return oldBoundBox;
                        }
                        return newBoundBox;
                    },
                });
                _this.markLayer.add(tr);
                tr.attachTo(e.target);
                _this.markLayer.draw();
            });
        },
        /**
         * 给canvas添加手势
         *
         * @memberof ImageExamine
         */
        initHammer() {
            const _this = this;
            this.hammer = new Hammer(document.querySelector("#konvaImageEditContainer"));
            this.hammer.get("pinch").set({ enable: true, direction: Hammer.DIRECTION_ALL });
            this.hammer.get("pan").set({ enable: true, direction: Hammer.DIRECTION_ALL });
            this.hammer.on("pinchmove", (e) => {
                if (_this.canDraw) return;
                _this.hammerPinchMove(e);
            });
            this.hammer.on("pinchend", (e) => {
                if (_this.canDraw) return;
                _this.hammerPinchEnd(e);
            });
            this.hammer.on("panstart", (e) => {
                if (_this.canDraw) return;
                _this.hammerPanStart(e);
            });
            this.hammer.on("panmove", (e) => {
                if (_this.canDraw) return;
                _this.hammerPanMove(e);
            });
            this.hammer.on("panend", (e) => {
                if (_this.canDraw) return;
                _this.hammerPanEnd(e);
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
         * @description: 初始化音频图标
         * @param {type}
         * @return {type}
         */
        initIcons() {
            const _this = this;
            for (let i = 0; i < this.icons.length; i++) {
                //为音频创建静态图标
                Konva.Image.fromURL(audioIcon, function(icon) {
                    icon.on("click tap", function() {
                        _this.audioIconOnClickOrTap(icon, i);
                    });
                    icon.on("mousedown touchstart", function(event) {
                        _this.hammerPanDisable = true;
                        event.cancelBubble = true;
                    });
                    icon.on("mouseup touchend", function(event) {
                        _this.hammerPanDisable = false;
                    });
                    icon.on("dragend", function(e) {
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
                    function(ctx, frame) {
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
         * @description: 双指移动
         * @param {*} e
         */
        hammerPinchMove(e) {
            // console.log("ImageExamine -> _hammerPinchMove -> ev", ev);

            this.zoomAndPan.scale = e.scale;
            this.zoomAndPan.deltaX = e.deltaX;
            this.zoomAndPan.deltaY = e.deltaY;
            const newScale = this.zoomAndPan.scale * this.zoomAndPan.lastScale;
            this.stage.scale({
                x: newScale,
                y: newScale,
            });
            this.stage.position({
                x: this.lastPosition.x + e.center.x * (1 - e.scale),
                y: this.lastPosition.y + e.center.y * (1 - e.scale),
            });
            this.stage.draw();
            //console.log("pinchmove", newScale, e.deltaX, e.deltaY, this.stage.x(), this.stage.y());
        },
        /**
         * @description: 双指结束
         * @param {*} e
         */
        hammerPinchEnd(e) {
            // 把这次最后的一个比例记录下来
            this.zoomAndPan.lastScale = this.stage.scaleX();
            this.lastPosition = {
                x: this.stage.x(),
                y: this.stage.y(),
            };
            console.log("ImageExamine -> _hammerPinchEnd -> e", this.zoomAndPan.lastScale);
        },
        /**
         * @description: 拖动开始
         * @param {*} e
         */
        hammerPanStart(e) {
            if (this.hammerPanDisable) return;
            console.log("panstart", e.center);
        },
        /**
         * @description: 拖动
         * @param {*} e
         */
        hammerPanMove(e) {
            if (this.hammerPanDisable) return;
            this.stage.position({
                x: this.lastPosition.x + e.deltaX,
                y: this.lastPosition.y + e.deltaY,
            });
            this.stage.draw();
            //console.log("panmove", e.deltaX, e.deltaY);
        },
        /**
         * @description: 拖动结束
         * @param {*} e
         */
        hammerPanEnd(e) {
            if (this.hammerPanDisable) return;
            this.lastPosition = {
                x: this.stage.x(),
                y: this.stage.y(),
            };
            console.log("ImageExamine -> _hammerPanEnd -> e", this.stage.x(), this.stage.y());
        },
        /**
         * @description: 监听鼠标按下或者触摸开始
         * @param {type}
         * @return {type}
         */
        stageOnMousedownOrTouchstart(event) {
            if (!this.canDraw) return;
            this.startDraw();
        },
        /**
         * @description: 监听鼠标放开或者触摸结束
         * @param {type}
         * @return {type}
         */
        stageOnMouseupOrTouchend(event) {
            if (!this.canDraw) return;
            this.endDraw();
        },
        /**
         * @description: 监听鼠标拖动或者触摸过程
         * @param {type}
         * @return {type}
         */
        stageOnMousemoveOrTouchmove(event) {
            if (!this.canDraw) return;
            this.moveDraw();
        },
        // ======================================== 画笔部分 start
        /**
         * @description: 开始绘画
         * @param {type}
         * @return {type}
         */
        startDraw() {
            if (!this.canDraw) return;
            this.isDraw = true;
            this.lastDrawPoint = this.stage.getPointerPosition();
            this.lastDrawLine = new Konva.Line({
                tension: 1,
                stroke: this.lineColor,
                strokeWidth: this.lineWidth,
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
            this.operate.push("line");
        },
        /**
         * @description: 撤回笔画
         * @param {type}
         * @return {type}
         */
        undo() {
            const lastOperate = this.operate[this.operate.length - 1];
            let children = [];
            if (lastOperate == "line") {
                children = this.drawLayer.getChildren();
                if (children.length > 0) {
                    children[children.length - 1].destroy();
                    this.drawLayer.draw();
                    this.operate.pop();
                }
            } else if (lastOperate == "text") {
                this.stage.find("Transformer").destroy();
                children = this.markLayer.getChildren();
                if (children.length > 0) {
                    children[children.length - 1].destroy();
                    this.markLayer.draw();
                    this.operate.pop();
                }
            }
        },
        onPinchin(e) {
            console.log("pinchin", e.scale);
        },
        // ======================================== 画笔部分 end
        // ======================================== 音频部分 start
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
                    _this.onStop(i);
                    _this.audioGif.animators[i].stop();
                    let imageObj = new Image();
                    imageObj.src = element.isPlaying ? audioPlayIcon : audioIcon;
                    imageObj.onload = function() {
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
            console.log("play", index);
        },
        onStop(index) {},
        // ======================================== 音频部分 end

        // ======================================== 文字部分 start
        /**
         * @description: 新建一个文本对象
         * @param {type}
         * @return {type}
         */
        newText() {
            const _this = this;
            const simpleText = new Konva.Text({
                x: Math.ceil(Math.random() * 100),
                y: Math.ceil(Math.random() * 400),
                name: "text",
                text: "请点击输入文字",
                fontSize: 30,
                fontFamily: "Calibri",
                fill: _this.activeColor,
                draggable: true,
            });

            simpleText.on("click tap", function(event) {
                _this.clickText(simpleText);
            });
            simpleText.on("mousedown touchstart", function(event) {
                _this.hammerPanDisable = true;
                event.cancelBubble = true;
            });
            simpleText.on("mouseup touchend", function(event) {
                _this.hammerPanDisable = false;
            });
            simpleText.on("transform", function() {
                // simpleText.setAttrs({
                //     width: simpleText.width() * simpleText.scaleX(),
                // });
            });
            simpleText.on("transformstart", function() {
                _this.hammerPanDisable = true;
            });

            simpleText.on("transformend", function() {
                _this.hammerPanDisable = false;
            });

            this.operate.push("text");
            this.textObjs.push(simpleText);
            this.markLayer.add(simpleText);
            this.markLayer.batchDraw();
        },
        /**
         * @description: 点击文字事件
         * @param {type}
         * @return {type}
         */
        clickText(textObj) {
            this.activeTextObj = textObj;
            this.show = true;
            this.text = this.activeTextObj.text() == "请点击输入文字" ? "" : this.activeTextObj.text();
            this.$refs.field.focus();
            this.activeTextObj.hide();
            this.markLayer.batchDraw();
        },
        /**
         * @description: 确定文字
         * @param {type}
         * @return {type}
         */
        onClickConfirmText(save) {
            if (save && this.text) this.activeTextObj.text(this.text);
            this.show = false;
            this.activeTextObj.show();
            this.markLayer.batchDraw();
        },
        /**
         * @description: 改变文字颜色
         * @param {type}
         * @return {type}
         */
        changeTextColor(color) {
            this.activeColor = color;
            this.activeTextObj.fill(color);
            this.markLayer.batchDraw();
        },
        // ======================================== 文字部分 end
    },
};
</script>
<style lang="scss" scoped>
::v-deep .modal__content {
    vertical-align: top;
    .content {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        color: #333333;
        .top {
            box-sizing: border-box;
            width: 100%;
            padding: 40px 20px;
            color: #ffffff;
            font-size: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .center {
            flex: 1;
            box-sizing: border-box;
            width: 100%;
            margin: 40px 0;
            color: #ffffff;
            font-size: 50px;
            line-height: 50px;
            padding: 40px;
            text-align: left;
        }
        .van-cell {
            //background: #ffffff00;
            margin: 40px 0;
            color: #ffffff;
            font-size: 30px;
            line-height: 30px;
            padding: 20px;
        }
        .bottom-colors {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            margin-top: 50px;
            margin-bottom: 50px;
            .color {
                overflow: hidden;
                border-radius: 20px;
                width: 40px;
                height: 40px;

                &.active {
                    box-shadow: 0px 0px 0 10px #fff;
                }
            }
        }
    }
}
</style>
