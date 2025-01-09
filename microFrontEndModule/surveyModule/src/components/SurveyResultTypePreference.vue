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
          label="설명형태"
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
      ></vue-highcharts>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref } from 'vue';
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

/* 모바일뷰 변수 */
const viewType = ref(['항목순']);
const viewTypeOptions = ref([
  { label: '항목순', value: 'type0' },
  { label: '답변 많은 순', value: 'type1' },
]);


/* 하이차트 관련 */
const chartOptions = ref({
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
  chart: {
    type: 'column',
    backgroundColor: '#F1F7FB',
    height: 405,
  },
  title: false,
  subtitle: false,
  legend: false,
  xAxis: {
    lineColor: '#D9DEE2',
    lineWidth: 1,
    categories: ['1', '2', '3', '4', '5'],
    crosshair: true,
    labels: {
      format: '{value:,.0f}', // y축 천단위 콤마
      style: {
        color: '#666',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'Pretendard',
      },
    },
  },
  yAxis: {
    min: 0,
    tickInterval: 1,
    max: 5,
    title: false,
    lineColor: '#D9DEE2',
    lineWidth: 1,
    labels: {
      format: '{value:,.0f}', // y축 천단위 콤마
      style: {
        color: '#666',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'Pretendard',
      },
    },
  },
  tooltip: {
    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
    footerFormat: '</table>',
    shared: true,
    useHTML: true,
  },
  plotOptions: {
    column: {
      pointPadding: 0.4,
      borderWidth: 0,
      borderRadius: 3,
      pointWidth: 68,
      dataLabels: {
        enabled: true,
        inside: true,       // 데이터 라벨을 그래프 안쪽에 배치
        align: 'center',       // 데이터 라벨을 우측 정렬
        formatter: function() {
          // 전체 데이터의 합 구하기
          const total = this.series.data.reduce(function(sum, point) {
            return sum + point.y;
          }, 0);

          // 현재 데이터 포인트의 비율 계산
          const percentage = (this.point.y / total) * 100;

          return `<b>${this.point.y}</b>(${Highcharts.numberFormat(percentage, 1)}%)`;
        },
        color: 'white', // 레이블 텍스트 색상
        style: {
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px',
          border: 'none',
        },
      },
    },
    series: {
      colorByPoint: true,
    },
  },
  series: [
    {
      data: [
        { name: '눈높이', y: 23 },
        { name: '솔루니', y: 570 },
      ],
      name: '비율',
      dataLabels: [
        {
          enabled: true,
          inside: true,
        },
      ],
    },
  ],
  tooltip: {
    formatter: function() {
      var total = this.series.data.reduce(function(sum, point) {
        return sum + point.y;
      }, 0);
      var percentage = (this.point.y / total) * 100;
      return `선호도 ${this.point.category}<br>${this.series.name} : <b>${Highcharts.numberFormat(percentage, 1)}%</b>`;
    }
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

  // 데이터
  chartOptions.value.series[0].data = deepCopyData.map((ele) => {
    return {
      name: ele.itemNm as string,
      y: ele.selectCnt as number
    }
  })

  // 카테고리
  chartOptions.value.xAxis.categories = deepCopyData.map((ele) => {
    return ele.itemNm as string
  })
}

// 차트 프롭 데이터 삽입
watch(()=> props.resultData, async () => {
  if(props.resultData?.prfrRspnList){
    chartOptions.value.series[0].data = props.resultData.prfrRspnList.map((ele) => {
      return {
        name: ele.prfrRspnVal,
        y: ele.prfrRspnCnt
      }
    })

    // 카테고리 삽입
    chartOptions.value.xAxis.categories = props.resultData.prfrRspnList.map((ele) => {
      return ele.prfrRspnVal
    })

    // y값 최대값 및 인터벌 설정
    const maximumValue = [...props.resultData.prfrRspnList].sort((a, b) => a.prfrRspnCnt - b.prfrRspnCnt).pop()!;
    if(maximumValue){
      chartOptions.value.yAxis.tickInterval = Math.ceil(maximumValue.prfrRspnCnt *1 / 5);
      chartOptions.value.yAxis.max = Math.ceil(maximumValue.prfrRspnCnt *1 / 5) * 5;
    }
  }
},{deep: true, immediate: true})
</script>

<style>
.sort-button{
  cursor: pointer;
}
</style>
