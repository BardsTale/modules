import { expect, test } from 'vitest'
import eventBus from '../composables/survey-event-bus'

test('이벤트 버스에 성공적으로 등록(on) 시, 버스 리스트에서 확인할 수 있어야 함.', () => {
  eventBus.on('test_event',()=>{return 'chill~'},'0');
  expect(findKey('test_event')).toBe('test_event');
})

test('이벤트 버스에 성공적으로 제거(off) 시, 버스 리스트에서 제거되야 함.', () => {
  // 이벤트 등록
  eventBus.on('test_event',()=>{return 'chill~'},'0');
  expect(findKey('test_event')).toBe('test_event');

  // 이벤트 제거
  eventBus.off('test_event');
  expect(findKey('test_event')).toBe(undefined);
})

test('이벤트 버스를 실행(emit) 시 정상적으로 이벤트의 반환 값을 return 해야함.', async () => {
  eventBus.on('test_event',()=>{return 'chill~'},'0');
  expect(await eventBus.emit('test_event')).toBe('chill~');
})


// 이벤트버스 리스트 검색 메서드
const findKey = (keyString: string): string|undefined => {
  return Object.keys(eventBus.eventBusList.value).find(ele=> ele === keyString);
}
