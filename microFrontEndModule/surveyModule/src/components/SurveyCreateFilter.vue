<template>
  <table class="survey-table">
    <tr>
      <th class="body2">
        <span class="required">기간 설정</span>
      </th>
      <td colspan="3">
        <div class="row-4">
          <q-input
            :disabled="[SurveyStatus.Started, SurveyStatus.Extended, SurveyStatus.Stopped, SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1"
            :class="{disabled: [SurveyStatus.Started, SurveyStatus.Extended, SurveyStatus.Stopped, SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1}"
            outlined
            v-model="startDate"
            class="inp_date normal"
            style="margin-right: 4px"
          >
            <template v-slot:append>
              <q-icon
                :class="{disabled: [SurveyStatus.Started, SurveyStatus.Extended, SurveyStatus.Stopped, SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1}"
                name="date_range"
                class="icon_svg cursor-pointer"
              >
                <q-popup-proxy
                  v-if="[SurveyStatus.Started, SurveyStatus.Extended, SurveyStatus.Stopped, SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) === -1"
                  ref="qDateProxyFrom"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    minimal
                    mask="YYYY.MM.DD"
                    v-model="startDate"
                    :options="disablePastDates"
                    @update:modelValue="()=>{($refs.qDateProxyFrom as any).hide()}"
                  >
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="tilde">
            <span>~</span>
          </div>
          <q-input
            :readonly="[SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1"
            :class="{disabled: [SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1}"
            outlined
            v-model="endDate"
            class="inp_date normal"
            style="margin-right: 4px"
          >
            <template v-slot:append>
              <q-icon
                :class="{disabled: [SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1}"
                name="date_range"
                class="icon_svg cursor-pointer"
              >
                <q-popup-proxy
                  v-if="[SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) === -1"
                  ref="qDateProxyFrom"
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    minimal
                    mask="YYYY.MM.DD"
                    v-model="endDate"
                    :options="disableBeforeStartDate"
                    @update:modelValue="()=>{($refs.qDateProxyFrom as any).hide()}"
                  >
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </td>
    </tr>
    <tr>
      <th class="body2">
        <span>설문 대상</span>
      </th>
      <td class="size_40">
        <q-btn
          :class="{disabled: [SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1}"
          @click="emit('openAuthModal')"
          fill
          unelevated
          color="grey-2"
          class="size_sm"
          label="권한설정"
          style="margin-right: 20px"
        />
        <span class="body2">* 미설정 시 전체 설문 참여 기능</span>
      </td>
      <th class="body2">
        <span class="required">익명여부</span>
      </th>
      <td>
        <q-radio
          v-model="surveyCandAnymYn"
          val="Y"
          label="Y"
          color="black"
          class="check_to_radio"
        />
        <q-radio
          v-model="surveyCandAnymYn"
          val="N"
          label="N"
          color="black"
          class="check_to_radio"
          style="margin-right: 10px"
        />
      </td>
    </tr>
    <tr>
      <th class="body2">
        <span class="required">설문 결과 공개</span>
      </th>
      <td class="size_40">
        <q-radio
          v-model="surveyRsltMpblcYn"
          val="Y"
          label="Y"
          color="black"
          class="check_to_radio"
        />
        <q-radio
          v-model="surveyRsltMpblcYn"
          val="N"
          label="N"
          color="black"
          class="check_to_radio"
          style="margin-right: 10px"
        />
      </td>
      <th class="body2">
        <span class="required">참여 후 수정</span>
      </th>
      <td>
        <q-radio
          :disable="[SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1"
          v-model="rspnModfPosbYn"
          val="Y"
          label="Y"
          color="black"
          class="check_to_radio"
        />
        <q-radio
          :disable="[SurveyStatus.EndedEarly, SurveyStatus.Ended].indexOf(props.surveyStat) > -1"
          v-model="rspnModfPosbYn"
          val="N"
          label="N"
          color="black"
          class="check_to_radio"
          style="margin-right: 10px"
        />
      </td>
    </tr>
  </table>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { date } from 'quasar';
import type { SurveyInterface } from '@/composables/survey-interface';
import { SurveyStatus } from '@/composables/survey-interface';
import eventBus from '@/composables/survey-event-bus';
import { useSurveyStore } from '@/stores/survey-store';
const store = useSurveyStore();

/* 에밋 선언 */
// 데이터 조회, 권한 모달 열기
const emit = defineEmits(['searchData','openAuthModal']);

