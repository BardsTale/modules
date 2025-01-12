<template>
  <div class="fregment">
    <div class="cnt_top">
      <h2 class="title">설문조사 모듈</h2>
    </div>
    <div class="page_community">
      <div class="wrapper_tab">
        <q-tabs
          v-model="tab"
          dense
          class="tab_basic"
          active-bg-color="primary"
          active-color="white"
          indicator-color="transparent"
          align="justify"
          narrow-indicator
          outside-arrows
        >
          <q-tab name="editSurvey" label="설문만들기" :ripple="false" />
          <q-tab name="resultSurvey" label="설문DTO" :ripple="false" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated keep-alive>
          <q-tab-panel name="editSurvey">
            <div class="total_wrap">
              <div class="lh_area">
                <div class="wrap_table_box">
                  <!-- 설문 설정 필터 영역 -->
                  <SurveyCreateFilter ref="surveyRgstFilter"
                    v-show="surveyPageComponents[0].id === onPageNumber"
                    :survey-stat="surveyStat"
                    :filter-data="surveyPropData as SurveyInterface"
                  />
                </div>
                <!-- 설문 본문 -->
                <div class="wrap_page">
                  <template v-for="(component, idx) in surveyPageComponents" :key="`surveyPageCount${component.id}`">
                    <!-- 설문 컨텐츠 영역 -->
                    <div v-show="component.id === onPageNumber">
                      <SurveyCreateContents
                        :survey-page-number="component.id as number"
                        :survey-page-seq="idx"
                        :surey-params="component.params as SurveyPage"
                        :survey-stat="surveyStat"
                        @remove-survey-page="removeSurveyPage"
                      />
                    </div>

                    <!-- 설문 질문 영역 -->
                    <div v-show="component.id === onPageNumber">
                      <SurveyCreateQuerys
                        :survey-page-number="component.id as number"
                        :survey-page-seq="idx"
                        :surey-params="component.params as SurveyPage"
                        :survey-stat="surveyStat"
                        :ref="el => setQuerysRef(el as InstanceType<typeof SurveyCreateQuerys>, idx)"
                      />
                    </div>
                  </template>

                  <div class="confirm_area">
                    <!-- 하단 설문 등록 폼 -->
                    <q-btn
                      v-if="[SurveyStatus.Temp,SurveyStatus.Drafting].includes(surveyStat)"
                      outline
                      unelevated
                      class="size_sm"
                      label="임시저장"
                      style="width: 160px"
                      @click="()=>{ saveSurvey(true) }"
                    />
                    <q-btn
                      unelevated
                      color="black"
                      class="size_sm"
                      label="등록"
                      style="width: 160px"
                      @click="()=>{ saveSurvey(false) }"
                    />
                    <q-btn
                      v-if="![SurveyStatus.Started, SurveyStatus.Extended, SurveyStatus.Drafting].includes(surveyStat)"
                      outline
                      unelevated
                      class="size_sm"
                      label="삭제"
                      style="width: 160px"
                      @click="()=>{ deleteSurvey() }"
                    />
                  </div>
                </div>

              </div>

              <!-- 우측 애드온 -->
              <div class="rh_area">
                <SurveyCreateAddOn ref="surveyRgstAddOn"
                  :show-top-button="showTopButton"
                  :on-page-number="onPageNumber"
                  :query-survey-id="storeSurveyId"
                  :survey-stat="surveyStat"
                  :survey-data="surveyPropData as SurveyInterface"
                  @add-survey-page="addSurveyPage"
                  @show-preview-modal="showPreviewModal"
                  @copy-survey="copySurvey"
                  @restart-survey="restartSurvey"
                  @end-survey="endSurvey"
                  @stop-survey="stopSurvey"
                />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="resultSurvey" keep-alive>
            <div>
              <q-input
                v-model="paramStringify"
                input-class="dto__input"
                outlined
                placeholder="설문을 임시저장 혹은 등록 시 완성된 DTO를 볼 수 있습니다."
                type="textarea"
              >
                <template v-slot:label>메시지 내용</template>
              </q-input>
            </div>
            <!-- 설문 결과 -->
            <!-- <SurveyResult
              :survey-id="storeSurveyId"
              :survey-stat="surveyStat"
            >
              <template v-slot:user-modal="scopeProps">
                <q-btn
                  outline
                  unelevated
                  class="size_sm desktop_view"
                  label="보기"
                />
              </template>
            </SurveyResult> -->
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>

  <!-- 설문 미리보기 모달 -->
  <SurveyCreatePreview :survey-stat="surveyStat" ref="previewModal"/>
