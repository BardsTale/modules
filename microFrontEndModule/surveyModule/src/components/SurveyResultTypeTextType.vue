<template>
<div class="survey_item">
  <div class="item_top_row">
    <q-badge color="blue2" class="large34">{{ props.resultData.questTypeNm }}</q-badge>
  </div>
  <div class="item_title_row">
    <h6
      :class="{required: props.resultData.esstlYn === 'Y'}"
      class="title1"
    >
      {{ `${props.resultNumber}. ${props.resultData.questTitle}` }}
    </h6>
    <div class="engage_info">
      <p class="body2 color_grey_3">
        참여 <span class="body1 color_orange">{{ props.resultData.questPtctCnt }}</span>
      </p>
      <p class="body2 color_grey_3">
        미참여 <span class="body1 color_grey_3">{{ props.resultData.questNonPtctCnt }}</span>
      </p>
    </div>
  </div>
  <div class="item_content_row">
    <template v-if="props.resultData.questType === QuestType.FileUpload">
      <q-input
        v-for="(item, idx) in props.resultData.attchFileList"
        v-show="idx < 5 || allOfThem"
        @click="() => downloadFile(item.awsObjNm, item.fileRealNm)"
        :key="`item-${idx}`"
        v-model="item.fileRealNm"
        outlined
        placeholder="read only"
        dense
        readonly
        class="input_data input__pointer"
      />
    </template>
    <template v-else-if="props.resultData.questType === QuestType.Datetime">
      <q-input
        v-for="(item, idx) in props.resultData.dtmRspnValList"
        :key="`item2-${idx}`"
        v-show="idx < 5 || allOfThem"
        v-model="props.resultData.dtmRspnValList![idx]"
        outlined
        placeholder="read only"
        dense
        readonly
        class="input_data"
      />
    </template>
    <template v-else>
      <q-input
        v-for="(item, idx) in props.resultData.rspnCntnList"
        :key="`item2-${idx}`"
        v-show="idx < 5 || allOfThem"
        v-model="props.resultData.rspnCntnList![idx]"
        outlined
        placeholder="read only"
        dense
        readonly
        class="input_data"
      />
    </template>
  </div>
  <div
    v-if="(props.resultData.rspnCntnList && props.resultData.rspnCntnList.length > 5) ||
          (props.resultData.attchFileList && props.resultData.attchFileList.length > 5)"
    class="btn_more"
  >
    <q-btn
      v-if="!allOfThem"
      @click="allOfThem = true"
      outline
      unelevated
      class="size_sm"
      label="더보기"
    />
  </div>
</div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { QuestType, SurveyResultQuest } from '../src/composables/survey-interface';
import axios from 'axios';

/* 프롭 선언 */
const props = defineProps({
  resultData: {
    type: Object as PropType<SurveyResultQuest>,
    required: true
  },
  resultNumber: {
    type: Number,
    required: true
  }
})

const allOfThem = ref(false); // 전체 항목 보기


/* 파일 다운로드 */
const downloadFile = async (fileKey: string, fileName: string): Promise<void> => {
  try {
    const response = await axios.get(`${process.env.API_URL}/fil/download?fileKey=${fileKey}&fileName=${fileName}`, {
      responseType: 'blob', // Blob 타입으로 응답을 받음
    })

    // Blob에서 URL 생성
    const url = window.URL.createObjectURL(new Blob([response.data]))

    // a 태그를 생성하여 다운로드 링크 설정
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName) // 다운로드 파일명 설정
    document.body.appendChild(link)
    link.click() // 링크 클릭으로 다운로드 시작

    // 메모리 정리
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('이미지 다운로드 실패:', error)
  }
}
</script>

<style lang="scss">
.input__pointer input {
  cursor: pointer !important;
}

@media print {
  .btn_more {
    display: none !important;
  }
}
</style>
