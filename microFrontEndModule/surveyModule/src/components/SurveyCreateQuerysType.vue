<template>
<div class="set_params">
  <!-- 설문 질문 케이스 수정 상태 -->
  <template v-if="props.isSelect" >
    <div class="params_wrap">
      <div class="handle">
        <q-icon name="icon-menu" class="icon_svg"></q-icon>
      </div>
      <div class="params_top row">
        <q-select
          v-model="surveyType"
          :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
          :options="surveyTypeOptions"
          label="설명형태"
          emit-value
          map-options
          dense
          outlined
          class="box_l hide_label"
          style="width: 200px"
        />
        <q-checkbox
          :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
          v-model="mandatoryCheck"
          val="Y"
          color="black"
          class="body2"
          label="필수여부"
        />
        <div>
          <q-icon
            v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
            name="icon-copy-2"
            class="icon_svg"
            style="width: 40px; height: 40px; cursor: pointer;"
            @click="copyQuery"
          ></q-icon>
          <q-icon
            v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
            name="icon-trash-can"
            class="icon_svg"
            style="width: 40px; height: 40px; margin-left: 10px; cursor: pointer;"
            @click="removeQuery"
          ></q-icon>
        </div>
      </div>
      <div class="input_area">
        <q-input
          :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
          outlined
          v-model="questionInput"
          placeholder="질문을 입력해주세요"
          maxlength="50"
        />
        <q-input
          :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
          outlined
          v-model="descriptionInput"
          placeholder="설명을 입력해주세요"
          style="margin: 4px 0 0 0"
          maxlength="50"
        />

        <!-- 단답형 -->
        <template v-if="surveyType === QuestType.ShotAnswer">
          <q-input
            outlined
            v-model="answerInput"
            placeholder="답변 입력란 (최대 100자)"
            style="margin: 12px 0 0 0"
            dense
            readonly
          />
        </template>

        <!-- 장문형 -->
        <template v-if="surveyType === QuestType.LongAnswer">
          <q-input
            outlined
            v-model="answerInput"
            placeholder="답변 입력란 (최대 2,000자)"
            style="margin: 12px 0 0 0"
            dense
            readonly
          />
        </template>

        <!-- 단일 선택형 -->
        <template v-if="surveyType === QuestType.SingleChoice">
          <div v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1" class="control_box" style="margin: 0;">
            <p class="body3">
              * 항목에 이미지 첨부 시 10MB 이하 이미지를 사용해 주세요.
            </p>
          </div>
          <div style="display: inline-grid;">
            <template v-for="num in itemCount" :key="`radio-${num}`">
              <q-radio v-model="radioValue" :val="num" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" color="black">
                <template v-slot:default>
                  <div style="display: flex; align-items: center;">
                    <q-input
                      :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
                      style="margin: 5px"
                      v-model="radioInputArray[num-1].itemNm"
                      :placeholder="`항목 ${num}`"
                      @click.stop
                      @keydown.space.stop
                      @keyup.space.stop
                    />
                    <q-item-section avatar style="min-width: 16px; padding: 0 10px 0 0">
                      <q-icon
                        v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                        :class="{disabled : attachImageList[num-1]}"
                        @click.stop="addFile($event,num-1)"
                        name="icon-photo"
                        class="icon_svg"
                        size="16px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-icon
                        v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                        @click.stop="decreaseItemCount($event,{},num-1, false)"
                        name="icon-close"
                        class="icon_svg"
                      />
                    </q-item-section>
                  </div>
                </template>
              </q-radio>
              <!-- 이미지 -->
              <div class="" v-if="imageUrlList[num-1]" >
                <img :src="getImageUrlForDisplay(imageUrlList[num-1])" alt="항목 이미지" style="max-width: 300px;" />
                <q-icon
                  v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                  @click.stop="delFile(num-1)"
                  name="icon-close"
                  size="16px"
                  class="icon_svg"
                  style="left: 10px; cursor: pointer;"
                />
              </div>
            </template>
            <template v-if="onEtc">
              <q-radio v-model="radioValue" val="etc" label="기타" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" color="black">
                <template v-slot:default>
                  <div style="margin-left: 15px; display: inline-block; line-height: 25px">
                    <q-icon
                      v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                      @click.stop="decreaseItemCount($event,{}, 0, true)"
                      name="icon-close"
                      class="icon_svg"
                      size="16px"
                    />
                  </div>
                </template>
              </q-radio>
            </template>
          </div>
          <div class="button-row">
            <q-btn
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              outline
              unelevated
              @click="increaseItemCount($event, {}, false)"
              class="size_sm"
              label="항목추가"
            />
            <q-btn
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              outline
              unelevated
              @click="increaseItemCount($event, {}, true)"
              class="size_sm"
              label="기타 추가"
            />
          </div>
        </template>

        <!-- 복수 선택형 -->
        <template v-if="surveyType === QuestType.MultipleChoice">
          <div v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1" class="control_box" style="margin: 0;">
            <p class="body3">
              * 항목에 이미지 첨부 시 10MB 이하 이미지를 사용해 주세요.
            </p>
          </div>
          <div style="display: inline-grid;">
            <template v-for="num in itemCount" :key="`multi-${num}`">
              <q-checkbox :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" v-model="checkValueArray" :val="num" color="black">
                <template v-slot:default>
                  <div style="display: flex; align-items: center;">
                    <q-input
                      :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
                      :placeholder="`항목 ${num}`"
                      @click.stop
                      @keydown.space.stop
                      @keyup.space.stop
                      style="margin: 5px"
                      v-model="checkInputArray[num-1].itemNm"
                    />
                    <q-item-section avatar style="min-width: 16px; padding: 0 10px 0 0">
                      <q-icon
                        v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                        :class="{disabled : attachImageList[num-1]}"
                        @click.stop="addFile($event,num-1)"
                        size="16px"
                        name="icon-photo"
                        class="icon_svg"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-icon
                        v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                        name="icon-close"
                        class="icon_svg"
                        @click.stop="decreaseItemCount($event,{},num-1, false)"
                      />
                    </q-item-section>
                  </div>
                </template>
              </q-checkbox>
              <!-- 이미지 -->
              <div class="" v-if="imageUrlList[num-1]" >
                <img :src="getImageUrlForDisplay(imageUrlList[num-1])" alt="항목 이미지" style="max-width: 300px;" />
                <q-icon
                  v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
                  @click.stop="delFile(num-1)"
                  name="icon-close"
                  class="icon_svg"
                  size="16px"
                  style="left: 10px; cursor: pointer;"
                />
              </div>
            </template>
            <template v-if="onEtc">
              <q-checkbox v-model="checkValueArray" val="etc" label="기타" color="black">
                <template v-slot:default>
                  <div style="margin-left: 15px; display: inline-block; line-height: 25px">
                    <q-icon
                      name="icon-close"
                      class="icon_svg"
                      size="16px"
                      @click.stop="decreaseItemCount($event,{}, 0, true)"
                    />
                  </div>
                </template>
              </q-checkbox>
            </template>
          </div>
          <div class="button-row">
            <q-btn
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              outline
              unelevated
              @click="increaseItemCount($event, {}, false)"
              class="size_sm"
              label="항목추가"
            />
            <q-btn
              v-if="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) > -1"
              outline
              unelevated
              @click="increaseItemCount($event, {}, true)"
              class="size_sm"
              label="기타 추가"
            />
          </div>
        </template>

        <!-- 첨부파일형 -->
        <template v-if="surveyType === QuestType.FileUpload">
          <div class="item_setting_area">
            <div class="item-row mt12">
              <div class="btn_add">
                <q-icon
                  name="icon-photo-grey"
                  class="icon_svg"
                />
                <span class="title3 ml10 text-grey-5">
                  이미지 / 파일첨부
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- 선호도형 -->
        <template v-if="surveyType === QuestType.Preference">
          <q-radio v-model="preferValue" :val="PreferType.Preference" label="선호도형" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" />
          <q-radio v-model="preferValue" :val="PreferType.StarRating" label="별점형" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" />
          <div class="item-row fav_type_btm" v-if="preferValue === PreferType.Preference">
            <q-input
              :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
              outlined
              v-model="leftInput"
              placeholder="ex) 좋다"
              maxlength="10"
            />
            <span>1 ~</span>
            <q-select
              :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
              v-model="rightValue"
              :options="[2,3,4,5]"
              label="선호도"
              emit-value
              map-options
              dense
              outlined
              class="box_l hide_label"
            />
            <q-input
              :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1"
              outlined
              v-model="rightInput"
              placeholder="ex) 싫다"
              maxlength="10"
            />
          </div>
        </template>

        <!-- 날짜형 -->
        <template v-if="surveyType === QuestType.Datetime">
          <q-radio v-model="dateType" :val=DatetimeType.Time label="시간" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" />
          <q-radio v-model="dateType" :val=DatetimeType.Date label="날짜" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" />
          <q-radio v-model="dateType" :val=DatetimeType.DateTime label="날짜 + 시간" :disable="[SurveyStatus.Drafting, SurveyStatus.Temp, SurveyStatus.NotStarted].indexOf(props.surveyStat) === -1" />
          <div class="item_answer_row row justify-start q-mt-md">
            <!-- 날짜 -->
            <template v-if="dateType === DatetimeType.Date || dateType === DatetimeType.DateTime">
              <q-input
                outlined
                v-model="startDate"
                class="inp_date normal disabled"
                readonly
                style="margin-right: 4px"
              >
                <template v-slot:append>
                  <q-icon
                    name="icon-calendar"
                    class="icon_svg cursor-pointer disabled"
                  >
                    <q-popup-proxy
                      ref="qDateProxyFrom"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                      v-if="false"
                    >
                      <q-date
                        minimal
                        mask="YYYY.MM.DD"
                        v-model="startDate"
                      >
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </template>

            <!-- 시간 -->
            <template v-if="dateType === DatetimeType.Time || dateType === DatetimeType.DateTime">
              <q-input
                outlined
                v-model="searchTime"
                class="inp_date normal disabled"
                readonly
              >
                <template v-slot:append>
                  <q-icon
                    name="icon-time-check"
                    class="icon_svg cursor-pointer disabled"
                  >
                    <q-popup-proxy
                      v-if="false"
                      ref="qDateProxyFrom"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-time
                        minimal
                        v-model="searchTime"
                        @update:model-value="roundTime"
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
    </div>
  </template>

  <!-- 설문 질문 케이스 미리보기 상태 -->
  <template v-else>
    <div class="params_wrap">
      <div class="handle">
        <q-icon name="icon-menu" class="icon_svg"></q-icon>
      </div>
      <div @click="toggleSelect" class="params_top" style="cursor: pointer">
        <div class="answer_item" style="pointer-events: none;">
          <div class="item_title_row">
            <q-badge color="grey-7" class="square">{{ String(querySeq+1).padStart(2, '0') }}</q-badge>
            <h6 :class="{required:props.queryParam?.esstlYn === 'Y' || props.queryParam?.esstlYn.toString() === 'true' || mandatoryCheck}" class="title1">
              {{ questionInput }}
            </h6>
          </div>
          <!-- 설명이 있을 시 표시 -->
          <p class="item_desc_row text-phara2">{{ descriptionInput }}</p>

          <!-- 단답형 -->
          <template v-if="surveyType === QuestType.ShotAnswer">
            <div class="item_answer_row">
              <div class="wrap_counsel_form">
                <div class="wrap_textarea">
                  <q-input
                    :disable="true"
                    v-model="answerInput"
                    class="basic text-phara1"
                    outlined
                    placeholder="답변 입력란 (최대 100자)"
                    type="textarea"
                    maxlength="100"
                  >
                    <template v-slot:label>메시지 내용</template>
                  </q-input>
                  <div class="check_val">
                    <span>{{ (answerInput as string)?.length || '0'}}</span
                    >/<span>100자</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 장문형 -->
          <template v-else-if="surveyType == QuestType.LongAnswer">
            <div class="item_answer_row">
              <div class="wrap_counsel_form">
                <div class="wrap_textarea">
                  <q-input
                    :disable="true"
                    class="basic text-phara1"
                    outlined
                    v-model="answerInput"
                    placeholder="답변 입력란 (최대 2,000자)"
                    type="textarea"
                    maxlength="2000"
                  >
                    <template v-slot:label>메시지 내용</template>
                  </q-input>
                  <div class="check_val">
                    <span>{{ (answerInput as string)?.length || '0' }}</span
                    >/<span>2000자</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 파일첨부형 -->
          <template v-else-if="surveyType == QuestType.FileUpload">
            <div class="item_answer_row">
              <div class="wrap_counsel_form" style="margin-top: 12px;">
                <q-btn
                  fill
                  color="grey-4"
                  unelevated
                  class="size_sm shadow add_item_btn disabled"
                >
                  <q-icon name="icon-photo" class="icon_svg"></q-icon>
                  <span class="title3 ml10 text-white">이미지 / 파일첨부</span>
                </q-btn>
              </div>
              <div style="margin-top: 10px;">
                <p class="body3 text-grey-6 caution_desc">
                  * 1개의 이미지만 첨부 가능합니다.
                </p>
                <p class="body3 text-grey-6 caution_desc">
                  * 10MB 이하의 이미지만 첨부하실 수 있습니다.
                </p>
              </div>
            </div>
          </template>

          <!-- 단일선택형 -->
          <template v-else-if="surveyType == QuestType.SingleChoice">
            <div class="item_input">
              <!-- 이미지 유무에 따른 목록 형태 변경 -->
              <template v-if="imageUrlList.find(ele => ele)">
                <div class="row q-col-gutter-md">
                  <template v-for="num in itemCount" :key="`radio-${num}`">
                    <div class="item_box">
                      <q-card flat bordered class="brand-card">
                        <q-card-section>
                          <div>
                            <q-radio
                              v-model="radioValue"
                              :label="radioInputArray[num-1].itemNm"
                              :val="num"
                              color="black"
                              class="check_to_radio"
                            />
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <img v-if="imageUrlList[num-1]" :src="getImageUrlForDisplay(imageUrlList[num-1])" alt="항목 이미지" style="max-width: 300px;" />
                        </q-card-section>
                      </q-card>
                    </div>
                  </template>
                </div>
                <div
                  v-if="onEtc"
                  class="row q-mt-md"
                >
                  <q-radio
                    v-model="radioValue"
                    val="other"
                    label="기타"
                    color="black"
                  />
                  <q-input
                    v-model="radioValue"
                    outlined
                    dense
                    class="q-ml-md"
                    style="width: 360px"
                    placeholder="기타 내용을 입력해주세요"
                    :disable="true"
                  />
                </div>
              </template>
              <template v-else>
                <template v-for="num in itemCount" :key="`radio-${num}`">
                  <div class="item">
                    <q-radio
                      v-model="radioValue"
                      :label="radioInputArray[num-1].itemNm"
                      :val="num"
                      color="black"
                      class="check_to_radio"
                    />
                  </div>
                </template>
                <div class="item row" v-if="onEtc">
                  <q-radio
                    v-model="radioValue"
                    val="other"
                    label="기타"
                    color="black"
                  />
                  <q-input
                    v-model="radioValue"
                    :disable="true"
                    dense
                    outlined
                    placeholder="기타 내용을 입력해 주세요"
                    class="q-ml-md"
                    style="width: 360px;"
                  />
                </div>
              </template>
            </div>
          </template>

          <!-- 복수선택형 -->
          <template v-else-if="surveyType == QuestType.MultipleChoice">
            <div class="item_input">
              <!-- 이미지 유무에 따른 목록 형태 변경 -->
              <template v-if="imageUrlList.find(ele => ele)">
                <div class="row q-col-gutter-md">
                  <template v-for="num in itemCount" :key="`multi-${num}`">
                    <div class="item_box">
                      <q-card flat bordered class="brand-card">
                        <q-card-section>
                          <div>
                            <q-checkbox
                              v-model="checkValueArray"
                              :label="checkInputArray[num-1].itemNm"
                              :val="num"
                              color="black"
                              class="check_to_radio"
                            />
                          </div>
                        </q-card-section>
                        <q-card-section>
                          <img v-if="imageUrlList[num-1]" :src="getImageUrlForDisplay(imageUrlList[num-1])" alt="항목 이미지" style="max-width: 300px;" />
                        </q-card-section>
                      </q-card>
                    </div>
                  </template>
                </div>
                <div
                 v-if="onEtc"
                 class="row q-mt-md"
                >
                  <q-checkbox
                    v-model="checkValueArray"
                    val="etc"
                    label="기타"
                    color="black"
                  />
                  <q-input
                    v-model="radioValue"
                    outlined
                    dense
                    class="q-ml-md"
                    style="width: 360px"
                    placeholder="기타 내용을 입력해주세요"
                    :disable="true"
                  />
                </div>
              </template>
              <template v-else>
                <template v-for="num in itemCount" :key="`multi-${num}`">
                  <div class="item">
                    <q-checkbox
                      v-model="checkValueArray"
                      :label="checkInputArray[num-1].itemNm"
                      :val="num"
                      color="black"
                      class="check_to_radio"
                    />
                  </div>
                </template>
                <div class="item row" v-if="onEtc">
                  <q-checkbox
                    v-model="checkValueArray"
                    val="etc"
                    label="기타"
                    color="black"
                  />
                  <q-input
                    v-model="radioValue"
                    :disable="true"
                    dense
                    outlined
                    placeholder="기타 내용을 입력해 주세요"
                    class="q-ml-md"
                    style="width: 360px;"
                  />
                </div>
              </template>
            </div>
          </template>

          <!-- 선호도형 -->
          <template v-else-if="surveyType == QuestType.Preference && preferValue == PreferType.Preference">
            <div class="item_input">
              <div class="q-pa-md" style="width: 400px">
                <div class="wrap_opt_radio">
                  <q-option-group
                    class="radio_group_custom type03"
                    v-model="preferEmptyValue"
                    :class="`count-${rightValue as number}`"
                    :options="makeReferOption(1, rightValue as number)"
                  />
                </div>

                <div
                  class="row justify-between q-mt-md"
                  style="padding: 0 13px"
                >
                  <div class="body3">{{ leftInput }}</div>
                  <div class="body3">{{ rightInput }}</div>
                </div>
              </div>
            </div>
          </template>

          <!-- 별점형 -->
          <template v-else-if="surveyType == QuestType.Preference && preferValue == PreferType.StarRating">
            <div class="item_input item_answer_row">
              <q-icon
                v-for="(star, index) in 5"
                :key="index"
                class="icon_svg icon_star_score icon-star-off"
                size="24px"
              />
            </div>
          </template>

          <!-- 시간 & 날짜형  -->
          <template v-else-if="surveyType == QuestType.Datetime">
            <div class="item_answer_row row justify-start q-mt-md">
              <template v-if="dateType == DatetimeType.Date || dateType == DatetimeType.DateTime">
                <q-input
                  outlined
                  v-model="startDate"
                  class="inp_date normal"
                  style="margin-right: 4px"
                >
                  <template v-slot:append>
                    <q-icon
                      name="icon-calendar"
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
                          v-model="startDate"
                        >
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </template>
              <template v-if="dateType == DatetimeType.Time || dateType == DatetimeType.DateTime">
                <q-input
                  outlined
                  v-model="searchTime"
                  class="inp_date normal"
                >
                  <template v-slot:append>
                    <q-icon
                      name="icon-time-check"
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
                          v-model="searchTime"
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
      </div>
    </div>
  </template>
  <CmmPctrModal
    ref="pctrModal"
    @fileFromStorage="fileReceived"
    @imageForBase64="fileReceived"
  />
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { date } from 'quasar';
import type { FlexibleObject, SurveyInterface, SurveyQuest, SurveyQuestItem, FileObject } from '@/composables/survey-interface';
import { SurveyOption, QuestType, PreferType, DatetimeType, SurveyStatus } from '@/composables/survey-interface';
import eventBus from '@/composables/survey-event-bus';
import { Dialog } from 'quasar';

