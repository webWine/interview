<template>
  <div class="wrapper" @scroll="debounceScroll($event)" ref="wrapper">
    <div class="scroll-wrapper" :style="{height:scrollHeight+'px'}"></div>
    <div class="list" ref="listRef" :style="{transform:`translateY(${curOffset}px)`}">
      <slot></slot>
    </div>
  </div>
</template>
关键步骤
1、创建一个高度固定的可视区域吗,添加overflow形成滚动条
2、创建一个空白元素,浮在1创建的盒子上,用于形成滚动条,在高度不固定时,这里只需要大概计算一个高度就行,不拉到最后一个无法计算真正的高
3、创建滚动列表
4、滚动中实时计算列表的顶部偏移距离,实际是缓冲区域的首个item距离顶部的距离
5、根据滚动位置(scrollTop)动态计算滚动过程中开始位置的坐标,
6、头尾按照比例添加一些数据,形成一个缓冲区,避免快速滚动过程中出现白屏
优化:
  1、根据可视区域的动态计算每次应该展示的list长度, 高度不固定的情况下初始化的时候计算一下,不需要不停的计算
  2、滚动过程添加节流,减少计算
  3、大数据处理时,可以截取前几十条预处理(快速渲染页面),完整的数据处理采用异步处理
组件设计思路:
  1、列表具有高度自由,使用slot处理
  2、需要更新数据时抛出方法updateData
  3、列表的长度未知,dom信息计算时可知上一次updateData传出的endIndex应该就是下一次DOM信息计算的初始位置
<script setup>
  import {
    ref,
    onMounted,
    computed,
    watch,
    nextTick
  } from "vue"
  import debounce from "../../../utils/debounce.js"
  const props = defineProps({
    size:{
      typeof:Number,
      default:20
    },
    preItemHeight:{
      typeof:Number,
      default:30
    },
    bufferPercent:{
      typeof:Number,
      default:0.5
    }
  })
  const emits =  defineEmits(['updateData'])
  let startIndex = ref(0),
  visiableCount= ref(20),
    endIndex = computed(() => startIndex.value + visiableCount.value),
    wrapper = ref(null),
    listRef = ref(null),
    curOffset = ref(0);
  const positions = new Array(props.size).fill(null).map((item, index) => {
    return {
      index,
      height: props.preItemHeight,
      top: index * props.preItemHeight,
      bottom: (index + 1) * props.preItemHeight
    }
  })
  let scrollHeight = ref(positions[positions.length - 1].bottom)
  const aboveCount = computed(() => Math.min(startIndex.value,  Math.ceil(visiableCount.value * props.bufferPercent)))
  const belowCount = computed(() => Math.min(props.size - endIndex.value, Math.ceil(visiableCount.value * props.bufferPercent)))
  const debounceScroll = debounce(scrollFn)
  
  watch(startIndex, () => {
    emits('updateData',startIndex.value - aboveCount.value,endIndex.value + belowCount
    .value)
    nextTick(() => {
      updatePositons()
      computedCurOffset()
    })
  })

  onMounted(() => {
    nextTick(()=>{
      updatePositons(1)
      visiableCount.value = getNextIndex(wrapper.value.offsetHeight)
    })
    emits('updateData',startIndex.value - aboveCount.value,endIndex.value + belowCount.value)
  })
  function scrollFn(e) {
    const {
      scrollTop
    } = e.target
    startIndex.value = getNextIndex(scrollTop)
  }

  function updatePositons(initFlag) {
    const nodes = Array.from(listRef.value.children)
    const position = positions[endIndex.value + belowCount.value]
    let index =0
    if(initFlag){
      index = 0
    } else {
       index = position ? position.index : 0;
    }
    nodes.forEach(node => {
      const {
        height
      } = node.getBoundingClientRect()
      positions[index].height = height
      positions[index].top = positions[index - 1] ? positions[index - 1].bottom : height;
      positions[index].bottom = positions[index - 1] ? positions[index - 1].bottom + height : height;
      index++
    })
  }

  function getNextIndex(target) {
    const position = positions.find(position => position && position.top >= target)
    return position ? position.index : 20
  }

  function computedCurOffset() {
    if (startIndex.value > 0) {
      curOffset.value =positions[startIndex.value - aboveCount.value] ? positions[startIndex.value - aboveCount.value].top :0
    } else {
      curOffset.value = 0
    }
  }
</script>
<style scoped>
  .wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    overflow-y: scroll;
  }

  .scroll-wrapper {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .list {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  
</style>