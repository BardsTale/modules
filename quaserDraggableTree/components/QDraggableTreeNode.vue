<!-- 트리 노드 컴포넌트(재귀 컴포넌트, 롤백, 변경 시 재귀적 호출이 필요함.) -->
<template>
  <div :class="hasChildren ? 'q-tree__node relative-position relative-position q-tree__node--parent' : 'q-tree__node relative-position q-tree__node--child'">
    <div :data-menu-id="localValue.menuId" class="q-tree__node-header relative-position row no-wrap items-center q-tree__node--link q-hoverable q-focusable" @click="open = !open">
      <q-icon size="2em" v-if="hasChildren" name="arrow_right"
        :data-menu-id="localValue.menuId"
        :class="open ? 'q-icon notranslate material-icons q-tree__arrow q-tree__arrow--rotate' : 'q-icon notranslate material-icons q-tree__arrow'"
      />
      <img v-if="hasChildren && !open" class="q-tree__img q-mr-sm" width="24" height="24" src="/icons/icon-folder-closed.svg">
      <img v-if="hasChildren && open" class="q-tree__img q-mr-sm" width="24" height="24" src="/icons/icon-folder-open.svg">
      <slot name="left" :item="value" :open="open" />
      <slot v-if="hasDefaultSlot" name="body" :item="value" :open="open" />
      <div v-if="!hasDefaultSlot" class="q-tree__node-header-content q-pa-xs">
        {{ value.label }}
      </div>
    </div>
    <div v-if="open" class="q-tree__children">
      <draggable
        v-model="localValue.children"
        :class="'q-tree__node-collapsible--ghost'"
        :group="group"
        :data-depth="localValue.depth"
        :data-menu-id="localValue.menuId"
        :data-cmmu="localValue.menuPath?.indexOf('커뮤니티') > -1"
        v-bind="dragOptions"
        @start="onDragStart"
        @end="onDragEnd"
      >
        <transition-group type="transition" :name="!drag ? 'flip-list' : undefined">
          <QDraggableTreeNode
            v-for="(item, idx) in localValue.children"
            :key="item.id"
            :value="item"
            :group="group"
            :treeKey="item.id"
            :seqIdx="idx"
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
            <span v-if="!hasDefaultSlot">{{ item.label }}</span>
          </QDraggableTreeNode>
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, useSlots, inject, onMounted} from 'vue';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import QDraggableTreeNode from './QDraggableTreeNode.vue';
import { DragStartEvent, DragEndEvent, TreeData, FlexibleObject } from '../types/tree-interface.ts';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({
      id: 0,
      name: '',
      children: []
    })
  },
  root: {
    type: Boolean,
    default: false
  },
  group: {
    type: String,
    default: null
  },
  treeKey: {
    type: Number,
    required: true
  },
  seqIdx: {
    type: Number,
    required: true
  },
  isOpen: {
    type: Boolean
  },
  checkCondition: {
    type: Function,
  }
});

/* 컴포넌트 이니셜라이징 */
const emit = defineEmits(['setOriginData', 'resetTreeData', 'setTreeData']);
const saveDragItem = inject('saveDragItem') as Function;

const open = ref(false);
const drag = ref(false);
const localValue = ref({ ...props.value });

const hasChildren = computed(() => localValue.value.children != null && localValue.value.children.length > 0);

const hasDefaultSlot = computed(() => {
  const slots = useSlots();
  return slots.body !== undefined;
});

const dragOptions = computed(() => ({
  animation: 200,
  ghostClass: 'ghost'
}));

watch(() => props.value, (value) => {
  localValue.value = { ...value };
},{deep: true});

onMounted(()=>{
  if(props.isOpen){
    open.value = true;
  }
})

/* 드래그 제어 */
const dragItem = ref<TreeData|FlexibleObject>(); // 현재 드래그중인 아이템
const draggingItemIndex = ref(0); //  현재 드래그 인덱스