/* 에밋 선언 */
const emit = defineEmits(['addQuery','removeQuery','selectQuery']);

/* 프롭 선언 */
const props = defineProps({
  queryNumber: { // 컴포넌트 고유 번호
    type: Number,
    required: true
  },
  copiedParam : { // 복사된 파라미터
    type: Object,
    required: false
  },
  queryParam : { // 등록 설문일 시 데이터
    type: Object,
    required: true
  },
  surveyPageSeq:{ // 설문 페이지 순번
    type: Number,
    required: true
  },
  surveyPageNumber:{ // 설문 페이지 고유 번호
    type: Number,
    required: true
  },
  querySeq:{ // 질문 순번
    type: Number,
    required: true
  },
  surveyStat:{ // 설문 상태
    type: Number,
    required: true
  },
  isSelect:{ // 설문 활성화 상태
    type: Boolean,
    required: true
  }
});



/* 설문 선택(활성화) 여부 */
// 기획서엔 선택 해제에 대한 설명이 누락되어있음. -> 다른 질문 클릭 시 토글하는 것으로.
const toggleSelect = ():void => {
  emit('selectQuery', props.querySeq);
}



/* 설문 복사 & 삭제 */
// 복사 메서드
const copyQuery = ():void => {
  // 공용 파라미터 생성 (단답, 장문, 첨부파일형은 이걸로 충분)
  const param: FlexibleObject = {
    surveyType : surveyType.value,
    mandatoryCheck : mandatoryCheck.value,
    questionInput : questionInput.value,
    descriptionInput : descriptionInput.value
  }

  // 단일 선택형
  if(surveyType.value === QuestType.SingleChoice){
    param['itemCount'] = itemCount.value;
    param['onEtc'] = onEtc.value;
    param['radioInputArray'] = [...radioInputArray.value];
  }

  // 복수 선택형
  if(surveyType.value === QuestType.MultipleChoice){
    param['itemCount'] = itemCount.value;
    param['onEtc'] = onEtc.value;
    param['checkInputArray'] = [...checkInputArray.value];
  }

  // 선호도형
  if(surveyType.value === QuestType.Preference){
    param['preferValue'] = preferValue.value;
    param['leftInput'] = leftInput.value;
    param['rightInput'] = rightInput.value;
    param['rightValue'] = rightValue.value;
  }

  // 날짜형
  if(surveyType.value === QuestType.Datetime){
    param['dateType'] = dateType.value;
    param['startDate'] = startDate.value;
    param['searchTime'] = searchTime.value;
  }

  emit('addQuery', param, props.queryNumber);
}
// 삭제 메서드
const removeQuery = ():void => {
  emit('removeQuery',props.queryNumber);
}



