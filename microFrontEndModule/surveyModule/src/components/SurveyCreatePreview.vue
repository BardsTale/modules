<template>
  <q-dialog
    :model-value="popupView"
    persistent
  >
    <q-card class="survey__preview respons_card inner_form">
      <q-card-section class="pop_title_wrap">
        <h3 class="title">미리보기</h3>
        <q-btn
          icon="close"
          class="btn_close"
          flat
          @click="()=>{hideModal()}"
          unelevated
          dense
        />
      </q-card-section>
      <q-card-section class="dialog_content">
        <div v-show="nowPage !== surveyPageList.length" class="survey_content">
          <!-- 헤더 및 페이지 영역 -->
          <div class="info_summary">
            <!-- 공통 헤더 -->
            <div class="badge_row">
              <q-badge :color="SURVEY_COLOR[props.surveyStat]" class="large34">{{ SURVEY_STATUS[props.surveyStat] }}</q-badge>
              <span outline class="large34" style="margin-left: 10px;">
                {{ surveyPrdStrDtm }} ~ {{ surveyPrdEndDtm }}
              </span>
            </div>

            <template v-for="(pageData, idx) in surveyPageList" :key="`page${idx}`">
              <!-- 페이지 영역 -->
              <div v-show="nowPage === idx">
                <div class="title_row">
                  <h5 class="title1">{{ pageData.pageNm || pageData.pageTitle }}</h5>
                  <p class="desc text-phara2">
                    {{ pageData.pageExpn }}
                  </p>
                </div>
                <div class="banner_row">
                  <img v-if="pageData.pageFileAwsObjNm" :src="getImageUrlForDisplay(pageData.pageFileAwsObjNm as string)" style="max-width: 680px" />
                </div>
              </div>
            </template>
          </div>

          <!-- 질문 영역 -->
          <div class="survey_answer">
            <div class="answer_top_row">
              <p class="body2">* 답변 필수</p>
            </div>
            <template v-for="(pageData, idx) in surveyPageList" :key="`page${idx}`">
              <div v-show="nowPage === idx">
                <template v-for="(surveyData, secondIdx) in pageData.surveyQuestList" :key="`survey${secondIdx}`">
                  <!-- 질문 본문 -->
                  <div class="answer_item">
                    <div class="item_title_row">
                      <q-badge color="grey-7" class="square">{{ String(secondIdx+1).padStart(2, '0') }}</q-badge>
                      <!-- 답변 필수 시 required 클래스 추가-->
                      <h6 :class="{required:surveyData.esstlYn === 'Y' || surveyData.esstlYn.toString() === 'true'}" class="title1">{{ surveyData.questTitle }}</h6>
                    </div>
                    <!-- 설명이 있을 시 표시 -->
                    <p v-if="surveyData.questExpn" class="item_desc_row text-phara2">
                      {{ surveyData.questExpn }}
                    </p>

                    <!-- 단답형 -->
                    <template v-if="surveyData.questType == QuestType.ShotAnswer">
                      <div class="item_answer_row">
                        <div class="wrap_counsel_form">
                          <div class="wrap_textarea">
                            <q-input
                              class="basic text-phara1"
                              outlined
                              v-model="dataTextObject[`${idx}_${secondIdx}_textarea`]"
                              placeholder="답변 입력란 (최대 100자)"
                              type="textarea"
                              maxlength="100"
                            >
                              <template v-slot:label>메시지 내용</template>
                            </q-input>
                            <div class="check_val">
                              <span>{{ (dataTextObject[`${idx}_${secondIdx}_textarea`] as string)?.length || '0'}}</span
                              >/<span>100자</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 장문형 -->
                    <template v-else-if="surveyData.questType == QuestType.LongAnswer">
                      <div class="item_answer_row">
                        <div class="wrap_counsel_form">
                          <div class="wrap_textarea">
                            <q-input
                              class="basic text-phara1"
                              outlined
                              v-model="dataTextObject[`${idx}_${secondIdx}_textarea`]"
                              placeholder="답변 입력란 (최대 2,000자)"
                              type="textarea"
                              maxlength="2000"
                            >
                              <template v-slot:label>메시지 내용</template>
                            </q-input>
                            <div class="check_val">
                              <span>{{ (dataTextObject[`${idx}_${secondIdx}_textarea`] as string)?.length || '0' }}</span
                              >/<span>2000자</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 단일선택형 -->
                    <template v-else-if="surveyData.questType == QuestType.SingleChoice">
                      <div class="item_input">
                        <!-- 이미지 유무에 따른 목록 형태 변경 -->
                        <template v-if="(surveyData.surveyQuestItemList as SurveyQuestItem[])?.find(ele => ele.itemImgFileAwsObjNm)">
                          <div class="row q-col-gutter-md">
                            <template v-for="(questData, thirdIdx) in surveyData.surveyQuestItemList" :key="`quest${thirdIdx}`">
                              <!-- 기타가 아닌 케이스만 처리(사유: 퍼블) -->
                              <div v-if="questData.etcAddItemYn === 'N'" class="item_box">
                                <q-card flat bordered class="brand-card">
                                  <q-card-section>
                                    <div>
                                      <q-radio
                                        v-model="dataButtonObject[`${idx}_${secondIdx}`]"
                                        :label="questData.itemNm"
                                        :val="thirdIdx+1"
                                        color="black"
                                        class="check_to_radio"
                                      />
                                    </div>
                                  </q-card-section>
                                  <q-card-section>
                                    <img
                                      v-if="questData.itemImgFileAwsObjNm"
                                      :src="getImageUrlForDisplay(questData.itemImgFileAwsObjNm as string)"
                                    />
                                  </q-card-section>
                                </q-card>
                              </div>
                            </template>
                          </div>
                          <!-- 기타 케이스 별도 처리(사유: 퍼블) -->
                          <div
                            v-if="(surveyData.surveyQuestItemList as SurveyQuestItem[])?.find(ele => ele.etcAddItemYn === 'Y')"
                            class="row q-mt-md"
                          >
                            <q-radio
                              v-model="dataButtonObject[`${idx}_${secondIdx}`]"
                              :val="surveyData!.surveyQuestItemList!.length"
                              label="기타"
                              color="black"
                            />
                            <q-input
                              v-model="dataTextObject[`${idx}_${secondIdx}_etcText`]"
                              dense
                              outlined
                              placeholder="기타 내용을 입력해 주세요"
                              class="q-ml-md"
                              style="width: 360px"
                            />
                          </div>
                        </template>
                        <template v-else>
                          <template v-for="(questData, thirdIdx) in surveyData.surveyQuestItemList" :key="`quest${thirdIdx}`">
                            <div
                              v-if="questData.etcAddItemYn === 'N'"
                              class="item"
                            >
                              <q-radio
                                v-model="dataButtonObject[`${idx}_${secondIdx}`]"
                                :label="questData.itemNm"
                                :val="thirdIdx+1"
                                color="black"
                                class="check_to_radio"
                              />
                            </div>
                            <div
                              v-else
                              class="item row"
                            >
                              <q-radio
                                v-model="dataButtonObject[`${idx}_${secondIdx}`]"
                                :val="thirdIdx+1"
                                label="기타"
                                color="black"
                              />
                              <q-input
                                v-model="dataTextObject[`${idx}_${secondIdx}_etcText`]"
                                dense
                                outlined
                                placeholder="기타 내용을 입력해 주세요"
                                class="q-ml-md"
                                style="width: 360px;"
                              />
                            </div>
                          </template>
                        </template>
                      </div>
                    </template>

                    <!-- 복수선택형 -->
                    <template v-else-if="surveyData.questType == QuestType.MultipleChoice">
                      <div class="item_input">
                        <!-- 이미지 유무에 따른 목록 형태 변경 -->
                        <template v-if="(surveyData.surveyQuestItemList as SurveyQuestItem[])?.find(ele => ele.itemImgFileAwsObjNm)">
                          <div class="row q-col-gutter-md">
                            <template v-for="(questData, thirdIdx) in surveyData.surveyQuestItemList" :key="`quest${thirdIdx}`">
                              <!-- 기타가 아닌 케이스만 처리(사유: 퍼블) -->
                              <div v-if="questData.etcAddItemYn === 'N'" class="item_box">
                                <q-card flat bordered class="brand-card">
                                  <q-card-section>
                                    <q-card-section>
                                      <div>
                                        <q-checkbox
                                          v-model="dataButtonArrayObject[`${idx}_${secondIdx}`]"
                                          :label="questData.itemNm"
                                          :val="thirdIdx+1"
                                          color="black"
                                        />
                                      </div>
                                    </q-card-section>
                                    <q-card-section>
                                      <img
                                        v-if="questData.itemImgFileAwsObjNm"
                                        :src="getImageUrlForDisplay(questData.itemImgFileAwsObjNm as string)"
                                      />
                                    </q-card-section>
                                  </q-card-section>
                                </q-card>
                              </div>
                            </template>
                          </div>
                          <!-- 기타 케이스 별도 처리(사유: 퍼블) -->
                          <div
                            v-if="(surveyData.surveyQuestItemList as SurveyQuestItem[])?.find(ele => ele.etcAddItemYn === 'Y')"
                            class="row q-mt-md"
                          >
                            <q-checkbox
                              v-model="dataButtonArrayObject[`${idx}_${secondIdx}`]"
                              :val="surveyData!.surveyQuestItemList!.length"
                              label="기타"
                              color="black"
                            />
                            <q-input
                              v-model="dataTextObject[`${idx}_${secondIdx}_etcText`]"
                              dense
                              outlined
                              placeholder="기타 내용을 입력해 주세요"
                              class="q-ml-md"
                              style="width: 360px"
                            />
                          </div>
                        </template>
                        <template v-else>
                          <template v-for="(questData, thirdIdx) in surveyData.surveyQuestItemList" :key="`quest${thirdIdx}`">
                            <div
                              v-if="questData.etcAddItemYn === 'N'"
                              class="item"
                            >
                              <q-checkbox
                                v-model="dataButtonArrayObject[`${idx}_${secondIdx}`]"
                                :label="questData.itemNm"
                                :val="thirdIdx+1"
                                color="black"
                              />
                            </div>
                            <div
                              v-else
                              class="item row"
                            >
                              <q-checkbox
                                v-model="dataButtonArrayObject[`${idx}_${secondIdx}`]"
                                :val="thirdIdx+1"
                                label="기타"
                                color="black"
                              />
                              <q-input
                                v-model="dataTextObject[`${idx}_${secondIdx}_etcText`]"
                                dense
                                outlined
                                placeholder="기타 내용을 입력해 주세요"
                                class="q-ml-md"
                                style="width: 360px"
                              />
                            </div>
                          </template>
                        </template>
                      </div>
                    </template>

                    <!-- 파일첨부형 -->
                    <template v-else-if="surveyData.questType == QuestType.FileUpload">
                      <div class="item_answer_row">
                        <div class="wrap_counsel_form">
                          <q-file
                            v-model="attachFileList[`${idx}_${secondIdx}`]"
                            :disable="Boolean(attachFileList[`${idx}_${secondIdx}`])"
                            :class="{disabled: attachFileList[`${idx}_${secondIdx}`]}"
                            :max-file-size="MAX_FILE_SIZE_MB"
                            @rejected="onFileRejected"
                            @update:model-value="addFile"
                            counter
                            fill
                            color="grey-4"
                            outlined
                            class="size_sm shadow add_item_btn"
                            label="이미지 / 파일첨부"
                            accept=".jpg, image/*"
                          >
                            <template v-slot:append>
                              <q-icon name="attachment" color="orange" />
                            </template>
                          </q-file>
                          <div style="margin-top: 10px;">
                            <template v-if="attachFileList[`${idx}_${secondIdx}`]">
                              {{ attachFileList[`${idx}_${secondIdx}`]!.name ? attachFileList[`${idx}_${secondIdx}`]!.name : '' }}
                              <q-btn
                                unelevated
                                class="size_xxs"
                                style="padding: 4px;"
                                @click.prevent="delFile(`${idx}_${secondIdx}`)"
                              >
                                <q-icon
                                  name="cancel"
                                  class="icon_svg"
                                  style="font-size: 24px;"
                                />
                              </q-btn>
                            </template>
                            <template v-else>
                              <p class="body3 text-grey-6 caution_desc">
                                * 1개의 이미지만 첨부 가능합니다.
                              </p>
                              <p class="body3 text-grey-6 caution_desc">
                                * 10MB 이하의 이미지만 첨부하실 수 있습니다.
                              </p>
                            </template>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 선호도형 -->
                    <template v-else-if="surveyData.questType == QuestType.Preference && surveyData.prfrTypeKnd == PreferType.Preference">
                      <div class="item_input">
                        <div class="q-pa-md" style="width: 400px">
                          <div class="wrap_opt_radio">
                            <q-option-group
                              class="radio_group_custom type03"
                              v-model="dataOptionObject[`${idx}_${secondIdx}`]"
                              :class="`count-${surveyData.prfrTypeMaxScr as number}`"
                              :options="makeReferOption(surveyData.prfrTypeKnd as number, surveyData.prfrTypeMaxScr as number)"
                            />
                          </div>

                          <div
                            class="row justify-between q-mt-md"
                            style="padding: 0 13px"
                          >
                            <div class="body3">{{ surveyData.prfrTypeStrItem }}</div>
                            <div class="body3">{{ surveyData.prfrTypeEndItem }}</div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 별점형 -->
                    <template v-else-if="surveyData.questType == QuestType.Preference && surveyData.prfrTypeKnd == PreferType.StarRating">
                      <div
                        class="item_answer_row"
                        @mouseleave="confirmStar"
                      >
                        <q-icon
                          v-for="(star, index) in 5"
                          :key="index"
                          class="icon_svg icon_star_score"
                          :class="getStarClass(`${idx}_${secondIdx}`, index)"
                          size="24px"
                          @mouseover="hoverStar(`${idx}_${secondIdx}`, index)"
                          @click="selectStar(`${idx}_${secondIdx}`, index)"
                        />
                      </div>
                    </template>

                    <!-- 시간 & 날짜형  -->
                    <template v-else-if="surveyData.questType == QuestType.Datetime">
                      <div class="item_answer_row row justify-start q-mt-md">
                        <template v-if="surveyData.dtmTypeKnd == DatetimeType.Date || surveyData.dtmTypeKnd == DatetimeType.DateTime">
                          <div v-show="false">{{ setDefaultDate(`${idx}_${secondIdx}`)  }}</div>
                          <q-input
                            outlined
                            v-model="startDateObject[`${idx}_${secondIdx}`]"
                            class="inp_date normal"
                            style="margin-right: 4px"
                          >
                            <template v-slot:append>
                              <q-icon
                                name="date_range"
                                class="icon_svg cursor-pointer"
                              >
                                <q-popup-proxy
                                  ref="qDateProxyFrom"
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-date
                                    minimal
                                    mask="YYYY.MM.DD"
                                    v-model="startDateObject[`${idx}_${secondIdx}`]"
                                  >
                                  </q-date>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </template>
                        <template v-if="surveyData.dtmTypeKnd == DatetimeType.Time || surveyData.dtmTypeKnd == DatetimeType.DateTime">
                          <div v-show="false">{{ setDefaultTime(`${idx}_${secondIdx}`) }}</div>
                          <q-input
                            outlined
                            v-model="searchTimeObject[`${idx}_${secondIdx}`]"
                            class="inp_date normal"
                          >
                            <template v-slot:append>
                              <q-icon
                                name="schedule"
                                class="icon_svg cursor-pointer"
                              >
                                <q-popup-proxy
                                  ref="qDateProxyFrom"
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-time
                                    minimal
                                    v-model="searchTimeObject[`${idx}_${secondIdx}`]"
                                    @update:model-value="(newValue)=>{roundTime(newValue as string, `${idx}_${secondIdx}`)}"
                                  >
                                  </q-time>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </template>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>

        <!-- 페이징 -->
        <div v-show="nowPage !== surveyPageList.length" class="btn_ctrl_area">
          <q-btn
            v-show="nowPage > 0"
            @click="()=>{decreasePage()}"
            outline unelevated class="size_md" label="이전" />
          <q-btn
            v-show="nowPage !== surveyPageList.length-1"
            @click="()=>{increasePage()}"
            fill unelevated class="size_md btn_search" label="다음"
          />
          <q-btn
            v-show="nowPage === surveyPageList.length-1"
            @click="()=>{increasePage()}"
            unelevated
            color="black"
            class="size_sm btn_search width_50"
            label="제출"
          />
        </div>

        <!-- 마지막 페이지 -->
        <div v-show="nowPage === surveyPageList.length" class="column justify-center items-center final-page">
          <q-icon name="check_circle" class="icon_svg" size="48px" />
          <p class="title1">설문에 참여해 주셔서 감사합니다.</p>
          <div class="btn_ctrl_area">
            <q-btn
              @click="hideModal"
              outline unelevated class="size_md" label="설문 목록"
            />
            <q-btn
              v-if="rspnModfPosbYn"
              @click="hideModal"
              fill
              unelevated
              class="size_md btn_search"
              label="설문 수정"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { date } from 'quasar';
