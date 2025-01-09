<template>
<div class="survey_item">
  <div class="item_top_row">
    <q-badge color="blue2" class="large34">일간 참여 현황</q-badge>
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
import { PropType, ref } from 'vue';
import { SurveyResultPerDay } from '../src/composables/survey-interface';
import VueHighcharts from 'vue3-highcharts';
import Highcharts from 'highcharts';
import { watch } from 'vue';

/* 프롭 선언 */
const props = defineProps({
  resultData: {
    type: Array as PropType<SurveyResultPerDay[]>,
    required: true
  },
})

/* 하이차트 관련 */
const chartOptions = ref({
  colors:[
    '#4CB87C'
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
      borderRadius: 0,
      pointWidth: 8,
      dataLabels: {
        enabled: true,
        align: 'center',       // 데이터 라벨을 우측 정렬
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
      data: [{}],
      name: '참여 수',
      dataLabels: [
        {
          enabled: true,
        },
      ],
    },
  ],
  tooltip: {
    formatter: function() {
      return `${this.point.category}<br>${this.series.name} : <b>${this.point.y}</b>`;
    }
  },
});


// 차트 프롭 데이터 삽입
watch(()=> props.resultData, () => {
  // 데이터 삽입
  chartOptions.value.series[0].data = props.resultData?.map((ele: any) => {
    return {
      name: ele.date,
      y: ele.surveyPtctCnt
    }
  })

  // 카테고리 삽입
  chartOptions.value.xAxis.categories = props.resultData?.map((ele: any) => {
    return ele.date
  })

  // y값 최대값 및 인터벌 설정
  const maximumValue = [...props.resultData].sort((a, b) => a.surveyPtctCnt - b.surveyPtctCnt).pop();

  if(maximumValue){
    chartOptions.value.yAxis.tickInterval = Math.ceil(maximumValue.surveyPtctCnt *1 / 5);
    chartOptions.value.yAxis.max = Math.ceil(maximumValue.surveyPtctCnt *1 / 5) * 5;
  }
},{deep: true, immediate: true})
</script>

<style>
.sort-button{
  cursor: pointer;
}
</style>