/* 설문 공통 */
const surveyTypeOptions = ref([
  { label: '단답형', value: QuestType.ShotAnswer },
  { label: '장문형', value: QuestType.LongAnswer },
  { label: '단일 선택형', value: QuestType.SingleChoice },
  { label: '복수 선택형', value: QuestType.MultipleChoice },
  { label: '첨부파일형', value: QuestType.FileUpload },
  { label: '선호도형', value: QuestType.Preference },
  { label: '날짜/시간', value: QuestType.Datetime },
]);
const surveyType = ref(props.copiedParam?.surveyType || QuestType.ShotAnswer);
const mandatoryCheck = ref(props.copiedParam?.mandatoryCheck || false); // 필수 여부
const questionInput = ref(props.copiedParam?.questionInput || ''); // 제목
const descriptionInput = ref(props.copiedParam?.descriptionInput || ''); // 설명


/* 단답, 장문형 */
const answerInput = ref(''); // 바인딩용, 사용되진 않음.


/* 단일 & 복수 선택형 */
const radioValue = ref(''); // 바인딩용, 의미는 없음.
const checkValueArray = ref<string[]>([]) // 복수 선택 값 배열, 바인딩용
const itemCount = ref(props.copiedParam?.itemCount || 1); // 단일 선택 항목 갯수
const onEtc = ref<boolean>(props.copiedParam?.onEtc || false); // 기타 항목 추가 여부
const radioInputArray = ref<SurveyQuestItem[]>(props.copiedParam?.radioInputArray || [{}]) // 단일 선택 항목명 배열
const checkInputArray = ref<SurveyQuestItem[]>(props.copiedParam?.checkInputArray || [{}]) // 복수 선택 항목명 배열