import type { SimpleObject, FileListObject, TimeObject, SurveyPage, SurveyInterface, JsonArray, SurveyQuestItem } from '@/composables/survey-interface';
import { SurveyOption, QuestType, PreferType, DatetimeType,  } from '@/composables/survey-interface';
import { Dialog } from 'quasar';

/* 프롭 선언 */
const props = defineProps({
  surveyId: { // 설문 고유 id, 저장된 설문 미리보기인 경우
    type: String,
    required: false,
  },
  surveyStat: {
    type: Number,
    required: true
  }
});


/* 설문조사 미리보기 헤더 영역 */
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
  1: 'green-5',
  2: 'green-5',
  3: 'green-5',
  4: 'skyblue-7',
  5: 'yellow-10',
  6: 'grey-6',
  7: 'grey-6',
  8: 'green-5'
};
const surveyPrdStrDtm = ref(); // 설문 시작일
const surveyPrdEndDtm = ref(); // 설문 종료일
const rspnModfPosbYn = ref(false); // 설문 수정가능 여부


/* 설문조사 미리보기 페이지 영역 */
const surveyPageList = ref<SurveyPage[]>([]) // 설문 페이지 리스트

// 이미지 표시 메서드
const getImageUrlForDisplay = (fileKey: string): string => {
  return fileKey;
};

