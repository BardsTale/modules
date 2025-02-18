import { ref } from 'vue';
import type { SimpleObject } from '../composables/survey-interface';
import { defineStore } from 'pinia';

// 설문조사 스토어
export const useSurveyStore = defineStore('survey', () => {
  /* state 정의 */
  const pagePerQuerys = ref<SimpleObject>({}); // 페이지 당 쿼리 수 (탑 버튼 컨트롤 용)
  const startDate = ref<string>(''); // 필터영역 설문 시작일자
  const endDate = ref<string>(''); // 필터영역 설문 종료일자
  const surveyCandAnymYn = ref<string>('N'); // 필터영역 익명 여부
  const rspnModfPosbYn = ref<string>('Y'); // 필터영역 참여 후 수정 여부
  const surveyRgstSurveyId = ref<number>(0); // 설문조사 만들기 surveyId
  const surveyWrteSurveyId = ref<number>(0); // 설문조사 참여 surveyId

  // 스토어 초기화 메서드
  function resetState() {
    pagePerQuerys.value = {};
    startDate.value = '';
    endDate.value = '';
    surveyCandAnymYn.value = 'N';
    rspnModfPosbYn.value = 'Y';
    surveyRgstSurveyId.value = 0;
    surveyWrteSurveyId.value = 0;
  }

  /* action(setter) 정의 */
  function setPagePerQuerys(page: number, queryCount: number) {
    pagePerQuerys.value[page] = queryCount;
  }
  function setStartDate(value: string) {
    startDate.value = value;
  }
  function setEndDate(value: string) {
    endDate.value = value;
  }
  function setSurveyCandAnymYn(value: string) {
    surveyCandAnymYn.value = value;
  }
  function setRspnModfPosbYn(value: string) {
    rspnModfPosbYn.value = value;
  }
  function setSurveyCreateSurveyId(value: number) {
    surveyRgstSurveyId.value = value;
  }
  function setSurveyWrteSurveyId(value: number) {
    surveyWrteSurveyId.value = value;
  }

  return {
    // State
    pagePerQuerys,
    startDate,
    endDate,
    surveyCandAnymYn,
    rspnModfPosbYn,
    surveyRgstSurveyId,
    surveyWrteSurveyId,
    // Actions
    setPagePerQuerys,
    setStartDate,
    setEndDate,
    setSurveyCandAnymYn,
    setRspnModfPosbYn,
    setSurveyCreateSurveyId,
    setSurveyWrteSurveyId,
    // reset
    resetState,
  }
});
