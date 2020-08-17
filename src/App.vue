<template>
    <v-ons-page modifier="image_edit">
        <v-ons-toolbar>
            <div class="left">
                返回
            </div>
            <div class="center">
                图片批改
            </div>
            <div class="right">
                保存
            </div>
        </v-ons-toolbar>

        <div class="page__content" id="page__content">
            <div class="image-edit-content" id="image-edit-content">
                <konva-image-edit v-if="width > 0 && height > 0" :width="width" :height="height" :image-url="imageUrl"></konva-image-edit>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
import KonvaImageEdit from "@/konva-image-edit/index.vue";

export default {
    components: {
        KonvaImageEdit,
    },

    data() {
        return {
            width: 0,
            height: 0,
            imageUrl: 'https://oral3-test.oss-cn-hangzhou.aliyuncs.com/80222180102/9d990a71-525f-5050-ae15-ddc7c0dc5576.jpeg'
        };
    },

    created() {
        if (this.$ons.platform.isIPhoneX()) {
            document.documentElement.setAttribute("onsflag-iphonex-portrait", "");
        }
    },

    mounted() {
        const content = document.querySelector("#image-edit-content");
        this.width = content.offsetWidth;
        this.height = content.offsetHeight;
    },
};
</script>

<style lang="scss" scoped>
::v-deep .page--image_edit__background {
}

::v-deep .page--image_edit__content {
    background-color: #000 !important;
    display: flex;

    .image-edit-content {
        height: 100%;
        width: 100%;
        display: flex;
        position: relative;
    }
}

::v-deep .toolbar {
    background: #71acf8;

    .toolbar__left,
    .toolbar__center,
    .toolbar__right {
        color: #fff;
        text-align: center;
    }
}
</style>
