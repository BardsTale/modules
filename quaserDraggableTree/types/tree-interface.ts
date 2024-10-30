// 플렉시블한 객체에 사용될 기본 enum 타입 정의
type FlexibleValue = string | number | object | Array<string | number | boolean | object> | boolean | null | undefined;
// 인덱스 시그니처가 선언된 유연한 객체
export interface FlexibleObject {
  [key: string]: FlexibleValue;
}

export interface DragNodeInfo {
    dragItem : object,
    fromDepth: number,
    toDepth: number,
}

export interface TreeData {
    id: number,
    upperId: number,
    name: string,
    depth: number,
    children: TreeData[]
}

/* 드래그 이벤트 파라미터 타입 */
export interface DragStartEvent {
  item: HTMLElement; // 드래그를 시작한 항목의 DOM 요소
  index: number; // 드래그 시작 시 항목의 인덱스
  from: HTMLElement; // 드래그가 시작된 컨테이너 요소
  originalEvent: Event; // 원본 이벤트 객체
}

export interface DragEndEvent {
  oldIndex: number; // 드래그되기 전 인덱스
  newIndex: number; // 드래그 후 놓인 인덱스
  from: HTMLElement; // 드래그된 항목이 있던 컨테이너 요소
  to: HTMLElement; // 드래그된 항목이 놓인 컨테이너 요소
  item: HTMLElement; // 드래그된 항목의 실제 DOM 요소
  clone: HTMLElement; // 드래그할 때 복제된 DOM 요소
  pullMode: string | boolean; // pull 모드(옵션에 따라 다름)
}