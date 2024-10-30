<template>
  <div class="q-tree q-tree--standard category type_tbl10">
    <transition-group type="transition" :name="!drag ? 'flip-list' : undefined">
      <QDraggableTreeNode v-for="item in localValue as TreeData[]"
        :key="item.id"
        :value="item"
        :group="dragGroup"
        :is-open="true"
        :treeKey="item.id"
        :check-condition="checkCondition"
        @set-origin-data="setOriginData"
        @reset-tree-data="resetTreeData"
        @set-tree-data="setTreeData"
      >
        <template v-slot:left="{ item, open }">
          <slot name="left" :item="item" :open="open" />
        </template>
        <template v-if="hasDefaultSlot" v-slot:body="{ item, open }">
          <slot name="body" :item="item" :open="open" />
        </template>
        <span v-if="!hasDefaultSlot">{{ item.name }}</span>
      </QDraggableTreeNode>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, useSlots } from 'vue';
import data from '../data/data.json';
import { DragNodeInfo, TreeData } from '../types/tree-interface.ts';
import QDraggableTreeNode from './QDraggableTreeNode.vue';

/* 컴포넌트 이니셜라이징 */
const props = defineProps({
  data: {
    type: Array,
    default: data
  }
});

const emit = defineEmits(['input']);

const dragGroup = "myDraggableTree";
const drag = ref<boolean>(false);
const localValue = ref(props.data as TreeData[]);

const hasDefaultSlot = computed(() => {
  const slots = useSlots();
  return slots.body !== undefined;
});

watch(() => props.data, (value) => {
  localValue.value = [...(value as TreeData[]) ];
},{deep: true});


/* 하위 데이터 변경 처리 */
const setTreeData = (treeKey: number, value: TreeData) => {
  localValue.value[treeKey] = {...value}
}

/* 트리 데이터 1뎁스 원복 처리 */
const originData = ref<TreeData[]>([]);
const setOriginData = (treeKey) => {
  originData.value = [...localValue.value[treeKey]?.children];
}
// 트리 데이터 이전으로 원복
const resetTreeData = (treeKey: number) => {
  localValue.value[treeKey].children = [...originData.value];
}


/**
 * 커스터마이징 가능한 노드 변경 검사 콜백 함수
 * 현재 드래그 한 노드의 정보를 기반으로 조건을 검사하여 true/false를 반환하는 콜백 함수
 * @param {dragNodeInfo} dragNodeInfo - 드래그한 노드 정보
 * @returns {boolean} 드래그가 불가한 조건이 있을 경우 false 반환.
 */
// 1. 상위 메뉴는 하위 메뉴로 이동할 수 없다.
const checkCondition = ({fromDepth, toDepth}: DragNodeInfo) => {
  // 1. 상위메뉴는 하위 메뉴로 이동할 수 없다.
  if (fromDepth < toDepth) {
    return true;
  }
  return false;
};
</script>
<style lang="scss">
.flip-list-move {
    transition: transform 0.5s;
}

.no-move {
    transition: transform 0s;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.list-group {
    min-height: 20px;
}

.list-group-item {
    cursor: move;
}

.list-group-item i {
    cursor: pointer;
}
</style>