/* 설문조사 질문 영역 */
const dataTextObject = ref<SimpleObject>({}); // 직접 기입하는 text 바인딩용.
const dataButtonObject = ref<SimpleObject>({}); // 라디오버튼 바인딩용.
const dataButtonArrayObject = ref<JsonArray>(
  (() => {
    const obj: { [key: string]: number[] } = {};
    const maxIdx = SurveyOption.ItemPerQuery; // 최대 인덱스 값

    for (let idx = 0; idx <= maxIdx; idx++) {
      for (let secondIdx = 0; secondIdx <= maxIdx; secondIdx++) {
        const key = `${idx}_${secondIdx}`;
        obj[key] = []; // 빈 배열로 초기화
      }
    }

    return obj;
  })()
); // 체크버튼 바인딩용.(배열 인식을 위해 맥시멈 값까지 미리 설정)
const dataOptionObject = ref<SimpleObject>({}); // 선호도형 바인딩용.


/* 선호도형 */
// 선호도 옵션 생성 메서드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeReferOption = (startPoint: number, endPoint: number): Array<any> => {
  const result = Array.from({ length: endPoint - startPoint + 1 }, (_, i) => ({
    label: `${startPoint + i}`,
    value: startPoint + i,
  }));
  return result;
}


/* 별점형 */
const hoveredIndexObject = ref<SimpleObject>({}); // 현재 호버 된 인덱스를 저장하는 객체
const selectedIndexObject = ref<SimpleObject>({}); // 최종 클릭 된 인덱스를 저장하는 객체
// 별점 클래스 설정
const getStarClass = (key: string, index: number): string => {
  return hoveredIndexObject.value[key] as number >= index ? 'icon-star-on' : 'icon-star-off';
};
// 호버 이벤트
const hoverStar = (key:string, index: number): void => {
  hoveredIndexObject.value[key] = index;
}
// 클릭 이벤트 (선택된 별점 유지)
const selectStar = (key: string, index: number): void => {
  selectedIndexObject.value[key] = index;
};
// 호버아웃 시 클릭된 index로 별점 설정
const confirmStar = (): void => {
  if(Object.keys(selectedIndexObject.value).length > 0){
    hoveredIndexObject.value = {...selectedIndexObject.value};
  } else {
    hoveredIndexObject.value = {};
  }
};