// 항목 추가
const increaseItemCount = (event: Event, go:object, isEtc: boolean): void => {
  if(isEtc){ // 기타 추가
    onEtc.value = true;
  }else{
    if(itemCount.value < SurveyOption.ItemPerQuery) {
      itemCount.value += 1;
      radioInputArray.value.push({itemNm: '', itemImgFileUploaded: false, etcAddItemYn: 'N'});
      checkInputArray.value.push({itemNm: '', itemImgFileUploaded: false, etcAddItemYn: 'N'});
    }
  }
}
// 항목 삭제
const decreaseItemCount = (event: Event, go:object, num: number, isEtc: boolean): void => {
  if(isEtc){ // 기타 삭제
    onEtc.value = false;
  }else{
    if(itemCount.value > 1) {
      itemCount.value -= 1;
      radioInputArray.value.splice(num,1);
      checkInputArray.value.splice(num,1);
      delFile(num, true); // 첨부된 파일도 삭제
    }
  }
}

// 이미지 첨부
const ALLOW_EDEXTENSIONS = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'psd']; // 허용된 파일 확장자
const MAX_FILE_SIZE_MB = 10; // 최대 사이즈
const pctrModal = ref(); // 공용 파일 선택 모달
const fileCursorIndex = ref(0); // 현재 파일 인덱스
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const imageUrlList = ref<any[]>([]); // 이미지 url List