</template>
<script lang="ts" setup>
import { Dialog } from 'quasar';
import { ref, provide, computed, onMounted, onUnmounted, watch } from 'vue';
import type { FlexibleObject, SurveyInterface, SurveyPage } from '@/composables/survey-interface';
import { SurveyStatus, SurveyOption } from '@/composables/survey-interface';
import eventBus from '@/composables/survey-event-bus';
import { surveyAwaitAxios, surveyAxios } from '@/composables/survey-util';
import { useSurveyStore } from '@/stores/survey-store';
import SurveyCreateFilter from '@/components/SurveyCreateFilter.vue';
import SurveyCreateContents from '@/components/SurveyCreateContents.vue';
import SurveyCreateQuerys from '@/components/SurveyCreateQuerys.vue';
import SurveyCreateAddOn from '@/components/SurveyCreateAddOn.vue';
import SurveyCreatePreview from '@/components/SurveyCreatePreview.vue';
// import SurveyResult from '@/components/SurveyResult.vue'; // 설문 결과탭
import { useRoute } from 'vue-router';
import moment from'moment';
const store = useSurveyStore();
const route = useRoute();

/* 라우트 파라미터 */
const storeSurveyId = store.surveyRgstSurveyId; // 스토어에서 저장된 surveyid.

/* 상단 탭 관리 */
const tab = ref(route.query.resultView === 'true'? 'resultSurvey':'editSurvey');

/* 설문 페이지 관리 및 애드온 영역 페이지 관리 */
const surveyPageComponents = ref<Array<FlexibleObject>>([
  {
    id: 1, // 고유 ID 생성
    name: 'surveyPageComponent1',
  }
]);
provide('surveyPageComponents', surveyPageComponents); // 설문 페이지 값 주입, 애드온 페이지 변경 시 정렬.
let surveyPageidx = 1; // 동적 컴포넌트 순번
const onPageNumber = ref(1); // 현재 활성화 된 페이지 번호
const onPage = (pageNum: number): void => {
  onPageNumber.value = pageNum;
}

// 설문 페이지 추가
const addSurveyPage = (): void => {
  // 배열의 길이가 10 미만일 때만 추가, 이중 가드.
  if (surveyPageComponents.value.length < SurveyOption.PagePerSurvey) {
    surveyPageComponents.value.push({
      id: ++surveyPageidx, // 고유 ID 생성
      name: `surveyPageComponent${surveyPageidx}`,
    });
  }
}

// 설문 페이지 삭제(2페이지 부터)
const surveyRgstAddOn = ref();
const removeSurveyPage = (id: number): void => {
  if (surveyPageComponents.value.length === 1) return;

  // 설문 페이지 컴포넌트 삭제
  surveyPageComponents.value = surveyPageComponents.value.reduce((acc: Array<FlexibleObject>, ele, idx, originArr)=>{
    if(ele.id !== id){
      // 삭제 대상이 아닌 설문 페이지 컴포넌트 push
      acc.push(ele);
    } else {
      // 삭제 대상일 시 이전 혹은 다음 페이지 활성화 설정
      if(idx === 0) onPage(originArr[1].id as number);
      else onPage(acc[idx-1].id as number);
    }
    return acc;
  },[]);

  // 페이지 컴포넌트 삭제
  surveyRgstAddOn.value.removePage(id);
};
provide('onPage', onPage); // 페이지 변경 메소드 주입

/* 페이지 변경 감지 시 활성화 된 질문 케이스들 일괄 비활성화 */
const surveyQuerys = ref<InstanceType<typeof SurveyCreateQuerys>[]>([]); // 각 페이지의 설문들을 묶은 컴포넌트 ref
const setQuerysRef = (el: InstanceType<typeof SurveyCreateQuerys>, idx: number)=> {
  if (el) surveyQuerys.value[idx] = el; // 요소 추가
}
watch(onPageNumber, () => {
  surveyQuerys.value?.forEach((querys: InstanceType<typeof SurveyCreateQuerys>) => {
    querys.selectQuery(SurveyOption.QueryPerPage+1); // 페이지당 최대 설문 갯수+1을 함으로서 모두 초기화.
  });
});


