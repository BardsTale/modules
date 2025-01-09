<template>
<div class="survey_item">
  <div class="item_top_row">
    <q-badge color="blue2" class="large34">{{ props.resultData.questTypeNm }}</q-badge>
  </div>
  <div class="item_title_col">
    <h6
      :class="{required: props.resultData.esstlYn === 'Y'}"
      class="title1"
    >
      {{ `${props.resultNumber}. ${props.resultData.questTitle}` }}
    </h6>
    <div class="survey_info">
      <div class="row item-center justfy-start" style="gap: 24px">
        <p class="body2 color_grey_3">
          참여 <span class="body1 color_orange">{{ props.resultData.questPtctCnt }}</span>
        </p>
        <p class="body2 color_grey_3">
          미참여 <span class="body1 color_grey_3">{{ props.resultData.questNonPtctCnt }}</span>
        </p>
      </div>
      <div
        class="row item-center justfy-start desktop_view"
        style="gap: 10px"
      >
        <span
          @click="() => sortResultData('name')"
          :class="{active: sortMethod === 'name'}"
          class="sort-button"
          >
          항목순
        </span>
        <span>|</span>
        <span
          @click="() => sortResultData('response')"
          :class="{active: sortMethod === 'response'}"
          class="sort-button"
        >
          답변 많은 순
        </span>
      </div>
      <div class="mobile_view">
        <q-select
          v-model="viewType"
          :options="viewTypeOptions"
          label="보기형태"
          emit-value
          map-options
          dense
          outlined
          class="box_l hide_label"
        />
      </div>
    </div>
  </div>
  <div class="item_content_row">
    <div class="wrap_highcharts">
      <vue-highcharts
        :options="chartOptions"
      />
    </div>
    <div class="etc_area">
      <p class="body2">기타</p>
      <template v-for="(item, idx) in props.resultData.etcRspnCntnList" :key="`item-${idx}`">
        <q-input
          v-show="idx < 5 || allOfThem"
          v-model="item.etcRspnCntn"
          outlined
          dense
          readonly
          style="width: 100%"
        >
          <template v-slot:append>
            <div class="q-field__native q-placeholder" style="z-index: 1;">답변 {{ item.etcRspnCntnCnt }}개</div>
          </template>
        </q-input>
      </template>
    </div>
  </div>
  <div v-if="props.resultData.etcRspnCntnList && props.resultData.etcRspnCntnList.length > 5" class="btn_more">
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
import { SurveyResultQuest, SurveyResultQuestItem } from '../src/composables/survey-interface';
import VueHighcharts from 'vue3-highcharts';
import Highcharts from 'highcharts';
import { watch } from 'vue';

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

const allOfThem = ref(false); // 전체 항목 보기 유무

/* 모바일뷰 변수 */
const viewType = ref(['항목순']);
const viewTypeOptions = ref([
  { label: '항목순', value: 'type0' },
  { label: '답변 많은 순', value: 'type1' },
]);


/* 하이차트 관련 */
let currentPage = 1;
// eslint-disable-next-line @typescript-eslint/no-empty-function
let updateLegend = function(page: number){};