/* 첨부파일 폼 */
// 파일 업로드 로직(보여주기 용)
const MAX_FILE_SIZE_MB = ref(1024*1024); // 최대 사이즈

// 파일 첨부 리스트
const attachFileList = ref<FileListObject>({});

// 파일 첨부 메소드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFile = (value: any) => {
  console.log(value)
};

// 공용 파일 첨부부 에밋 메소드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onFileRejected = (rejectedEntries: any[]) => {
  if(rejectedEntries[0].failedPropValidation === 'max-file-size'){
    Dialog.create({
      message: '10MB 이하의 1개 이미지만 첨부하실 수 있습니다.',
    });
  }
  if(rejectedEntries[0].failedPropValidation === 'accept'){
    Dialog.create({
      message: 'jpg, jpeg, png, bmp, gif, psd, pdf 확장자만 등록 가능합니다.',
    });
  }
}

// 파일 삭제 메소드
const delFile = (key: string): void => {
  delete attachFileList.value[key];
};


/* 날짜형 */
const { formatDate } = date;
const today = new Date();
const startDate = ref(formatDate(today, 'YYYY.MM.DD')); // 디폴트 날짜
const searchTime = ref('12:00'); // 디폴트 시간
const startDateObject = ref<SimpleObject>({});
const searchTimeObject = ref<TimeObject>({});