// 파일 첨부 리스트
const attachImageList = ref<Array<File|undefined>>([]);

// 파일 첨부 메소드
const addFile = (event:PointerEvent , num: number) => {
  if (!attachImageList.value[num]) {
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
    fileCursorIndex.value = num; // 현재 파일 인덱스 저장
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

  // 파일 타입으로 이미지 파일 재차 확인
  if (!file.type.startsWith('image/')) {
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

  reader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target) {
        imageUrlList.value[fileCursorIndex.value] = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
  attachImageList.value[fileCursorIndex.value] = file;
};

// 파일 삭제 메소드
const delFile = (index: number, itemDelete?: boolean): void => {
  if(itemDelete){
    attachImageList.value.splice(index, 1);
    imageUrlList.value.splice(index, 1);
  } else {
    attachImageList.value[index] = undefined;
    imageUrlList.value[index] = undefined;
  }
};


/* 선호도형 */
const preferValue = ref(props.copiedParam?.preferValue || PreferType.Preference);
const leftInput = ref(props.copiedParam?.leftInput || ''); // 왼쪽 항목
const rightInput = ref(props.copiedParam?.rightInput || ''); // 오른쪽 항목
const rightValue = ref(props.copiedParam?.rightValue || 5); // 최대 점수
const preferEmptyValue = ref(''); // 미리보기 바인딩용
// 선호도 옵션 생성 메서드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeReferOption = (startPoint: number, endPoint: number): any[] => {
  const result = Array.from({ length: endPoint - startPoint + 1 }, (_, i) => ({
                            label: `${startPoint + i}`,
                            value: startPoint + i,
                          }));
  return result;
}


/* 날짜형 */
const dateType = ref(props.copiedParam?.dateType || DatetimeType.DateTime); // 날짜/시간 표시 구분

// 아래의 날짜 컨트롤 코드는 이후 실제 설문때 쓰일 예정...
const { formatDate } = date;
const today = new Date();
const startDate = ref(props.copiedParam?.startDate || formatDate(today, 'YYYY.MM.DD'));
const searchTime = ref(props.copiedParam?.searchTime || '12:00');
// 30분 단위로 시간을 반올림하는 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const roundTime = (newTime: any): void => {
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
  searchTime.value = roundedTime;
};