const chartOptions = ref({
  chart: {
    type: 'pie',
    marginLeft: 200, // 오른쪽 여백을 늘려 범례 공간 확보
    backgroundColor: '#F1F7FB',
    events: {
      load: async function () {
        if(props.resultData){
          let chart = this;
          let legend = chart.legend;

          // 범례 항목을 10개씩 나누기
          let itemsPerPage = 10;
          let totalItems = legend.allItems.length;
          let totalPages = Math.ceil(totalItems / itemsPerPage);
          currentPage = 1;

          // 범례 항목 페이지 분할
          updateLegend = (page: number) => {
            let startIndex = (page - 1) * itemsPerPage;
            let endIndex = page * itemsPerPage;

            // 모든 범례 항목의 y 위치를 초기화
            legend.allItems.forEach(function (item: any) {
              item.legendItem.label.element.style.display = 'none'; // 범례 항목의 아이템을 숨깁니다
              item.legendItem.group.element.style.display = 'none'; // 범례 항목의 아이템을 숨깁니다
              item.legendItem.symbol.element.style.display = 'none'; // 범례 항목의 아이템을 숨깁니다
            });

            // 현재 페이지에 해당하는 범례 항목만 표시
            for (var i = startIndex; i < endIndex && i < totalItems; i++) {
              let item = legend.allItems[i];

              // `y`값을 조정하여 위치를 설정
              item.legendItem.group.translate(0, (i - startIndex) * 25); // y값을 조정하여 위치를 변경합니다

              // 해당 범례 항목을 보이게 설정
              item.legendItem.label.element.style.display = ''; // 해당 범례 항목을 보이게 설정
              item.legendItem.group.element.style.display = ''; // 해당 범례 항목을 보이게 설정
              item.legendItem.symbol.element.style.display = ''; // 해당 범례 항목을 보이게 설정
            }

            // 페이지 버튼 업데이트
            updatePagination(page);
          }

          // 페이지 네비게이션 추가
          let paginationContainer = document.createElement('div');
          paginationContainer.style.position = 'relative';
          paginationContainer.style.textAlign = 'center';
          paginationContainer.style.width = '100px';
          paginationContainer.style.top = '250px';
          paginationContainer.style.margin = '0 auto';

          // 이전/현재/다음 버튼 업데이트
          function updatePagination(page: number) {
            paginationContainer.innerHTML = ''; // 기존 버튼들 초기화

            // 이전 버튼
            let prevButton = document.createElement('button');
            prevButton.textContent = '<';
            prevButton.style.width = '20px';
            prevButton.disabled = (page === 1);
            prevButton.onclick = function () {
              if (page > 1) {
                currentPage--;
                updateLegend(currentPage);
              }
            };
            paginationContainer.appendChild(prevButton);

            // 현재 페이지/전체 페이지
            let pageLabel = document.createElement('span');
            pageLabel.textContent = `${page}/${totalPages}`;
            paginationContainer.appendChild(pageLabel);

            // 다음 버튼
            let nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.style.width = '20px';
            nextButton.disabled = (page === totalPages);
            nextButton.onclick = function () {
              if (page < totalPages) {
                currentPage++;
                updateLegend(currentPage);
              }
            };
            paginationContainer.appendChild(nextButton);
          }

          // 페이지 네비게이션 HTML을 차트 아래에 추가
          legend.allItems[0]?.legendItem.label.element.parentNode.appendChild(paginationContainer);

          // 첫 페이지로 초기화
          updateLegend(currentPage);
        }
      },
      redraw: async function () {
        updateLegend(currentPage);
      },
    }
  },
  title: {
    text: '',
  },
  colors: [
    '#FF8C00',
    '#FFA500',
    '#C0C0C0',
    '#BCD5F2',
    '#9747FF',
    '#44B87B',
    '#EFD26A',
    '#555d67',
    '#0964CE',
    '#BD0000',
    '#00B2BD',
    '#BD00AA',
  ],
  plotOptions: {
    pie: {
      innerSize: '50%', // 가운데 구멍뚫기
      dataLabels: {
        enabled: true,
        format: '{point.y}({point.percentage:.0f}%)',
        distance: -30, // 레이블을 안쪽으로 이동
        color: 'white', // 레이블 텍스트 색상
        style: {
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
          border: 'none',
        },
      },
      showInLegend: true, // 범례 표시
    },
  },
  series: [
    {
      name: '비율',
      data: [
        { name: '눈높이', y: 23 },
        { name: '솔루니', y: 570 },
      ],
    },
  ],
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'  // 퍼센트 값 표시
  },
  legend: {
    align: 'right',
    verticalAlign: 'middle',
    layout: 'vertical',
    x: -200,
    y: 0,
    itemStyle: {
      color: '#333333',
    },
    labelFormatter: function() {
      return (
        `${this.name}: ${this.y}(${Highcharts.numberFormat(this.percentage, 0)}%)`
      );
    },
    useHTML: true
  },
});

// 차트 정렬
const sortMethod = ref('name');
const sortResultData = (method: string):void => {
  sortMethod.value = method;
  const deepCopyData = [...props.resultData?.questTypeSelectRspnList as SurveyResultQuestItem[]];

  if(method === 'name'){
    deepCopyData.sort((a, b) => a.itemNm.localeCompare(b.itemNm));
  } else {
    deepCopyData.sort((a, b) => b.selectCnt - a.selectCnt);
  }

  chartOptions.value.series[0].data = deepCopyData.map((ele) => {
    return {
      name: ele.itemNm as string,
      y: ele.selectCnt as number
    }
  })
}

watch(()=> props.resultData, () => {
  if(props.resultData?.questTypeSelectRspnList){
    chartOptions.value.series[0].data = props.resultData.questTypeSelectRspnList.map((ele) => {
      return {
        name: ele.itemNm,
        y: ele.selectCnt
      }
    })
  }
},{deep: true, immediate: true})
</script>

<style scoped>
.sort-button{
  cursor: pointer;
}

@media print {
  .btn_more {
    display: none !important;
  }
}
</style>