/* 설문 저장 및 수정 */
/* 설문 저장 메소드
 * 이벤트 버스에 각 컴포넌트의 파라미터 제작 메소드를 등록 후 루트에서 사용.
 */
const paramStringify = ref(''); // 생성한 파라미터 데이터 직렬화 데이터
const saveParam = ref<SurveyInterface>();
const saveSurvey = async (isTemp: boolean): Promise<void> => {
  // 설문 중지 상태에서 참여 기간이 만료(오늘이 지남)인 경우 수정 불가 예외처리
  if(surveyStat.value === SurveyStatus.Stopped){
    const today = new Date();
    const todayMoment = moment(today, 'YYYY.MM.DD');
    const endMoment = moment(store.endDate, 'YYYY.MM.DD');
    if(todayMoment.diff(endMoment, 'days') > 0){
      Dialog.create({
        message: '설문 기간을 확인해 주세요.',
      });
      return;
    }
  }

  // API 사용 변수
  let path = '/cmm/v1/sys/survey';
  let confirmMsg = '등록 하시겠습니까?';
  let method = 'post';
  let dtoName = 'createSurveyReqDto';
  let surveyParamData;

  // 등록 설문일 경우 추가 패스 및 api에 맞는 dto처리
  switch(surveyStat.value){
    case SurveyStatus.Temp:
    case SurveyStatus.NotStarted:
      path += '/notStarted';
      dtoName = 'updateTempOrNotStartedSurveyReqDto';
      break;
    case SurveyStatus.Started:
    case SurveyStatus.Extended:
    case SurveyStatus.Stopped:
      path += '/extended';
      break;
    case SurveyStatus.Ended:
      path += '/ended';
      break;
    case SurveyStatus.EndedEarly:
      path += '/endedEarly';
      break;
    default:
      break;
  }

  // 기본 파라미터 생성
  saveParam.value = await eventBus.emit('createSearchParams','') as SurveyInterface;

  // 설문 수정 구분에 따른 변경
  if(isTemp) {
    if(saveParam.value) saveParam.value.tempYn = 'Y';
    confirmMsg = '임시 저장을 하시겠습니까?';
  } else if(storeSurveyId) {
    if(saveParam.value) saveParam.value.surveyId = Number(storeSurveyId);
    confirmMsg = '수정 하시겠습니까?';
    method = 'put'
  }


  // 작성중, 시작전, 임시저장 상태의 설문일 시 세부 파라미터 등록 과정 진행
  if([SurveyStatus.Drafting, SurveyStatus.NotStarted, SurveyStatus.Temp].indexOf(surveyStat.value) > -1){
    // 업로드를 위한 폼데이터 생성
    surveyParamData = new FormData();

    // 이벤트 버스에서 등록된 이벤트의 키를 우선순위에 맞춰서 정렬.
    const sortedKeys = Object.keys(eventBus.eventBusList.value).sort((a: string, b: string) => {
      const [aPageSeq, aQuerySeq] = eventBus.eventBusList.value[a].priority.split('-').map(Number);
      const [bPageSeq, bQuerySeq] = eventBus.eventBusList.value[b].priority.split('-').map(Number);

      // 페이지 번호(pageSeq) 비교
      if (aPageSeq !== bPageSeq) {
        return aPageSeq - bPageSeq;
      }

      // 페이지 번호가 같으면, 쿼리 번호(querySeq) 비교
      return aQuerySeq - bQuerySeq;
    });
    // 페이지 & 쿼리 파라미터 삽입
    for (const ele of sortedKeys) {
      try {
        if (ele.indexOf('addQueryParams') > -1 || ele.indexOf('addPageParams') > -1) {
          saveParam.value = await eventBus.emit(ele, saveParam.value) as SurveyInterface;
        }
      } catch (error) {
        console.error(error);
        return;  // 파라미터 등록 예외 처리 시 중단
      }
    }

    // 파일 객체 append
    saveParam.value.attachments?.forEach(ele=>{
      surveyParamData!.append('attachments',ele);
    });
    delete (saveParam.value).attachments; // attachments는 append 후 불 필요하므로 삭제.
    surveyParamData.append(dtoName, JSON.stringify(saveParam.value));
    paramStringify.value = JSON.stringify(saveParam.value, null, 2);
  } else {
    surveyParamData = saveParam.value;
  }


  // axios 통신
  if(confirm(confirmMsg)){
    Dialog.create({
      title: '저장 안내',
      message: 'DTO가 저장되었습니다.',
      html: true, // HTML을 지원하도록 설정
    });

    // surveyAxios(path, method, surveyParamData,()=>{
    //   Dialog.create({
    //     title: '임시저장 안내',
    //     message: '임시저장 되었습니다.<br>[등록]을 클릭해야 설문조사가 완성됩니다.',
    //     html: true, // HTML을 지원하도록 설정
    //   });
    // });
  }
}


