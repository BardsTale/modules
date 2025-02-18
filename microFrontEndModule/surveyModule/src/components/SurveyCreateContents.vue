<template>
  <div class="set_contents">
    <div class="content_title_wrap">
      <h4 class="title1" style="margin: 0">내용입력</h4>
      <q-icon
        v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1 && props.surveyPageSeq > 0"
        @click="removePage"
        name="delete_outline"
        class="icon_svg"
        style="font-size: 25px; left: 10px; cursor: pointer;"
      />
    </div>
    <div class="wrap_counsel_form">
      <q-input
        :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
        outlined
        v-model="pageNm"
        placeholder="제목을 입력해주세요"
        maxlength="50"
      />
      <div class="wrap_textarea">
        <q-input
          :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
          class="basic text-phara1"
          outlined
          v-model="pageExpn"
          placeholder="내용을 입력해주세요"
          type="textarea"
          input-style="padding: 10px 0"
          maxlength="2000"
        >
          <template v-slot:label>메시지 내용</template>
        </q-input>
        <div class="check_val text-phara2">
          <span>{{ pageExpn.length }}</span
          >&nbsp;/&nbsp;
          <span>2,000</span>
        </div>
      </div>
    </div>
    <div class="file-add" style="display: inline-block">
      <div class="row-4">
        <q-file
          v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
          v-model="attachImage"
          :disable="Boolean(attachImage)"
          :class="{disabled: attachImage}"
          :max-file-size="MAX_FILE_SIZE_MB"
          @rejected="onFileRejected"
          @update:model-value="addFile"
          fill
          color="grey-4"
          outlined
          counter
          class="size_sm shadow add_item_btn"
          label="이미지 / 파일첨부"
          accept=".jpg, .jpg, .jpeg, .png, .bmp, .gif, .psd, .pdf"
        >
          <template v-slot:append>
            <q-icon name="attachment" color="orange" />
          </template>
        </q-file>
      </div>
    </div>
    <div class="caution">
      <!-- 새로 첨부될 파일 영역 -->
      <template v-if="attachImage">
        <template v-if="imageUrl">
          <!-- 이미지 -->
          <div class="" v-if="imageUrl" >
            <img :src="getImageUrlForDisplay(imageUrl)" alt="항목 이미지" style="max-width: 300px;" />
            <q-icon
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              @click.stop="delFile()"
              name="cancel"
              class="icon_svg filter-grey-3"
              style="font-size: 20px; left: 5px; cursor: pointer;"
            />
          </div>
        </template>
        <template v-else>
          <!-- pdf -->
          {{ attachImage.name ? attachImage.name : '' }}
          <q-btn
            unelevated
            class="size_xxs"
            style="padding: 4px;"
            @click.prevent="delFile()"
          >
            <q-icon
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              name="cancel"
              class="icon_svg"
              style="font-size: 24px;"
            />
          </q-btn>
        </template>
      </template>
      <template v-else>
        <template v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1">
          <p class="body3">
            * 10MB 이하의 1개 이미지만 첨부하실 수 있습니다.
          </p>
          <p class="body3">
            * jpg, jpeg, png, bmp, gif, psd, pdf 확장자만 등록
            가능합니다
          </p>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { SurveyInterface, SurveyPage } from '@/composables/survey-interface';
import { SurveyStatus } from '@/composables/survey-interface';
import eventBus from '@/composables/survey-event-bus';
import { Dialog } from 'quasar';

/* 에밋 선언 */
const emit = defineEmits(['removeSurveyPage']); // 현재 설문 페이지 삭제

/* 프롭 선언 */
const props = defineProps({
  surveyPageNumber: { // 설문 페이지 고유 번호
    type: Number,
    required: true
  },
  surveyPageSeq:{ // 설문 페이지 순번
    type: Number,
    required: true
  },
  sureyParams:{ // 등록 설문일 시 데이터
    type: Object,
    required: true
  },
  surveyStat:{ // 설문 상태
    type: Number,
    required: true
  },
});


/* 컨텐츠 작성 */
const pageNm = ref(''); // 페이지 제목
const pageExpn = ref(''); // 페이지 내용



/* 페이지 삭제 */
const removePage = () => {
  if(confirm('페이지를 삭제하시겠습니까?')){
    emit('removeSurveyPage', props.surveyPageNumber);
  }
}


/* 파일 업로드 */
const MAX_FILE_SIZE_MB = ref(1024*1024); // 최대 사이즈
const imageUrl = ref(''); // 이미지 url

// 첨부 이미지
const attachImage = ref<File|null>(null);

// 파일 첨부 메소드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addFile = (file: any) => {
  if (file) {
    const selectedFile = file;
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      imageUrl.value = URL.createObjectURL(selectedFile);
    }
  }
};

