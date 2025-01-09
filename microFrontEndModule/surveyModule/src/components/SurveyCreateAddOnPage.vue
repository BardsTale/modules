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


.page_btn, .page_add_icon, .top_btn {
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
