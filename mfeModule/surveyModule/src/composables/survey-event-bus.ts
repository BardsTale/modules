import { ref } from 'vue';

// 함수 타입 정의
type EventHandler<T = any> = (arg: T) => void;

// 우선 순위를 함께 가지는 이벤트 핸들러 타입 정의
export type EventHandlerWithPriority<T = any> = {
  handler: EventHandler<T>;
  priority: string;
};

// 이벤트 버스 타입 정의
type EventBus = {
  [event: string]: EventHandlerWithPriority<any>;
};

export const eventBusList = ref<EventBus>({});

// 이벤트에 핸들러를 추가하는 함수
export const on = <T>(event: string, callback: EventHandler<T>, priority: string) => {
  // 핸들러 등록
  eventBusList.value[event] = {
    handler : callback,
    priority : priority
  };
};

// 이벤트에서 핸들러를 제거하는 함수
export const off = (event: string) => {
  if (eventBusList.value[event]) {
    delete eventBusList.value[event];
  }
};

// 이벤트를 발생시키는 함수
export const emit = <T>(event: string, arg?: T): Promise<any> => {
  return new Promise((resolve, reject) => {
    try{
      return resolve(eventBusList.value[event].handler(arg));
    } catch(e){
      return reject(new Error('[이벤트 버스]이벤트 에밋에 실패하였습니다.'));
    }
  })
};


// 이벤트 버스 객체를 기본으로 내보내기
export default {
  on,
  off,
  emit,
  eventBusList
};