// 공용 파일 업로드 에밋 메소드
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
const delFile = (): void => {
  attachImage.value = null;
  imageUrl.value = '';
};



/* 저장 파라미터 추가
 * (미리보기 시엔 필수값 검증하지 않음)
*/
const addParameters = (params: SurveyInterface): SurveyInterface => {
  // 필수값 미입력 예외처리
  if(!pageNm.value && !params.isPreview){
    Dialog.create({
      message: `${props.surveyPageSeq+1}페이지 제목이 입력되지 않았습니다.`,
    });
    throw new Error('페이지 제목이 입력되지 않았습니다.');
  }

  // push 할 파라미터 생성
  const pageParam = {
    pageId: props.sureyParams?.pageId,
    pageFakeId: props.surveyPageNumber, // 고유값 다 사용 후 제거.
    pageSeq: props.surveyPageSeq+1,
    pageTitle: pageNm.value,
    pageExpn: pageExpn.value,
    pageFileAwsObjNm: imageUrl.value,
    pageImgFileUploaded: attachImage.value? true : false,
    surveyQuestList:[]
  } as SurveyPage

  // 파일 처리
  if(props.sureyParams){ // 설문 수정인 경우
    if(attachImage.value && !props.sureyParams?.pageFileRealNm) { // 이미지 신규 등록
      pageParam.pageFileDeleted = false;
      pageParam.pageFileUploaded = true;

      // 파일 등록 처리
      const reNameFile = new File([attachImage.value], `${props.sureyParams.pageId}_${attachImage.value.name}`)
      params.attachments?.push(reNameFile);
    } else if(attachImage.value && props.sureyParams?.pageFileRealNm && (props.sureyParams?.pageFileRealNm !== attachImage.value.name)) { // 이미지 변경
      pageParam.pageFileDeleted = true;
      pageParam.pageFileUploaded = true;

      // 파일 등록 처리
      const reNameFile = new File([attachImage.value], `${props.sureyParams.pageId}_${attachImage.value.name}`)
      params.attachments?.push(reNameFile);
    } else if(!attachImage.value && props.sureyParams?.pageFileRealNm) { // 이미지 삭제
      pageParam.pageFileDeleted = true;
      pageParam.pageFileUploaded = false;
    } else { // 아무 것도 아님.
      pageParam.pageFileDeleted = false;
      pageParam.pageFileUploaded = false;
    }
  } else { // 신규 설문
    // 파일 등록 처리
    if(attachImage.value){
      params.attachments?.push(attachImage.value);
    }
  }
  params['surveyPageList'].push(pageParam);

  return params;
}

/* 이벤트 버스 사용. */
// 이벤트 버스 등록 메소드
const registerEventListener = () => {
  eventBus.on(`addPageParams${props.surveyPageNumber}`, addParameters, `${props.surveyPageSeq+1}-0`);
  eventBus.on(
    `addPageParams${props.surveyPageNumber}`,
    addParameters,
    `${props.surveyPageSeq + 1}-0`
  );
};

// 이벤트 버스 해제 메소드
const unregisterEventListener = () => {
  eventBus.off(`addPageParams${props.surveyPageNumber}`);
};

// props.surveyPageSeq 또는 props.querySeq가 변경될 때 이벤트 리스너를 재등록
watch(
  () => [props.surveyPageSeq],
  () => {
    unregisterEventListener();
    registerEventListener();
  }
);

// 컴포넌트가 마운트될 때 이벤트 리스너 등록
onMounted(() => {
  registerEventListener();
});

// 컴포넌트가 언마운트될 때 이벤트 리스너 해제
onUnmounted(() => {
  unregisterEventListener();
});


/* 등록 설문일 경우 데이터 바인딩 */
watch(() => props.sureyParams, () => {
  if(props.sureyParams){
    pageNm.value = props.sureyParams.pageNm;
    pageExpn.value = props.sureyParams.pageExpn;

    if(props.sureyParams.pageFileAwsObjNm){
      imageUrl.value = props.sureyParams.pageFileAwsObjNm;
      attachImage.value = new File([], props.sureyParams.pageFileRealNm, { type: 'image/png' });
    }
  }
},{ deep: true, immediate: true });

// 이미지 표시 메서드
const getImageUrlForDisplay = (fileKey: string): string => {
  return fileKey;
};
</script>

<style lang="scss" scoped>


.icon-trash-can {
  cursor: pointer;
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

.file-add {
  @include flex_row_start;
}

.set_contents {
  margin-top: 25px;
  padding: 25px;
  border-radius: 10px;
  border: #ccc 1px solid;
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
</style>
