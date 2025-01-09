<template>
<div v-if="surveyResultData && ![SurveyStatus.Temp, SurveyStatus.NotStarted, SurveyStatus.Drafting].includes(props.surveyStat)" class="survey-result">
  <div class="info_head">
    <div class="info_summary">
      <div class="badge_row">
        <q-badge :color="SURVEY_COLOR[surveyResultData.surveyStat]" class="large34">{{ SURVEY_STATUS[surveyResultData.surveyStat] }}</q-badge>
        <q-badge
          outline class="large34" style="margin-left: 10px"
        >
          {{ surveyResultData.surveyPrdStrDtm }}~{{ surveyResultData.surveyPrdEndDtm }}
        </q-badge>
      </div>
      <div class="title_row">
        <h5 class="title1">
          {{ surveyResultData.surveyTitle }}
        </h5>
      </div>
      <div class="info_row">
        <div class="wrap_with_icon">
          <q-icon
            name="icon-user_check-orange"
            class="icon_svg desktop_view"
            size="24px"
          ></q-icon>
          <p class="body2 color_grey_3">
            참여 <span class="body1 color_orange">{{ surveyResultData.surveyPtctCnt.toLocaleString() }}</span>
          </p>
        </div>
        <div class="wrap_with_icon">
          <q-icon
            name="icon-user_grey"
            class="icon_svg desktop_view"
            size="24px"
          >
          </q-icon>
          <p class="body2 color_grey_3">
            <!-- 데스크탑은 body2, 모바일은 body3 인데.. -->
            미참여 <span class="body1 color_grey_3">{{ surveyResultData.surveyNonPtctCnt.toLocaleString() }}</span>
          </p>
        </div>
        <div class="text_only color_grey_3">
          <p class="body2">
            참여 대상자 <span class="body1">{{ (surveyResultData.surveyTotPtctNum).toLocaleString() }}</span>
          </p>
        </div>
        <div class="text_only color_grey_3">
          <p class="body2">
            참여율 <span class="body1 color_orange">{{ surveyResultData.surveyPtctPercentage }}%</span>
          </p>
        </div>
        <q-btn
          @click="showPrintPopup"
          outline
          unelevated
          class="size_sm desktop_view"
          style="margin-left: auto"
        >
          <q-icon
            name="icon-print"
            class="icon_svg"
          />
        </q-btn>
      </div>
    </div>
    <div class="control_btn">
      <q-btn
        @click="chartType = 'all'"
        :class="{'btn_search':chartType === 'all'}"
        :outline="chartType !== 'all'"
        unelevated
        class="size_sm"
        label="전체"
        style="border-radius: 50px"
      />
      <q-btn
        @click="chartType = 'day'"
        :class="{'btn_search':chartType === 'day'}"
        :outline="chartType !== 'day'"
        unelevated
        class="size_sm"
        label="일자별 참여 수"
        style="border-radius: 50px"
      />
    </div>
  </div>
  <div class="info_body">
    <div class="info_body_top">
      <p v-if="chartType === 'all'" class="body1">총 질문 {{ surveyResultData.surveyQuestResultList.length }}개</p>
      <q-btn
        outline
        unelevated
        icon=""
        class="size_sm btn_excel desktop_view"
        style="margin-left: auto"
      >
        <span class="body1">엑셀 다운로드</span>
      </q-btn>
    </div>
    <!-- 결과 타입 : 전체 -->
    <template v-if="chartType === 'all'">
      <template v-for="(resultData, idx) in surveyResultData.surveyQuestResultList" :key="`result-${idx}`">
        <!-- 단답, 장문, 파일첨부, 시간&날짜 -->
        <template v-if="[QuestType.ShotAnswer, QuestType.LongAnswer, QuestType.FileUpload, QuestType.Datetime].includes(resultData.questType)">
          <!-- 텍스트 -->
          <SurveyResultTypeTextType
            :result-data="resultData"
            :result-number="idx+1"
          />
        </template>

        <!-- 선호도 -->
        <template v-if="resultData.questType === QuestType.Preference">
          <!-- 세로막대형 -->
          <SurveyResultTypePreference
            :result-data="resultData"
            :result-number="idx+1"
          />
        </template>

        <!-- 단일선택 -->
        <template v-else-if="resultData.questType === QuestType.SingleChoice">
          <!-- 도넛형 -->
          <SurveyResultTypeSingleChoice
            :result-data="resultData"
            :result-number="idx+1"
          />
        </template>

        <!-- 복수선택 -->
        <template v-else-if="resultData.questType === QuestType.MultipleChoice">
          <!-- 가로막대형 -->
          <SurveyResultTypeMultiChoice
            :result-data="resultData"
            :result-number="idx+1"
          />
        </template>
      </template>
    </template>
    <!-- 결과 타입 : 일자 별 참여 수 -->
    <template v-else>
      <SurveyResultTypePerDay
        :result-data="surveyResultPerDayData"
      />
    </template>
  </div>