/* 저장 파라미터 추가 */
const addParameters = (params: SurveyInterface): SurveyInterface => {
  // 필수값 미입력 예외처리
  let validations = [
    { value: questionInput.value, text: '질문이 입력되지 않았습니다.' },
  ];

  // 타입별 예외처리
  if(surveyType.value === QuestType.SingleChoice){ // 단일 선택
    validations = radioInputArray.value.reduce((acc, ele)=>{
      acc.push({
        value: ele.itemNm,
        text: '항목이 입력되지 않았습니다.'
      });
      return acc;
    },validations);
  } else if(surveyType.value === QuestType.MultipleChoice){ // 복수 선택
    validations = checkInputArray.value.reduce((acc, ele)=>{
      acc.push({
        value: ele.itemNm,
        text: '항목이 입력되지 않았습니다.'
      });
      return acc;
    },validations);
  } else if(surveyType.value === QuestType.Preference && preferValue.value === PreferType.Preference ){ // 선호도
    validations.push({
      value: leftInput.value,
      text: '선호도 왼쪽 항목이 입력되지 않았습니다.'
    });

    validations.push({
      value: rightInput.value,
      text: '선호도 오른쪽 항목이 입력되지 않았습니다.'
    });
  }

  // 미리보기가 아닐 경우 벨리데이션 처리
  if(!params.isPreview){
    for (const { value, text } of validations) {
      if (!value) {
        Dialog.create({
          message: `${text}`,
        });
        throw new Error(`${text}`);
      }
    }
  }

  // 모든 질문타입 공용 파라미터
  const param = {
    questId: props.queryParam?.questId,
    questFakeId: props.queryNumber, // 고유값 다 사용 후 제거.
    questTitle: questionInput.value,
    questExpn: descriptionInput.value,
    esstlYn: mandatoryCheck.value? 'Y':'N',
    questType : surveyType.value,
    questSeq : props.querySeq+1,
  } as SurveyQuest


  // 질문 타입별 파라미터 추가
  // 단일 선택형 & 복수 선택형
  if([QuestType.SingleChoice, QuestType.MultipleChoice].includes(surveyType.value)){
    const questInputArray = surveyType.value === QuestType.SingleChoice? radioInputArray:checkInputArray; // 단일 선택형 or 복수 선택형 분기 처리

    // 항목(questItem) 처리
    param['surveyQuestItemList'] = questInputArray.value.reduce((acc,ele,idx)=>{
      // 항목 파라미터 생성
      const queryParam = {
        itemNm: ele.itemNm,
        itemImgFileUploaded: attachImageList.value[idx]? true : false,
        itemImgFileAwsObjNm: imageUrlList.value[idx],
        etcAddItemYn: 'N',
      } as SurveyQuestItem

      // 설문 수정인 경우
      if(props.queryParam){
        queryParam.itemId = ele.itemId; // 식별을 위한 itemId 추가

        // 원본 파일명
        const originFileName = props.queryParam?.surveyQuestItemList.find((element: SurveyQuestItem)=> ele.itemId == element.itemId )?.itemImgFileRealNm;
        if(!originFileName && attachImageList.value[idx]) { // 이미지 신규 등록
          queryParam.itemImgFileDeleted = false;
          queryParam.itemImgFileUploaded = true;

          // 파일 등록 처리
          const reNameFile = new File([attachImageList.value[idx]], `${ele.itemId}_${attachImageList.value[idx]?.name}`)
          params.attachments?.push(reNameFile);
        } else if(attachImageList.value[idx] && originFileName && (originFileName !== attachImageList.value[idx]?.name && attachImageList.value[idx])) { // 이미지 변경
          queryParam.itemImgFileDeleted = true;
          queryParam.itemImgFileUploaded = true;

          // 파일 등록 처리
          const reNameFile = new File([attachImageList.value[idx]], `${ele.itemId}_${attachImageList.value[idx]?.name}`)
          params.attachments?.push(reNameFile);
        } else if(originFileName && !attachImageList.value[idx]) { // 파일 삭제.
          queryParam.itemImgFileDeleted = true;
          queryParam.itemImgFileUploaded = false;
        } else { // 아무 것도 아님.
          queryParam.itemImgFileDeleted = false;
          queryParam.itemImgFileUploaded = false;
        }

        // 기타 처리
        // 기타 미사용인 경우 기존의 기타를 accmulator에 push하지 않고 다음 루프 진행.
        if(onEtc.value && ele.etcAddItemYn === 'Y'){
          queryParam.etcAddItemYn = ele.etcAddItemYn;
        } else if(!onEtc.value && ele.etcAddItemYn === 'Y'){
          return acc;
        }
      } else { // 신규 설문의 파일 처리
        // 이미지가 있는 경우 추가
        if(attachImageList.value[idx]){
          params.attachments?.push(attachImageList.value[idx]);
        }
      }

      acc.push(queryParam);
      return acc;
    },[] as SurveyQuestItem[]);

    // 신규 기타 항목은 마지막에 추가
    if(onEtc.value && props.queryParam?.surveyQuestItemList[itemCount.value]?.etcAddItemYn === 'N' || onEtc.value && !props.queryParam){
      param['surveyQuestItemList'].push({
        itemNm: '기타',
        itemImgFileUploaded: false,
        etcAddItemYn: 'Y',
      } as SurveyQuestItem)
    }
  }

  // 선호도형
  if(surveyType.value === QuestType.Preference){
    param['prfrTypeKnd'] = preferValue.value;
    param['prfrTypeStrItem'] = leftInput.value;
    param['prfrTypeEndItem'] = rightInput.value;
    param['prfrTypeMaxScr'] = rightValue.value;
  }

  // 날짜형
  if(surveyType.value === QuestType.Datetime){
    param['dtmTypeKnd'] = dateType.value;
  }

  const surveyQuestList = (params['surveyPageList']).find(ele => {
    return ele.pageFakeId === props.surveyPageNumber;
  })?.surveyQuestList;
  (surveyQuestList as SurveyQuest[]).push(param);

  return params;
}