// 30분 단위로 시간을 반올림하는 함수
const roundTime = (newTime: string, key: string): void => {
  const [hours, minutes] = newTime.split(':').map(Number);

  // 30분 단위로 반올림
  const roundedMinutes = Math.round(minutes / 30) * 30;

  // 시간과 분을 2자리 문자열로 포맷
  const roundedHours = hours + Math.floor(roundedMinutes / 60);
  const formattedHours = String(roundedHours % 24).padStart(2, '0');
  const formattedMinutes = String(roundedMinutes % 60).padStart(2, '0');

  // 새로운 시간 문자열 생성
  const roundedTime = `${formattedHours}:${formattedMinutes}`;

  // 시간을 업데이트
  searchTimeObject.value[key] = roundedTime;
};

// 최초 디폴트 날짜값 지정 메서드
const setDefaultDate = (key: string): void => {
  if(!startDateObject.value[key]) startDateObject.value[key] = startDate.value;
}
const setDefaultTime = (key: string): void => {
  if(!searchTimeObject.value[key]) searchTimeObject.value[key] = searchTime.value;
}



/* 설문조사 페이징 */
const nowPage = ref(0); // 현재 활성화 된 페이지
const increasePage = (): void => {
  // 필수값 미입력 예외처리
  let validationText = ''; // 예외처리 문구
  const questList = (surveyParams.value as SurveyInterface).surveyPageList[nowPage.value].surveyQuestList;
  questList.some((ele, idx) => {
    if(ele.esstlYn === 'Y'){
      // 단일 & 복수 선택 기타 항목 존재 시 index
      const etcItemIdx = ele.surveyQuestItemList?.reduce((acc: number, innerEle: SurveyQuestItem, idx: number) => {
        if(innerEle.etcAddItemYn === 'Y') acc = idx+1;
        return acc;
      },0) as number;

      // 타입별 예외처리(날짜형은 디폴트값이 있으므로 제외)
      switch(ele.questType as QuestType){
        // 단문 & 장문
        case QuestType.ShotAnswer:
        case QuestType.LongAnswer:
          if(!dataTextObject.value[`${nowPage.value}_${idx}_textarea`]) {
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}번이 입력되지 않았습니다.`
          }
        break;

        // 단일 선택
        case QuestType.SingleChoice:
          if(!dataButtonObject.value[`${nowPage.value}_${idx}`]) {
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}번이 선택되지 않았습니다.`
          }
          // 기타 선택
          if(etcItemIdx === dataButtonObject.value[`${nowPage.value}_${idx}`] &&
             !dataTextObject.value[`${nowPage.value}_${idx}_etcText`]) {
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}번의 기타 항목이 입력되지 않았습니다.`
          }
        break;

        // 복수 선택
        case QuestType.MultipleChoice:
          if(!dataButtonArrayObject.value[`${nowPage.value}_${idx}`].length) {
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}번이 선택되지 않았습니다.`
          }
          // 기타 선택
          if(dataButtonArrayObject.value[`${nowPage.value}_${idx}`].indexOf(etcItemIdx) > -1 &&
             !dataTextObject.value[`${nowPage.value}_${idx}_etcText`]) {
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}번의 기타 항목이 입력되지 않았습니다.`
          }
        break;

        // 첨부파일
        case QuestType.FileUpload:
          if(!Boolean(attachFileList.value[`${nowPage.value}_${idx}`])){
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}의 첨부파일이 등록되지 않았습니다.`
          }
        break;

        // 선호도
        case QuestType.Preference:
          if(ele.prfrTypeKnd == PreferType.Preference && !dataOptionObject.value[`${nowPage.value}_${idx}`]){ // 선호도
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}의 선호도가 선택되지 않았습니다.`
          } else if(ele.prfrTypeKnd == PreferType.StarRating && !hoveredIndexObject.value[`${nowPage.value}_${idx}`]){ // 별점
            validationText = `필수 항목 ${nowPage.value+1}페이지의 ${idx+1}의 별점이 선택되지 않았습니다.`
          }
        break;
      }
    }
    return validationText;
  });

  // 예외처리 문구가 있는 경우 얼럿 후 이동 중단.
  if(validationText){
    Dialog.create({
      message: `${validationText}`,
    });
    throw new Error(`${validationText}`);
  }

  if(nowPage.value !== surveyPageList.value.length) nowPage.value++;
}
const decreasePage = (): void => {
  if(nowPage.value !== 0) nowPage.value--;
}


/* 이니셜라이징 & 파이널라이징 */
const surveyParams = ref<SurveyInterface>(); // 미등록 설문조사 데이터(파라미터 형태)
// 이니셜라이저 메소드
const init = (): void => {
  // 데이터 바인딩
  surveyPrdStrDtm.value = surveyParams.value!.surveyPrdStrDate // 설문 시작일
  surveyPrdEndDtm.value = surveyParams.value!.surveyPrdEndDate // 설문 종료일
  rspnModfPosbYn.value = Boolean(surveyParams.value!.surveyRsltMpblcYn === 'Y') // 설문 수정 유무
  surveyPageList.value = surveyParams.value!.surveyPageList // 설문 페이지 정보
}

// 파이널라이저 메소드
const fin = (): void => {

  //페이징
  nowPage.value = 0;

  // 단답, 장문, 단일, 다중, 선호도
  dataTextObject.value = {}; // 직접 기입하는 text 바인딩용.
  dataButtonObject.value = {}; // 라디오버튼 바인딩용.
  dataButtonArrayObject.value = (() => { // 체크버튼 바인딩용.
    const obj: { [key: string]: number[] } = {};
    const maxIdx = SurveyOption.ItemPerQuery; // 최대 인덱스 값

    for (let idx = 0; idx <= maxIdx; idx++) {
      for (let secondIdx = 0; secondIdx <= maxIdx; secondIdx++) {
        const key = `${idx}_${secondIdx}`;
        obj[key] = []; // 빈 배열로 초기화
      }
    }

    return obj;
  })();
  dataOptionObject.value = {}; // 선호도형 바인딩용.

  // 별점형
  hoveredIndexObject.value = {};

  // 파일첨부형
  attachFileList.value = {};

  // 날짜형
  startDateObject.value = {};
  searchTimeObject.value = {};
}


/* 모달 컨트롤 */
const popupView = ref(false); // 모달 등장 여부
// 모달 등장 메서드
const showModal = (previewParam: SurveyInterface)=>{
  surveyParams.value = previewParam;
  popupView.value = true;
  init(); // 모달 등장 시 init.
}

// 모달 닫힘 이벤트
const hideModal = ()=>{
  popupView.value = false; // 모달 등장 여부
  fin();
}


/* 외부 노출 메소드 */
defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.survey{
  &__preview{
    min-width: 1080px;
  }
}

.total_wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
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
.survey-table {
  width: 100%;
  border-collapse: collapse;
  border-top: 1px solid #000;
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
  gap: 20px;
}

.edit_complete {
  margin: 20px 0 0 0;
  padding: 10px 25px 25px;
  border-radius: 10px;
  background-color: #fff;
}
.title_with_tag {
  @include flex_row_start;
  gap: 10px;
}

.title_tag {
  padding: 3px 10px;
  background-color: $grey-3;
  color: $white;
  border-radius: 4px;
  line-height: 16px;
}

.title_text {
  &::after {
    content: '*';
    display: inline-block;
    color: $orange;
    margin: 0 0 0 4px;
  }
}

.icons {
  margin-left: auto;
}

.content_title_wrap {
  @include flex_row_between;
  gap: 10px;
  margin: 0 0 16px 0;
}

.text-phara2 {
  margin: 8px 0 0 0;
  color: $grey-3;
}

// 설문결과 탭 스타일들
.no_result {
  background-color: $white;
  box-shadow: 4px 6px 4px 0px #0000000a;
  width: 100%;
  height: calc(100vh - 235px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.info_summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  border: 1px solid $primary;
  box-shadow: 4px 6px 4px 0px #0000000a;
  border-radius: 10px;
  padding: 25px;
  background-color: $white;
}

.info_row {
  @include flex_row_start;
  gap: 20px;
  width: 100%;
}

.wrap_with_icon {
  @include flex_row_start;
  gap: 10px;
}

.color_orange {
  color: $orange !important;
}

.color_grey_3 {
  color: $grey-3 !important;
}

.control_btn {
  @include flex_row_start;
  gap: 10px;
  margin: 20px 0 0 0;
}

.info_body_top {
  @include flex_row_start;
  margin: 20px 0 16px 0;
  height: 40px;
  .body1 {
    color: $grey-3;
  }
}

.survey_item {
  padding: 25px;
  border-radius: 10px;
  background-color: $white;
  margin: 10px 0 0 0;
}

.item_title_row {
  @include flex_row_start;
  margin: 24px 0 0 0;
  h5 {
    &::after {
      content: '*';
      display: inline-block;
      color: $orange;
      margin: 0 0 0 4px;
    }
  }
  .engage_info {
    margin-left: auto;
    @include flex_row_start;
    gap: 20px;
  }
  .item_description {
    margin: 16px 0 0 0;
    color: $grey-3;
  }
}

.item_title_col {
  @include flex_col_center_start;
  margin: 24px 0 0 0;
  gap: 16px;
  h5 {
    &::after {
      content: '*';
      display: inline-block;
      color: $orange;
      margin: 0 0 0 4px;
    }
  }
  .survey_info {
    width: 100%;
    @include flex_row_between;
    span {
      color: $grey-5;
      &.active {
        color: $grey-1;
      }
    }
  }
}

.item_content_row {
  margin: 16px 0 0 0;
  .input_data {
    margin: 8px 0 0 0;
  }
}

.info_footer {
  margin: 20px 0 0 0;
  @include flex_col_center_center;
}

.btn_more {
  @include flex_col_center_center;
  margin: 16px 0 0 0;
}

.etc_area {
  @include flex_col_center_start;
  width: 100%;
  gap: 16px;
  margin: 24px 0 0 0;
}

.no_data {
  @include flex_col_center_center;
  width: 100%;
  height: 240px;
  gap: 20px;
  background-color: $grey-8;
  .title1 {
    color: $grey-3;
  }
}

.msg_icon_box {
  @include flex_col_center_center;
  width: 60px;
  height: 60px;
  background-color: $white;
  border: 1px solid $grey-6;
  border-radius: 50%;
}

.survey_answer {
  margin-top: 30px;
  .answer_top_row {
    padding-bottom: 16px;
    p {
      color: $red;
    }
  }

  .answer_item {
    padding: 25px;
    background-color: $white;
    margin: 0 0 10px 0;
    border-radius: 10px;
  }

  .item_title_row {
    @include flex_row_start;
    gap: 10px;
    h6 {
      color: $grey-1;
    }
  }

  .item_desc_row {
    margin: 8px 0 0 0;
    color: $grey-3;
  }

  .item_answer_row {
    margin: 12px 0 0 0;
  }
  .select_item {
    max-width: 200px;
  }
  .option_radio {
    width: 400px;
    padding: 0;
  }
  .required {
    &::after {
      content: '*';
      color: $red;
      margin-left: 4px;
    }
  }
}

.survey_btn_footer {
  @include flex_row_center;
  padding: 25px 0 0 0;
  margin: 20px 0 0 0;
  width: 100%;
  gap: 10px;
}

.survey_final_page {
  @include flex_col_center_center;
  width: 100%;
  height: 100%;
  min-height: 800px;
  border-radius: 10px;
  background-color: $white;
  gap: 20px;
  p {
    color: $grey-3;
  }
  .btn_ctrl_area {
    @include flex_row_center;
    gap: 10px;
  }
}

body {
  &.screen--sm {
    .table_search_area.type_flexable .search_item.wrap_date .inner_wrap {
      display: block;
    }

    .table_search_area.type_flexable .tilde {
      height: 14px;
      font-size: 0;
    }
  }
}

.board_table {
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    background-color: #f5f5f5;
  }

  tbody tr {
    height: 40px !important;
  }

  tbody tr:first-of-type td {
    border-top: 0 none !important;
  }
  tbody tr:last-of-type td {
    border-bottom: 0 none !important;
  }

  .board_badge {
    margin-bottom: 4px;
  }

  .board_col_tit_link {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  .result_btn {
    color: #262626;
    background: #ededed;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 0 20px;
  }

  .disable-btn {
    opacity: 0.5;
  }
}

.q-tr {
  height: 40px !important;
  th,
  td {
    padding: 0 16px !important;
    height: 40px !important;
  }
}

.pagination_container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notice_area {
  margin-top: 30px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: $grey-1;
  background-color: $grey-8;
  border-radius: 8px;
  .q-icon {
    margin-right: 5px;
    color: $grey-3;
  }
  .divider {
    color: #c6c6c6;
  }
  .descript {
    color: $grey-3;
  }
}

.total_wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  .wrap_table_box {
    margin: 0 0 20px 0 !important;
  }
  .lh_area {
    flex: 1;
    position: relative;
  }
  .rh_area {
    width: 129px;
  }
  .survey-table {
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid #000;
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

  .set_contents {
    padding: 25px;
    border-radius: 10px;
    background-color: #fff;
    h4 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    &.mt_20 {
      margin-top: 20px;
    }
  }

  .set_params {
    margin: 20px 0 0 0;
    padding: 10px 25px 25px;
    border-radius: 10px;
    background-color: #fff;
    .item-row {
      display: flex;
      align-items: center;
      margin-top: 8px;
      .photo-icon {
        margin-left: 10px;
      }
      .handle {
        cursor: grab;
        margin: 0 9px 0 0;
      }
      &.mt12 {
        margin-top: 12px;
      }
      .btn_add {
        width: 100%;
        height: 40px;
        @include flex_row_center;
        border-radius: 8px;
        border: 1px solid $grey-5;
        background-color: $grey-7;
      }
      &.fav_type_top {
        gap: 24px;
      }
      &.fav_type_btm {
        gap: 20px;
        .q-input {
          width: 160px;
        }
        .q-select {
          width: 80px;
        }
      }
    }
    .button-row {
      margin-top: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .image_upload_area,
    .item_setting_area {
      margin: 16px 0 0 0;
    }
    .params_top {
      gap: 20px;
    }
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
    gap: 20px;
  }

  .edit_complete {
    margin: 20px 0 0 0;
    padding: 10px 25px 25px;
    border-radius: 10px;
    background-color: #fff;
    .item_input {
      margin: 12px 0 0 0;
      .caution_desc {
        &:first-of-type {
          margin-top: 12px;
        }
        margin-top: 8px;
      }
      .q-pa-md {
        width: 400px;
        padding: 0;
      }
    }
    .brand-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16px;
      > div {
        padding: 0;
      }
    }

    .brand-logo {
      max-width: 100%;
      height: auto;
    }
  }
  .title_with_tag {
    @include flex_row_start;
    gap: 10px;
  }

  .title_tag {
    padding: 3px 10px;
    background-color: $grey-3;
    color: $white;
    border-radius: 4px;
    line-height: 16px;
  }

  .title_text {
    &::after {
      content: '*';
      display: inline-block;
      color: $orange;
      margin: 0 0 0 4px;
    }
  }

  .icons {
    margin-left: auto;
  }

  .content_title_wrap {
    @include flex_row_between;
    gap: 10px;
    margin: 0 0 16px 0;
  }

  .preview_content {
    color: $grey-3;
  }

  .radio_area {
    margin: 8px 0 0 0;
  }

  .icon_star_score {
    margin: 0 8px 0 0;
    width: 24px;
    height: 24px;
  }
}

.respons_card.type_alarm {
  width: 340px !important;
}

.pop_title_wrap {
  .title3 {
    font-size: 18px !important;
    font-weight: bold !important;
    color: $grey-1;
  }
}

.confirm_dialog_content {
  text-align: center !important;
  .confirm_control_area {
    @include flex_row_center;
    gap: 10px;
    margin: 30px 0 0 0;
  }
}

.dialog_content {
  .board_table {
    display: block !important;
  }
  .info_summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    border: 1px solid $primary;
    box-shadow: 4px 6px 4px 0px #0000000a;
    border-radius: 10px;
    padding: 30px;
    background-color: $white;
  }

  .info_row {
    @include flex_row_start;
    gap: 20px;
    width: 100%;
  }

  .desc {
    color: $grey-3;
    margin: 8px 0 0 0;
  }

  .survey_answer {
    margin-top: 30px;
  }

  .answer_top_row {
    border-bottom: 1px solid #ccc;
    padding-bottom: 16px;
    p {
      color: $red;
    }
  }

  .answer_item {
    padding: 25px;
    border-bottom: 1px solid #ccc;
    border-radius: 0;
  }

  .item_title_row {
    @include flex_row_start;
    gap: 10px;
    h6 {
      color: $grey-1;
    }
  }

  .item_desc_row {
    margin: 8px 0 0 0;
    color: $grey-3;
  }

  .item_answer_row {
    margin: 12px 0 0 0;
  }

  .required {
    &::after {
      content: '*';
      color: $red;
      margin-left: 4px;
    }
  }

  .etc_input {
    @include flex_row_start;
    gap: 10px;
  }

  .btn_ctrl_area {
    @include flex_row_center;
    gap: 10px;
    margin-top: 30px;
  }
}

.text-decoration {
  text-decoration: underline;
}

.item_input{
  margin: 12px 0 0 0;
}

.final-page {
  min-height: 480px;
  height: 100%;
  gap: 20px;
  p {
    color: $grey-3;
  }
}

.btn_ctrl_area {
  @include flex_row_center;
  gap: 10px;
}

.large34 {
  border-radius: 20px;
  height: 34px;
  padding: 2px 16px;
  font-size: 16px;

  &.q-badge--outline {
    color: #000 !important;
    border-color: $grey-6 !important;
  }
}

.square {
  border-radius: 8px;
  height: 24px;
  padding: 4px 12px;
  font-size: 16px;
}
.btn_close {
  position: absolute;
  right: 5px;
  top: 0;
  font-size: 24px;
}
// 선호도 별점
.icon-star-on {
  background-image: url('../../public/icons/icon_star_on.svg');
}

.icon-star-off {
  background-image: url('../../public/icons/icon_star_off.svg');
}
</style>