/* 탑 버튼 관리 */
const showTopButton = computed(()=>{
  // 현재 페이지에서 질문 항목이 3개 이상일 경우 true
  return store.pagePerQuerys[onPageNumber.value] as number >= SurveyOption.VisibleTopButtonNumber? true : false;
})


/* 미리보기 팝업 */
const previewModal = ref(); // 미리보기 모달 ref 정의
const previewParam = ref<SurveyInterface>(); // 미리보기 데이터
// 모달 호출
const showPreviewModal = async (): Promise<void> =>{
  // 현재 작성한 설문조사 정보 전달을 위한 파라미터 생성
  // 파라미터 생성
  previewParam.value = await eventBus.emit('createSearchParams', true) as SurveyInterface;

  // 이벤트 버스에서 등록된 이벤트의 키를 우선순위에 맞춰서 정렬.
  const sortedKeys = Object.keys(eventBus.eventBusList.value).sort((a: string, b: string) => {
    const [aPageSeq, aQuerySeq] = eventBus.eventBusList.value[a].priority.split('-').map(Number);
    const [bPageSeq, bQuerySeq] = eventBus.eventBusList.value[b].priority.split('-').map(Number);

    // 페이지 번호(pageSeq) 비교
    if (aPageSeq !== bPageSeq) {
      return aPageSeq - bPageSeq;
    }

    // 페이지 번호가 같으면, 쿼리 번호(querySeq) 비교
    return aQuerySeq - bQuerySeq;
  });
  // 페이지 & 쿼리 파라미터 삽입
  sortedKeys.forEach(async (ele) => {
    // 페이지 파라미터 삽입
    if(ele !== 'createSearchParams') previewParam.value = await eventBus.emit(ele,previewParam.value) as SurveyInterface;
  });

  previewModal.value.showModal(previewParam.value);
}