/* 이벤트 버스 사용. */
// 이벤트 버스 등록 메소드
const registerEventListener = () => {
  eventBus.on(
    `addQueryParams${props.surveyPageNumber}_${props.queryNumber}`,
    addParameters,
    `${props.surveyPageSeq + 1}-${props.querySeq + 1}`
  );
};

// 이벤트 버스 해제 메소드
const unregisterEventListener = () => {
  eventBus.off(`addQueryParams${props.surveyPageNumber}_${props.queryNumber}`);
};

// props.surveyPageSeq 또는 props.querySeq가 변경될 때 이벤트 리스너를 재등록
watch(
  () => [props.surveyPageSeq, props.querySeq],
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
watch(() => props.queryParam, () => {
  if(props.queryParam){
    // 공통, 단답, 장문, 단일, 복수, 파일첨부형까지 값 바인딩
    surveyType.value = props.queryParam?.questType;
    mandatoryCheck.value = Boolean(props.queryParam?.esstlYn==='Y');
    questionInput.value = props.queryParam?.questTitle;
    descriptionInput.value = props.queryParam?.questExpn;
    itemCount.value = props.queryParam?.surveyQuestItemList?.length;
    onEtc.value = Boolean(props.queryParam?.surveyQuestItemList.find((ele: SurveyQuestItem)=>ele.etcAddItemYn === 'Y'));
    radioInputArray.value = [...props.queryParam?.surveyQuestItemList];
    checkInputArray.value = [...props.queryParam?.surveyQuestItemList];
    // 기타 값이 있을 경우 차감 처리
    if(props.queryParam?.surveyQuestItemList[itemCount.value-1]?.etcAddItemYn === 'Y') {
      itemCount.value--; // 아이템 카운트 차감
    }
    // 단일, 복수형 이미지 파일 처리
    props.queryParam?.surveyQuestItemList.forEach((ele: SurveyQuestItem, idx: number) => {
      if(ele.itemImgFileAwsObjNm){
        imageUrlList.value[idx] = ele.itemImgFileAwsObjNm;
        attachImageList.value[idx] = new File([], ele.itemImgFileRealNm as string, { type: 'image/png' });
      }
    });

    // 선호도형
    preferValue.value = props.queryParam?.prfrTypeKnd;
    leftInput.value = props.queryParam?.prfrTypeStrItem;
    rightInput.value = props.queryParam?.prfrTypeEndItem;
    rightValue.value = props.queryParam?.prfrTypeMaxScr;

    // 날짜형
    dateType.value = props.queryParam?.dtmTypeKnd;
  }
},{ deep: true, immediate: true });


// 이미지 표시 메서드
const getImageUrlForDisplay = (fileKey: string): string => {
  return fileKey;
};
</script>
<style lang="scss" scoped>


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

.item_title_row {
  @include flex_row_start;
  gap: 10px;
  h6 {
    color: $grey-1;
  }
}

body .q-btn.disabled .q-btn__content>span {
    color: #bbb !important;
}
body .q-btn.disabled .q-btn__content i {
    filter: invert(79%) sepia(1%) saturate(0%) hue-rotate(224deg) brightness(95%) contrast(94%);
}
.required::after {
  display: inline-block;
  content: '*';
  padding-left: 5px;
  color: #ed1c24;
}

.item_input{
  margin: 12px 0 0 0;
}
</style>
