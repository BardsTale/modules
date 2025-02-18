<template>
<div class="page_btn"
  :class="{'page_btn_on':pageNumber === onPageNumber}"
  @click="onPage(pageNumber)"
>
  <span class="page_text">{{ padPageNumber }}</span>
  <span class="page_icon">
    <q-icon
      name="menu"
      class="icon_svg"
    />
  </span>
</div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';

/* inject 받은 값 선언 */
// 페이지 변경 메소드
const onPage = inject('onPage') as ((pageNumber: number) => void);

/* 프롭 선언 */
const props = defineProps({
  pageNumber: { // 컴포넌트 고유 번호
    type: Number,
    required: true
  },
  onPageNumber : { // 현재 활성화 된 페이지
    type: Number,
    required: true
  },
  pageSeq : { // 페이지 순번
    type: Number,
    required: true
  }
});


/* 페이지명 Lpad 처리 */
const padPageNumber = computed(() => {
  return String(props.pageSeq+1).padStart(2, '0');
});
</script>

<style lang="scss" scoped>


.page_btn {
 cursor: pointer;
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

.page_text {
  color: $grey-3;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
}
</style>
