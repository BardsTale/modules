// 객체형에 사용될 기본 enum 타입 정의
export type FlexibleValue = string | number | object | Array<string|number|boolean|object> | boolean | null | undefined;

// 심플한 원시 타입
export type SimpleValue = string | number | null | undefined;

// Api 응답 객체
export interface BodyData {
  [key: string]: FlexibleValue;
}
export type BodyArray = Array<FlexibleValue>;
export interface ResponseData {
  header: FlexibleObject;
  body: BodyData|BodyArray;
}

// 인덱스 시그니처가 선언된 유연한 객체
export interface FlexibleObject {
  [key: string]: FlexibleValue;
}

// vue 디렉티브에 사용할 심플 객체
export interface SimpleObject {
  [key: string]: SimpleValue;
}

export interface OptionItem {
    label: string;
    value: FlexibleValue;
}


// 최상위 인터페이스
export interface SurveyInterface {
  surveyId?: number;
  surveyStat?: SurveyStatus;
  tempYn: string;
  surveyStartDate: string;
  surveyEndDate: string;
  surveyCandAnymYn: string;
  rspnModfPosbYn: string;
  surveyPageList: SurveyPage[],
  attachments?: File[], // 임시 파일 객체
  isPreview?: boolean, // 미리보기 유무 확인
}

// 페이지에 대한 인터페이스
export interface SurveyPage {
  pageId?: number;
  pageFakeId?: number;
  pageSeq: number;
  pageNm?: string;
  pageTitle: string;
  pageExpn: string;
  pageImgFileName?: string;
  pageImgFileUploaded: boolean;
  pageFileDeleted?: boolean;
  pageFileUploaded?: boolean;
  surveyQuestList: SurveyQuest[];
}

// 질문에 대한 인터페이스
export interface SurveyQuest {
  queryId?: number;
  questId?: number;
  essentialYn: 'Y' | 'N';
  questTitle: string;
  questDepiction: string;
  questType: number;
  questSeq: number;
  dateTypeKind?: number;
  preferTypeKind?: number;
  preferTypeMaxScore?: number;
  preferTypeStartItem?: string;
  preferTypeEndItem?: string;
  surveyQuestItemList?: SurveyQuestItem[];
}

// 질문 항목에 대한 인터페이스
export interface SurveyQuestItem {
  queryTypeId?: number;
  itemId?: number;
  itemNm: string;
  itemImgFileName?: string;
  itemImgFileRealName?: string;
  itemImgFileUploaded: boolean;
  itemImgFileDeleted?: boolean;
  etcAddItemYn: 'Y' | 'N';
}

// 파일 첨부 리스트 인터페이스
export interface FileObject {
  fileList : FileList,
  option : FlexibleObject
}
// 첨부된 파일들 지니는 객체 인터페이스
export interface FileListObject {
  [key: string]: File|null,
}

// q-time 에 사용할 객체
export interface TimeObject {
  [key: string]: string | null | undefined;
}

// q-checkbox용 jsonArray
export interface JsonArray {
  [key: string]: number[],
}

/* 설문 등록용 인터페이스 */
// 1뎁스
export interface CreateSurveyRspnReqDto {
  surveyId: number,
  surveyQuestRspnList: SurveyQuestRspn[],
  attachments?: File[], // 임시 파일 객체
}

export interface SurveyQuestRspn {
  questId?: number,
  questFakeId?: number,
  rspnCntn?: string,
  itemChic?: number[],
  etcRspnCntn?: string,
  attchFileUploaded?: boolean,
  prfrRspnVal?: number,
  dtmRspnVal?: string
}

/* 응답 설문 데이터 */
export interface RspnDataObject {
  [key:number]: RspnData,
}

// 응답 설문 업데이트
export interface UpdateSurveyRspnReqDto {
  rspnId: number,
  surveyQuestRspnList: RspnData[],
  attachments?: File[], // 임시 파일 객체
}

export interface RspnData {
  questId: number,
  questRspnId: number,
  rspnCntn?: string, // 단답, 장문 응답
  attchFileAwsObjNm?: string, // 암호화된 파일명
  attchFileRealNm?: string, // 복호화된 파일명
  attchFileId?: number, // 파일 고유 번호
  dtmRspnVal?: string, // 데이터 타입 응답값
  prfrRspnVal?: number, // 선호도 타입 응답값
  itemChic?: number[], // 단일선택, 복수선택
  etcRspnCntn?: string, // 단일선택, 복수선택의 기타 타입
  attchFileDeleted?: boolean,
  attchFileUploaded?: boolean,
}

/* 설문 상태 enum */
export enum SurveyStatus {
  Temp = 1,          // 임시저장
  NotStarted = 2,    // 시작전
  Started = 3,       // 진행중
  Extended = 4,      // 기간연장
  Stopped = 5,       // 중지
  Ended = 6,         // 종료
  EndedEarly = 7,    // 조기종료
  Drafting = 8       // 작성중
}

/* 설문 질문 타입 enum */
export enum QuestType {
  ShotAnswer = 1, // 단답형
  LongAnswer = 2, // 장문형
  SingleChoice = 3, // 단일선택형
  MultipleChoice = 4, // 복수선택형
  FileUpload = 5, // 파일첨부형
  Preference = 6, // 선호도형
  Datetime = 7, // 시간&날짜형
}

/* 선호도형 세부 타입 enum */
export enum PreferType {
  Preference = 1, // 선호도형
  StarRating = 2, // 별점형
}

/* 시간&날짜형 세부 타입 enum */
export enum DatetimeType {
  Time = 1, // 시간형
  Date = 2, // 날짜형
  DateTime = 3, // 날짜시간형
}

/* 설문조사 기본 설정값 config */
export const SurveyOption = {
  PagePerSurvey : 10, // 설문조사당 최대 페이지
  QueryPerPage : 50, // 페이지당 최대 설문 갯수
  ItemPerQuery : 50, // 설문당 최대 항목 갯수
  VisibleTopButtonNumber : 3, // 탑 버튼 보이는 기준
}

/* 첨부 파일 크기 제한 config */
export const MaxFileSize = {
  Byte: 5*1024*1024, // 5mb
  Number: 5
}