/* 프롭 선언 */
const props = defineProps({
  filterData:{ // 등록 설문일 경우 데이터
    type: Object,
    required: true
  },
  surveyStat:{ // 설문 상태
    type: Number,
    required: true
  },
});

/* 기간 설정 */
const { formatDate } = date;
const today = new Date();

// 시작일
const startDate = computed({
  get(){
    return formatDate(store.startDate || today, 'YYYY.MM.DD');
  },
  set(value){
    return store.setStartDate(formatDate(value, 'YYYY.MM.DD'));
  }
});

// 종료일
const endDate = computed({
  get(){
    return formatDate(store.endDate || today, 'YYYY.MM.DD');
  },
  set(value){
    return store.setEndDate(formatDate(value, 'YYYY.MM.DD'));
  }
});

// 시작일 - 오늘 이전 날짜 비활성화
const disablePastDates = (date: string) => {
  today.setHours(0, 0, 0, 0); // 오늘 자정 기준
  return new Date(date) >= today;
};

// 종료일 - 시작일 이전 날짜 비활성화
const disableBeforeStartDate = (date: string) => {
  if (!startDate.value) return true; // 시작일이 설정되지 않았으면 제한 없음
  const start = new Date(startDate.value);
  start.setHours(0, 0, 0, 0); // 시작일 자정 기준
  return new Date(date) >= start;
};


/* 라디오 버튼 컨트롤 */
// 익명 여부
const surveyCandAnymYn = computed({
  get(){
    return store.surveyCandAnymYn;
  },
  set(value){
    return store.setSurveyCandAnymYn(value);
  }
});
// 설문 결과 공개 여부
const surveyRsltMpblcYn = computed({
  get(){
    return store.surveyRsltMpblcYn;
  },
  set(value){
    return store.setSurveyResultMpblcYn(value);
  }
});
// 참여 후 수정 공개 여부
const rspnModfPosbYn = computed({
  get(){
    return store.rspnModfPosbYn;
  },
  set(value){
    return store.setRspnModfPosbYn(value);
  }
});


// 파라미터 생성 메서드
const createSearchParams = (isPreview: boolean): SurveyInterface => {
  const params: SurveyInterface = {
    tempYn : 'N', // 디폴트는 N 설문 저장 단계에서 변경
    surveyPrdStrDate : startDate.value,
    surveyPrdEndDate : endDate.value,
    surveyRsltMpblcYn : store.surveyRsltMpblcYn,
    surveyCandAnymYn : store.surveyCandAnymYn,
    rspnModfPosbYn : store.rspnModfPosbYn,
    surveyPageList: [], // 설문 페이지 리스트(이벤트 버스에서 다음 이벤트에서 값을 담음)
    attachments: []
  };
  // 미리보기일 경우 isPreview 삽입.
  if(isPreview) params.isPreview = true;
  return params;
}

/* 이벤트 버스 사용. */
// 컴포넌트가 마운트될 때 이벤트 리스너 등록
onMounted(() => {
  eventBus.on('createSearchParams', createSearchParams, '0-0');
});

// 컴포넌트가 언마운트될 때 이벤트 리스너 해제
onUnmounted(() => {
  eventBus.off('createSearchParams');
});


/* 등록 설문일 경우 데이터 바인딩 */
watch(() => props.filterData, () => {
  startDate.value = props.filterData.surveyPrdStrDtm;
  endDate.value = props.filterData.surveyPrdEndDtm;
  surveyRsltMpblcYn.value = props.filterData.surveyRsltMpblcYn;
  surveyCandAnymYn.value = props.filterData.surveyCandAnymYn;
  rspnModfPosbYn.value = props.filterData.rspnModfPosbYn;
},{ deep: true });
</script>

<style lang="scss" scoped>
.survey-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #ccc;
  tr {
    height: 58px;
  }
  th {
    padding: 0 0 0 24px;
    width: 180px !important;
    border-bottom: 1px solid #ccc;
    .required::after {
      display: inline-block;
      content: '*';
      padding-left: 5px;
      color: #ed1c24;
    }
  }
  td {
    padding: 0 10px;
    border-bottom: 1px solid #ccc;
    &.size_40 {
      width: 40%;
    }
  }
  th {
    text-align: left;
    background-color: #f2f2f2;
    width: 120px;
  }
}
</style>