</div>
<div v-else class="no_result">
  <q-icon
    name="icon-no-survey-result"
    class="icon_svg"
    style="width: 100px; height: 100px"
  ></q-icon>
  <p class="title1">설문이 시작되지 않았습니다.</p>
</div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeMount, ref } from 'vue';
import axios from 'axios';
import { SurveyStatus, QuestType, SurveyResult, SurveyResultPerDay } from '../src/composables/survey-interface';
import SurveyResultTypeSingleChoice from '../components/SurveyResultTypeSingleChoice.vue'; // 단일선택형
import SurveyResultTypeMultiChoice from '../components/SurveyResultTypeMultiChoice.vue'; // 복수선택형
import SurveyResultTypePreference from '../components/SurveyResultTypePreference.vue'; // 선호도형
import SurveyResultTypeTextType from '../components/SurveyResultTypeTextType.vue'; // 텍스트형(단답, 장문, 날짜, 첨부)
import SurveyResultTypePerDay from '../components/SurveyResultTypePerDay.vue'; // 일자별참여자수
import { useRouter } from 'vue-router';
const router = useRouter();


/* 프롭 선언 */
const props = defineProps({
  surveyStat: {
    type: Number,
    required: true
  },
  surveyId: {
    type: Number,
    default: 0
  },
});

/* 에밋 선언 */
const emit = defineEmits(['openSurveyUserModal']);


/* 상수 선언부 */
// 설문조사 상태값 리터럴(프롭으로 받은 surveyStat에 의해 결정)
const SURVEY_STATUS: { [key: number]: string } = {
  1: '임시저장',
  2: '시작전',
  3: '진행중',
  4: '기간연장',
  5: '중지',
  6: '종료',
  7: '조기종료',
  8: '작성중'
};
// 설문조사 컬러값 리터럴(프롭으로 받은 surveyStat에 의해 결정)
const SURVEY_COLOR: { [key: number]: string } = {
  1: 'green-2',
  2: 'green-2',
  3: 'green-2',
  4: 'skyblue-5',
  5: 'yellow-9',
  6: 'grey-4',
  7: 'grey-4',
  8: 'green-2'
};


/* 차트 관리 */
const chartType = ref<'all'|'day'>('all'); // all or day



/* 프린트 */
const showPrintPopup = () => {
  const popupUrl = router.resolve({
    path: '/print/surveyPrint'
  }).href;
  sessionStorage.setItem('SurveyResultData',JSON.stringify(surveyResultData.value));
  const popup = window.open(popupUrl,'popupWindow', 'width=1660,height=780');
}


/* 설문 결과탭 진입 시 결과값 조회 */
const surveyResultData = ref<SurveyResult>() // 설문 결과 전체
const surveyResultPerDayData = ref<SurveyResultPerDay[]>() // 설문 결과 일자별
onBeforeMount(async ()=>{
  surveyResultData.value = (await axios('/cmm/v1/sys/survey/totalResult','get',{surveyId: props.surveyId})).data.body as SurveyResult

  surveyResultPerDayData.value = (await axios('/cmm/v1/sys/survey/dailyPtctCnt','get',{surveyId: props.surveyId})).data.body.dailySurveyPtctCntList as SurveyResultPerDay[]

  await nextTick();
})
</script>

<style lang="scss">
.survey-result{
  .required::after {
    display: inline-block;
    content: '*';
    padding-left: 5px;
    color: #ed1c24;
  }
}
</style>
