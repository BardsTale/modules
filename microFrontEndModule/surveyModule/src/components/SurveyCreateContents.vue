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
        <q-btn
          v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
          unelevated
          color="grey-3"
          class="size_sm"
          label="파일 선택"
          :class="{disabled: attachGrpList && attachGrpList.length > 0}"
          @click.prevent="addFile()"
        />
      </div>
    </div>
    <div class="caution">
      <!-- 새로 첨부될 파일 영역 -->
      <template v-if="attachGrpList && attachGrpList.length > 0">
        <template v-if="imageUrl">
          <!-- 이미지 -->
          <div class="" v-if="imageUrl" >
            <img :src="getImageUrlForDisplay(imageUrl)" alt="항목 이미지" style="max-width: 300px;" />
            <q-icon
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              name="cancel"
              class="icon_svg filter-grey-3"
              style="right: 0px; cursor: pointer;"
              @click.stop="delFile()"
            />
          </div>
        </template>
        <template v-else>
          <!-- pdf -->
          <div v-for="(file, idx) in attachGrpList" :key="idx">
            {{ file.name ? file.name : '' }}
            <q-btn
              outline
              class="size_xxs"
              color="grey-3"
              @click.prevent="delFile()"
            >
              <q-icon
                v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                name="cancel"
                class="icon_svg filter-grey-3"
              />
            </q-btn>
          </div>
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
  <CmmPctrModal
    ref="pctrModal"
    @fileFromStorage="fileReceived"
    @imageForBase64="fileReceived"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { SurveyInterface, FileObject, SurveyPage } from '@/composables/survey-interface';
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
const ALLOW_EDEXTENSIONS = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'psd', 'pdf']; // 허용된 파일 확장자
const MAX_FILE_SIZE_MB = 10; // 최대 사이즈
const imageUrl = ref(''); // 이미지 url
const pctrModal = ref(); // 공용 파일 선택 모달

// 파일 첨부 리스트
const attachGrpList = ref<Array<File>>([]);

// 파일 첨부 메소드
const addFile = () => {
  if (!(attachGrpList.value.length > 0)) {
    const param = {
      type: 'file',
      permission: {
        storage: true,
        gallery: true,
        camera: true,
      },
      option: {
        multiple: true,
      },
    };

    pctrModal.value.openModal(param);
    return;
  }
};

// 공용 파일 업로드 에밋 메소드
const fileReceived = (result: FileObject): void => {
  if (!result) return;
  const reader = new FileReader();
  const file = result.fileList[0];
  const fileSizeMB = file.size / (1024 * 1024);
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // 파일 확장자 확인
  if (!fileExtension || !ALLOW_EDEXTENSIONS.includes(fileExtension)) {
    Dialog.create({
      message: 'jpg, jpeg, png, bmp, gif, psd, pdf 확장자만 등록 가능합니다.',
    });
    return;
  }

  // 이미지 파일 또는 PDF 파일인지 본연적인 확인
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    Dialog.create({
      message: 'jpg, jpeg, png, bmp, gif, psd, pdf 확장자만 등록 가능합니다.',
    });
    return;
  }

  // 파일 크기 확인
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    Dialog.create({
      message: '10MB 이하의 1개 이미지만 첨부하실 수 있습니다.',
    });
    return;
  }

  // 이미지 처리
  if(file.type !== 'application/pdf'){
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target) {
          imageUrl.value = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  attachGrpList.value.push(result.fileList[0]);
};

// 파일 삭제 메소드
const delFile = (): void => {
  attachGrpList.value.pop();
  imageUrl.value = '';
};



/* 저장 파라미터 추가
 * (미리보기 시엔 필수값 검증하지 않음)
*/
const addParameters = (params: SurveyInterface): SurveyInterface => {
  // 필수값 미입력 예외처리
  if(!pageNm.value && !params.isPreview){
    Dialog.create({
      message: '페이지 제목이 입력되지 않았습니다.',
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
    pageImgFileUploaded: attachGrpList.value.length > 0? true : false,
    surveyQuestList:[]
  } as SurveyPage

  // 파일 처리
  if(props.sureyParams){ // 설문 수정인 경우
    if(attachGrpList.value[0] && !props.sureyParams?.pageFileRealNm) { // 이미지 신규 등록
      pageParam.pageFileDeleted = false;
      pageParam.pageFileUploaded = true;

      // 파일 등록 처리
      const reNameFile = new File([attachGrpList.value[0]], `${props.sureyParams.pageId}_${attachGrpList.value[0].name}`)
      params.attachments?.push(reNameFile);
    } else if(attachGrpList.value[0] && props.sureyParams?.pageFileRealNm && (props.sureyParams?.pageFileRealNm !== attachGrpList.value[0]?.name)) { // 이미지 변경
      pageParam.pageFileDeleted = true;
      pageParam.pageFileUploaded = true;

      // 파일 등록 처리
      const reNameFile = new File([attachGrpList.value[0]], `${props.sureyParams.pageId}_${attachGrpList.value[0]?.name}`)
      params.attachments?.push(reNameFile);
    } else if(!attachGrpList.value[0] && props.sureyParams?.pageFileRealNm) { // 이미지 삭제
      pageParam.pageFileDeleted = true;
      pageParam.pageFileUploaded = false;
    } else { // 아무 것도 아님.
      pageParam.pageFileDeleted = false;
      pageParam.pageFileUploaded = false;
    }
  } else { // 신규 설문
    // 파일 등록 처리
    if(attachGrpList.value.length > 0){
      params.attachments?.push(attachGrpList.value[0]);
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
      attachGrpList.value.push(new File([], props.sureyParams.pageFileRealNm, { type: 'image/png' }))
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
</style>
