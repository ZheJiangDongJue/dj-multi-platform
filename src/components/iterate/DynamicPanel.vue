<template>
    <div class="dynamic-panel">
        <GridContainer v-if="type == 1" ref="myContext">
            <GridItem v-if="false">防止报not used</GridItem>
            <slot></slot>
        </GridContainer>
        <GridContainer v-if="type == 2" ref="myContext">
            <GridItem v-if="false">防止报not used</GridItem>
            <slot></slot>
        </GridContainer>
        <CanvasContainer v-if="type == 3" ref="myContext" :width="width" :height="height">
            <CanvasItem v-if="false">防止报not used</CanvasItem>
            <slot></slot>
        </CanvasContainer>
        <HorizontalStackPanel v-if="type == 4" ref="myContext">
            <slot></slot>
        </HorizontalStackPanel>
        <VerticalStackPanel v-if="type == 5" ref="myContext">
            <slot></slot>
        </VerticalStackPanel>
    </div>
</template>

<script>
import UniversalPageViewModel from '@/core/universal-page-vm';
import ViewType from '@/core/enums/system/viewType';

import GridContainer from '../grid/GridContainer.vue';
import GridItem from '../grid/GridItem.vue';
import HorizontalStackPanel from '../stack_panel/HorizontalStackPanel.vue';
import VerticalStackPanel from '../stack_panel/VerticalStackPanel.vue';
import CanvasItem from '../canvas/CanvasItem.vue';
import CanvasContainer from '../canvas/CanvasContainer.vue';

export default {
    name: 'DynamicPanel',
    components: {
        GridContainer, GridItem,
        HorizontalStackPanel, VerticalStackPanel,
        CanvasContainer, CanvasItem,
    },
    props: {
        type: Number,
        controls: Array,
        page_vm: UniversalPageViewModel,
    },
    data() {
        return {
            width: 0,
            height: 0,
        }
    },
    created() {
        // console.log("DynamicPanel初始化", this.type, this.controls);
    },
    mounted() {
        // 获取slot中的所有子元素
        const slotContent = this.$slots.default;

        if (slotContent) {
            // 遍历slot中的每个元素
            const wrappedElements = slotContent.map(vnode => {
                // 检查vnode是否是一个组件或元素
                if (vnode.tag) {
                    // 使用另一个组件包裹当前元素
                    if (this.type == ViewType.Grid) {
                        return this.$createElement('GridItem', {
                            props: {

                            },
                        }, [vnode]);
                    }
                    else if (this.type == ViewType.SimplePanel) {
                        return this.$createElement('GridItem', {
                            props: {
                            },
                        }, [vnode]);
                    }
                    else if (this.type == ViewType.Canvas) {
                        var control = vnode.componentInstance.control;
                        this.width = Math.max(this.width, control.Left + control.Width);
                        this.height = Math.max(this.height, control.Top + control.Height);
                        return this.$createElement('CanvasItem', {
                            props: {
                                x: control.Left,
                                y: control.Top,
                                width: control.Width,
                                height: control.Height,
                            },
                        }, [vnode]);
                    }
                    else if (this.type == ViewType.HorizontalStackPanel) { return vnode; }
                    else if (this.type == ViewType.VerticalStackPanel) { return vnode; }
                    else {
                        console.log(`没有在"DynamicPanel.vue"定义ViewType:[${this.type}]`);
                    }
                    // return this.$createElement('AnotherComponent', {
                    //     // 可以在这里传递props给AnotherComponent
                    //     // props: { ... },
                    // }, [vnode]); // 将原始vnode作为AnotherComponent的子元素
                    return vnode;
                } else {
                    // 如果不是组件或元素 (例如文本节点)，则直接返回
                    return vnode;
                }
            });


            // 更新slot内容
            this.$slots.default = wrappedElements;
            this.$forceUpdate(); // 强制重新渲染组件
        }
    },
}
</script>

<style lang="scss" scoped>
.dynamic-panel {}
</style>