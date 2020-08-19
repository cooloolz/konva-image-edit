<template>
    <div class="konva-image-edit-tool-bar">
        <!-- 主要按钮部分 -->
        <div class="konva-image-edit-tool-bar-action-part" v-show="true">
            <div class="top-action-btns">
                <div class="action-btn">
                    画笔
                </div>
                <div class="action-btn">
                    橡皮檫
                </div>
                <div class="action-btn">
                    文本
                </div>
            </div>
            <div class="bottom-action-btns">
                <div class="action-btn">
                    撤回
                </div>
                <div class="action-btn audio">
                    按住说话
                </div>
                <div class="action-btn">
                    完成
                </div>
            </div>
        </div>

        <!-- 颜色以及线宽部分 -->
        <div class="konva-image-edit-tool-bar-colors-and-width" v-show="false">
            <div class="top-action-btns">
                <div class="action-btn">
                    关闭
                </div>
                <div class="action-btn">
                    <div class="action-btn-tabs">
                        <div :class="['action-btn-tab', activeTab === 'colors' ? 'active' : '']">颜色</div>
                        <div :class="['action-btn-tab', activeTab === 'width' ? 'active' : '']">粗细</div>
                    </div>
                </div>
                <div class="action-btn">
                    确认
                </div>
            </div>
            <div class="bottom-colors" v-show="activeTab === 'colors'">
                <div
                    v-for="(color, index) in colors"
                    :key="index"
                    :class="['color', activeColor === color ? 'active' : '']"
                    :style="{ backgroundColor: color }"
                ></div>
            </div>
            <div class="bottom-width" v-show="activeTab === 'width'">
                <span class="small-round"></span>
                <div class="slider">
                    <span class="slider-round"></span>
                </div>
                <span class="big-round"></span>
            </div>
        </div>

        <!-- TODO: 文本弹出框部分 -->
    </div>
</template>

<script>
export default {
    data() {
        return {
            activeTab: "width",
            colors: ["#F2F2F2", "#2C2C2C", "#F85251", "#FEC314", "#12C261", "#19ADFF", "#8569EC"],
            activeColor: "#F85251",
            sliderValue: 2,
        };
    },
};
</script>

<style lang="scss" scoped>
.konva-image-edit-tool-bar {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;

    .konva-image-edit-tool-bar-action-part {
        display: flex;
        flex: 1;
        flex-flow: column nowrap;

        .top-action-btns {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: space-around;
            color: #fff;
            padding: 15px 0;

            .action-btn {
                font-weight: 400;
                font-size: 10px;
            }
        }

        .bottom-action-btns {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: space-around;
            color: #fff;
            padding: 15px 0;

            .action-btn {
                flex: 1;
                text-align: center;
                font-weight: 400;
                font-size: 14px;
            }

            .audio {
                background-color: #457ad0;
                flex: 3;
                padding: 10px 0;
                border-radius: 100px;
            }
        }
    }

    .konva-image-edit-tool-bar-colors-and-width {
        display: flex;
        flex: 1;
        flex-flow: column nowrap;

        .top-action-btns {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: space-around;
            color: #fff;
            padding: 15px 0;

            .action-btn {
                font-weight: 400;
                font-size: 10px;

                .action-btn-tabs {
                    display: flex;
                    flex-flow: row nowrap;
                    width: 130px;
                    height: 30px;
                    border-radius: 5px;
                    border: 1px solid #457ad0;

                    .action-btn-tab {
                        flex: 1;
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 400;

                        &.active {
                            background-color: #457ad0;
                        }
                    }
                }
            }
        }

        .bottom-colors {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: space-around;
            .color {
                overflow: hidden;
                border-radius: 20px;
                width: 20px;
                height: 20px;

                &.active {
                    box-shadow: 0px 0px 0 4px #fff;
                }
            }
        }

        .bottom-width {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;

            .small-round,
            .big-round {
                width: 12px;
                height: 12px;
                border-radius: 12px;
                box-shadow: 0px 0px 0 1px #fff;
                background-color: #979797;

                &.big-round {
                    width: 24px;
                    height: 24px;
                    border-radius: 24px;
                }
            }

            .slider {
                border-bottom: 10px solid #d6d6d6;
                border-left: 180px solid transparent;
                position: relative;
                margin-bottom: 12px;
                margin-left: 25px;
                margin-right: 25px;
                .slider-round {
                    position: absolute;
                    bottom: -20px;
                    left: -180px;
                    width: 20px;
                    height: 20px;
                    border-radius: 36px;
                    background-color: #fff;
                }
            }
        }
    }
}
</style>
