<template>
  <q-card class="dialog_card inner_form HN_AU_ME_POP">
    <q-card-section class="dialog_content">
      <div class="info_head">
        <div class="info_summary">
          <div class="badge_row">
            <q-badge :color="SURVEY_COLOR[resultData.surveyStat]" class="large34">{{ SURVEY_STATUS[resultData.surveyStat] }}</q-badge>
            <q-badge
              outline class="large34" style="margin-left: 10px"
            >
              {{ resultData.surveyPrdStrDtm }}~{{ resultData.surveyPrdEndDtm }}
            </q-badge>
          </div>
          <div class="title_row">
            <h5 class="title1">
              {{ resultData.surveyTitle }}
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
                참여 <span class="body1 color_orange">{{ resultData.surveyPtctCnt.toLocaleString() }}</span>
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
                미참여 <span class="body1 color_grey_3">{{ resultData.surveyNonPtctCnt.toLocaleString() }}</span>
              </p>
            </div>
            <div class="text_only color_grey_3">
              <p class="body2">
                참여 대상자 <span class="body1">{{ resultData.surveyTotPtctNum.toLocaleString() }}</span>
              </p>
            </div>
            <div class="text_only color_grey_3">
              <p class="body2">
                참여율 <span class="body1 color_orange">{{ resultData.surveyPtctPercentage }}%</span>
              </p>
            </div>
            <slot name="user-modal" />
          </div>
        </div>
      </div>
      <div class="info_body">
        <div class="info_body_top">
          <p class="body1">총 질문 {{ resultData.surveyQuestResultList.length }}개</p>
        </div>
        <template v-for="(resultData, idx) in resultData.surveyQuestResultList" :key="`result-${idx}`">
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
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { QuestType, SurveyResult } from '../composables/survey-interface';
import SurveyResultTypeSingleChoice from '../components/SurveyResultTypeSingleChoice.vue'; // 단일선택형
import SurveyResultTypeMultiChoice from '../components/SurveyResultTypeMultiChoice.vue'; // 복수선택형
import SurveyResultTypePreference from '../components/SurveyResultTypePreference.vue'; // 선호도형
import SurveyResultTypeTextType from '../components/SurveyResultTypeTextType.vue'; // 텍스트형(단답, 장문, 날짜, 첨부)

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

/* 기본 변수 선언 */
const isOpen = ref(true); // 모달 컨트롤

/* 모달열림 */
const openModal = () => {
  isOpen.value = true;
};

/* 상위창의 데이터 */
const resultData = ref<SurveyResult>(JSON.parse(sessionStorage.getItem('SurveyResultData') as string));

defineExpose({ openModal });
</script>

<style lang="scss">
.HN_AU_ME_POP{
  background-color: #f7f7f7 !important;
  .dialog_content{
    left: 50%;
    transform: translateX(-50%);
    background-color: #f7f7f7 !important;
    width: 1240px;
    text-align: left !important;
    .info_body{
      .survey_item{
        .item_top_row{
          text-align: left !important;
        }
      }
    }
  }

  .q-field__marginal{
    font-size: 16px !important;
  }

  @media print {
    .q-btn {
      display: none;
    }
  }
}
</style>