/* 설문복사 기능 - 등록된 설문에 한정 */
const copySurvey = (): void => {
  // axios 통신
  if(confirm('이 설문을 복사하시겠습니까?')){
    surveyAxios('/cmm/v1/sys/survey/copy', 'post', { surveyId: storeSurveyId },()=>{
      Dialog.create({
        title: '복사 안내',
        message: '복사 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 설문삭제 */
const deleteSurvey = (): void => {
  // axios 통신
  if(confirm('이 설문을 삭제하시겠습니까?')){
    surveyAxios('/cmm/v1/sys/qivs', 'delete', { qivsIdList: [storeSurveyId] }, ()=>{
      Dialog.create({
        title: '삭제 안내',
        message: '삭제 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 설문중지 */
const stopSurvey = (): void => {
  // axios 통신
  if(confirm('이 설문을 중지하시겠습니까?')){
    surveyAxios('/cmm/v1/sys/survey/stop?surveyId=${Number(storeSurveyId)}', 'put', {}, ()=>{
      Dialog.create({
        title: '중지 안내',
        message: '중지 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 설문 조기종료 */
const endSurvey = (): void => {
  // axios 통신
  if(confirm('조기 종료 시 설문을 재시작할 수 없습니다.<br>강제 종료하시겠습니까?')){
    surveyAxios('/cmm/v1/sys/survey/endEarly', 'put', {}, ()=>{
      Dialog.create({
        title: '종료 안내',
        message: '종료 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}


/* 설문 재시작 */
const restartSurvey = (): void => {
  // 파라미터 생성
  const params = {
    surveyId: storeSurveyId,
    surveyPrdEndDate: store.endDate,
    surveyCandAnymYn: store.surveyCandAnymYn,
    rspnModfPosbYn: store.rspnModfPosbYn
  }

  // axios 통신
  if(confirm('중지된 설문을 재시작하시겠습니까?')){
    surveyAxios('/cmm/v1/sys/survey/restart', 'put', params, ()=>{
      Dialog.create({
        title: '재시작 안내',
        message: '재시작 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 기 등록된 설문 처리 */
// 설문 상태
const surveyStat = ref(SurveyStatus.Drafting); // 기본은 작성 중 상태

// 프롭용 데이터
const surveyPropData = ref<SurveyInterface>();

// 라이프사이클 훅 - mounted
onMounted(async ()=>{
  // 기 등록된 설문조사 처리
  if(storeSurveyId){
    const surveyData = (await surveyAwaitAxios('/cmm/v1/sys/survey','get',{ surveyId: storeSurveyId })) as SurveyInterface

    // 조회 후 데이터 바인딩 처리
    surveyStat.value = surveyData.surveyStat as SurveyStatus; // 조회한 설문의 현재 상태
    surveyPropData.value = surveyData; // 필터 및 애드온 페이징에 사용

    /* 페이지 */
    // 페이지 컴포넌트 변수 생성
    surveyPageComponents.value = surveyData.surveyPageList.map((ele: SurveyPage) => {
      return {
        id: ele.pageSeq,
        name: `surveyPageComponent${ele.pageSeq}`,
        params: ele // 하위 노드에서 사용할 데이터
      }
    });
    surveyPageidx = surveyPageComponents.value.length;
  }
})

/* 컴포넌트 unmount 시 스토어 초기화 */
onUnmounted(()=>{
  store.resetState();
})
</script>

<style lang="scss">

.total_wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.wrap_table_box {
  margin: 0 !important;
}
.lh_area {
  flex: 1;
  position: relative;
}
.rh_area {
  width: 129px;
}


.set_params {
  margin: 20px 0 0 0;
  padding: 10px 25px 25px;
  border-radius: 10px;
  background-color: #fff;
}

.wrap_textarea {
  margin: 8px 0 0 0;
}
.file-add {
  margin: 8px 0 0 0;
}
.caution {
  margin: 16px 0 0 0;
  padding: 16px 0 0 0;
  border-top: 1px solid #cccccc;
  p {
    color: $grey-3;
  }
}
.handle {
  text-align: center;
  cursor: grab;
}

.input_area {
  margin: 12px 0 0 0;
}

.add_btn_ara {
  text-align: center;
  margin: 20px 0 0 0;
}

.confirm_area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 25px 0 20px;
  margin: 20px 0 0 0;
}

.btn_title3 {
  margin: 2px 0 0 10px;
  color: $grey-1;
}

.control_box {
  background-color: #fff;
  padding: 16px 12px 12px;
  border-radius: 10px;
  margin: 12px 0 0 0;
}

.page_list {
  margin: 12px 0 0 0;
}

.page_btn {
  @include flex_row_between;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  height: 40px;
  margin: 0 0 4px 0;
  &.page_btn_on {
    color: #fff;
    background-color: #2e9dd1;
    border: 1px solid #257ea7;
    .page_text {
      color: $white;
    }
  }
}

.page_add_btn {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 93px;
}

.page_text {
  color: $grey-3;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
}

.top_btn {
  position: absolute;
  right: 0;
  top: 60%;
}

.file-add {
  @include flex_row_start;
}

.icons {
  margin-left: auto;
}

.set_contents {
  padding: 25px;
  border-radius: 10px;
  background-color: #fff;
  h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }
}

.content_title_wrap {
  @include flex_row_between;
  gap: 10px;
  margin: 0 0 16px 0;
}

.dto__input {
  height: 600px;
}
</style>