// 드래그 시작 이벤트
const onDragStart = (event: DragEndEvent) => {
  dragItem.value = localValue.value.children[event.oldIndex]; // 현재 드래그 아이템 저장
  // 드래그 시작 시 원본 상태 저장
  emit('setOriginData',props.treeKey); // 상위 컴포넌트에게 오리진 저장 요청
  setOriginData(); // 현재 오리진 저장 처리
  draggingItemIndex.value = event.oldIndex;
  drag.value = true
};

// 드래그 종료 이벤트
const isConditionMet = ref(false);
const onDragEnd = (event: DragEndEvent) => {
  // 드래그 종료 시 조건 검사, props에서 체크 컨디션 콜백을 받았을 경우.
  if(props.checkCondition) isConditionMet.value = props.checkCondition(dragItem.value, event.from.dataset.depth, event.to.dataset.depth, event.from.dataset.cmmu == 'true' || event.to.dataset.cmmu == 'true');
  if (isConditionMet.value)  {
    // 조건이 충족되면 드래그 취소하고 원복
    emit('resetTreeData',props.treeKey); // 상위 컴포넌트에게 롤백 요청
    resetTreeData(); // 현재 롤백 처리
  } else {
    // 변경점이 없지 않은 경우 저장
    if(!(event.oldIndex === event.newIndex && event.from.dataset.menuId === event.to.dataset.menuId) && dragItem.value){
      // 변경된 데이터 서버에 저장
      saveDragItem({
        menuId: dragItem.value.id,
        newUpprMenuId: event.to.dataset.menuId,
        newOrdNo: event.newIndex+1
      });
    }
  }

  // 드래그 완료 시 변경된 데이터 상위로 전달
  emit('setTreeData', props.treeKey, localValue.value);

  // 드래그 후 원본 상태 초기화
  draggingItemIndex.value = 0;
  dragItem.value = {};

  drag.value = false
};


// 상위에서 하위에 꽂아준 경우 하위 원복 처리(3. 상위메뉴는 하위 메뉴로 이동할 수 없다.)
// 동일 뎁스의 예외 사항 발생 처리 (2번, 4번)
watch(() => localValue.value.children, (newValue, oldValue) => {
  // 상위에서 하위에 꽂아준 경우
  if(newValue.find(ele=> Number(ele.depth) < Number(localValue.value.depth)+1)) {
    localValue.value.children = oldValue;
  }
  // 기존보다 1개가 늘은 경우는 일단 메뉴 변동으로 간주
  if(newValue.length === oldValue.length+1) {
    if(!isConditionMet.value){ // 예외처리가 발생하지 않은 깔끔한 상태
      const newItem = newValue.filter(ele=>!oldValue.includes(ele))[0];
      if((newItem.menuDv === 3 || newItem.menuDv === 4)) { // 2번, 탭이나 모달
        localValue.value.children = oldValue;
      } else if(newItem.menuPath?.indexOf('커뮤니티') > -1) { // 4번, 커뮤니티 메뉴의 이동
        localValue.value.children = oldValue;
      } else if(oldValue[0].menuPath?.indexOf('커뮤니티') > -1) { // 4번, 커뮤니티 메뉴로의 삽입
        localValue.value.children = oldValue;
      }
    } else {
      isConditionMet.value = false; // 발생한 예외처리값 초기화
    }
  }
},{deep: true});

// 하위 데이터 변경 사항 상위로 재귀 전달 메서드
const setTreeData = (treeKey: number, value: TreeData[]) => {
  localValue.value[props.seqIdx] = {...value};
  emit('setTreeData', props.treeKey, localValue.value); // 재귀적 처리
}

/* 트리 데이터 재귀적 원복 처리 */
const originData = ref<TreeData[]>([]);
// 현재 트리 데이터 저장
const setOriginData = () => {
  originData.value = [...localValue.value.children];
  emit('setOriginData', props.treeKey); // 상위 컴포넌트에게 오리진 저장 요청
}
// 트리 데이터 이전으로 원복
const resetTreeData = () => {
  localValue.value.children = [...originData.value];
  emit('resetTreeData', props.treeKey); // 상위 컴포넌트에게 롤백 요청
}

</script>
