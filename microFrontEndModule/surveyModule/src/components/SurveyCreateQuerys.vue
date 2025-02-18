<template>
  <!-- 질문 case 동적 추가 -->
  <Draggable
    v-model="queryComponents"
    :class="`dragClassQuery${props.surveyPageNumber}`"
    :animation:="200"
    :disabled="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
  >
    <template v-for="(component, idx) in queryComponents" :key="`queryCount${component.id}`">
      <SurveyCreateQuerysType
        :query-number="component.id as number"
        :copied-param="component?.param as object"
        :query-param="component?.params as object"
        :survey-page-number="props.surveyPageNumber"
        :survey-page-seq="props.surveyPageSeq"
        :query-seq="idx"
        :survey-stat="props.surveyStat"
        :is-select="component.isSelect as boolean"
        @add-query="addQuery"
        @remove-query="removeQuery"
        @select-query="selectQuery"
      />
    </template>
  </Draggable>
  <div class="add_btn_ara">
    <q-btn
      :class="{disabled:[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1}"
      outline
      icon-right="add"
      unelevated
      class="size_sm btn_row_add query__btn--add"
      label="질문추가"
      @click="addQuery({},undefined)"
    />
  </div>
</template>

<script lang="ts" setup>
import {nextTick, onMounted, ref, watch } from 'vue';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import SurveyCreateQuerysType from '../components/SurveyCreateQuerysType.vue';
import type { FlexibleObject, SurveyQuest } from '@/composables/survey-interface';
import { SurveyStatus, SurveyOption } from '@/composables/survey-interface';
import { useSurveyStore } from '../stores/survey-store';
const store = useSurveyStore();

/* 프롭 선언 */
const props = defineProps({
   surveyPageSeq:{ // 설문 페이지 순번
    type: Number,
    required: true
  },
  surveyPageNumber:{ // 설문 페이지 고유 번호
    type: Number,
    required: true
  },
  surveyStat:{ // 설문 상태
    type: Number,
    required: true
  },
  sureyParams:{ // 등록 설문일 시 데이터
    type: Object,
    required: true
  }
});


/* 질문 선택 시 활성 & 비활성화 toggle */
const selectQuery = (seq: number): void => {
  queryComponents.value.forEach((ele: FlexibleObject, idx: number) => {
    if(seq === idx) ele.isSelect = true;
    else ele.isSelect = false;
  });
}

/* 질문 case 관리 */
// 동적 컴포넌트 데이터 배열
const queryComponents = ref<FlexibleObject[]>([
  {
    id: 1, // 고유 ID 생성
    name: 'queryComponent1',
    isSelect: false, // 질문 선택(활성화) 유무
  }
]);
let querySeq = 1; // 동적 컴포넌트 순번

// 질문 추가
const addQuery = (param: FlexibleObject, id: number|undefined): void => {
  // 설문 수정 불가능 상태일 경우.
  if([SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1) return;
  // 기존 항목을 찾기 위한 인덱스 변수
  const index = queryComponents.value.findIndex(component => component.id === id);

  // 배열의 길이가 50 미만일 때만 추가
  if (queryComponents.value.length < SurveyOption.QueryPerPage) {
    if (index !== -1) {
      // id가 존재할 경우, 그 뒤에 새 항목을 추가
      queryComponents.value.splice(index+1, 0, {
        id: ++querySeq, // 고유 ID 생성
        name: `queryComponent${querySeq}`,
        isSelect: false,
        param: param
      });
    } else {
      // id가 존재하지 않을 경우, 배열의 끝에 추가 (기본 동작)
      queryComponents.value.push({
        id: ++querySeq, // 고유 ID 생성
        name: `queryComponent${querySeq}`,
        isSelect: false,
        param: param
      });
    }
  }

  // 스토어에 페이지 당 질문 수 수정
  store.setPagePerQuerys(props.surveyPageNumber,queryComponents.value.length);
}

// 질문 삭제
const removeQuery = (id: number) => {
  if(queryComponents.value.length > 1){
    queryComponents.value = queryComponents.value.filter(ele=>{
      return ele.id !== id;
    });
  }

  // 스토어에 페이지 당 질문 수 수정
  store.setPagePerQuerys(props.surveyPageNumber,queryComponents.value.length);
};


/* 등록 설문일 경우 데이터 바인딩 */
watch(() => props.sureyParams, () => {
  if(props.sureyParams){
    queryComponents.value = props.sureyParams.surveyQuestList.map((ele: SurveyQuest)=>{
      return {
        id: ele.questSeq,
        name: `queryComponent${ele.questSeq}`,
        isSelect: false,
        params: ele // 하위 노드에서 사용할 데이터
      }
    });

    querySeq = queryComponents.value.length;
  }
},{ deep: true, immediate: true });


/* Draggable의 disabled 옵션과 퀘이사의 [disabled] css 클래스 충돌 문제 해결 */
onMounted(async ()=>{
  await nextTick(); // 모든 엘리먼트가 렌더링 완료된 후
  if(document.querySelector(`.dragClassQuery${props.surveyPageNumber}`)!.getAttribute('disabled') === 'false'){
    document.querySelector(`.dragClassQuery${props.surveyPageNumber}`)!.removeAttribute('disabled');
  }
});


/* 외부 노출 값 */
defineExpose({
  queryComponents,
  selectQuery
})
</script>

<style lang="scss" scoped>
[disabled] {
  cursor: auto !important;
  opacity: 1 !important;
}

.add_btn_ara {
  text-align: center;
  margin: 20px 0 0 0;
}

.query__btn--add {
  border-radius: 24px;
  background-color: white !important;
}
</style>
