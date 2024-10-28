import menuData from './data/menuData.json';
import {useRoute} from 'vue-router';

/* 타입 선언부 */
// 플렉시블한 객체에 사용될 기본 enum 타입 정의
type FlexibleValue = string | number | object | Array<string | number | boolean | object> | boolean | null | undefined;

// 인덱스 시그니처가 선언된 유연한 객체
interface FlexibleObject {
  [key: string]: FlexibleValue;
}

// 권한 타입
type AuthCode = 'Create' | 'Read' | 'Update' | 'Delete' | 'Download' | 'Approval';

// 권한 상태 enum
enum AuthEnum {
  Create = 'C',     // 생성
  Read = 'R',       // 읽기
  Update = 'U',     // 수정
  Delete = 'D',     // 삭제
  Download = 'A',   // 다운로드
}

// 권한 타입
interface AuthObject {
  Create: boolean;   // 생성
  Read: boolean;     // 읽기
  Update: boolean;   // 수정
  Delete: boolean;   // 삭제
  Download: boolean; // 다운로드
  Approval: boolean; // 승인
  [key: string]: boolean;
}

// 메뉴 객체 타입
interface MenuObject {
  authTypeCode: string;
  [key: string]: FlexibleValue;
}

// 탭리스트 객체 타입
interface TabListObject {
  [key: string]: MenuObject;
}

/* 모듈 선언부 */
const AuthModule = (() => {
  const menus = menuData;

  /* 내부에서 사용할 헬퍼 함수 */
  // 현재 라우트를 기반으로 매칭되는 메뉴를 가져오는 함수
  const getMatchedMenu = (): MenuObject | undefined => {
    return menus.find((ele: FlexibleObject) => ele.menuPath === useRoute().path);
  };

  // 현재 라우트를 기반으로 매칭되는 탭을 가져오는 함수
  const getMatchedTab = (): TabListObject | undefined => {
    return menus.reduce((acc: TabListObject, ele: MenuObject): TabListObject => {
      if(ele.isTab && (ele.menuPath as string).indexOf(useRoute().path) > -1) {
        acc[(ele.menuPath as string).split('/').pop() as string] = ele;
      }
      return acc;
    },{});
  };

  /**
   * 권한 타입을 받고 true/false를 반환하는 메소드
   * @param {AuthCode} type - 권한 타입
   * @returns {boolean} 권한이 있을 경우 true를 반환.
   */
  const getMenuAuth = (type: AuthCode): boolean => {
    let result = false;

    const matchedMenu = getMatchedMenu();

    if (matchedMenu) {
      const authTypeCode: string = (matchedMenu as MenuObject).authTypeCode;
      const authTypeCodeSet = new Set(authTypeCode.split(','));
      result = authTypeCodeSet.has(AuthEnum[type]);
    } else {
      notFoundRoute();
    }
    return result;
  };

  /**
   * 권한 객체를 반환하는 메소드
   * @returns {AuthObject}
   * @example
   * getMenuAuthObject();
   *
   * // 읽기, 등록, 수정, 삭제 권한이 있는 경우 아래의 객체 반환
   * {
   *   Create: true,
   *   Read: true,
   *   Update: true,
   *   Delete: true,
   *   Download: false,
   *   Approval: false,
   * }
   */
  const getMenuAuthObject = (): AuthObject => {
    let result: AuthObject = {
      Create: false,
      Read: false,
      Update: false,
      Delete: false,
      Download: false,
      Approval: false,
    };

    const matchedMenu = getMatchedMenu();

    if (matchedMenu) {
      const authTypeCode: string = (matchedMenu as MenuObject).authTypeCode;
      const authTypeCodeSet = new Set(authTypeCode.split(','));

      result = Object.keys(result).reduce((acc: AuthObject, ele: string) => {
        const key: keyof typeof AuthEnum = ele as keyof typeof AuthEnum; // AuthEnum의 키로 제한
        acc[key] = authTypeCodeSet.has(AuthEnum[key]);
        return acc;
      }, result);
    } else {
      notFoundRoute();
    }
    return result;
  };

  /**
   * 탭 이름과 권한 타입을 받고 true/false를 반환하는 메소드
   * @param {string} tabName - path에 기입된 탭의 명칭(ex: '/myPage/infoTab'일 경우 'infoTab')
   * @param {AuthCode} type - 권한 타입
   * @returns {boolean} 권한이 있을 경우 true를 반환.
   */
  const getTabAuth = (tabName: string, type: AuthCode): boolean => {
    let result = false;

    const matchedTab = getMatchedTab() as TabListObject;

    if (matchedTab[tabName]) {
      const authTypeCode: string = (matchedTab[tabName] as MenuObject).authTypeCode;
      const authTypeCodeSet = new Set(authTypeCode.split(','));
      result = authTypeCodeSet.has(AuthEnum[type]);
    } else {
      notFoundRoute();
    }
    return result;
  };

  /**
   * 탭 권한 객체를 반환하는 메소드
   * @param {string} tabName - path에 기입된 탭의 명칭(ex: '/myPage/infoTab'일 경우 'infoTab')
   * @returns {AuthObject}
   * @example
   * getTabAuthObject('tab1');
   *
   * // 읽기, 등록, 수정, 삭제 권한이 있는 경우 아래의 객체 반환
   * {
   *   Create: true,
   *   Read: true,
   *   Update: true,
   *   Delete: true,
   *   Download: false,
   *   Approval: false,
   * }
   */
  const getTabAuthObject = (tabName: string): AuthObject => {
    let result: AuthObject = {
      Create: false,
      Read: false,
      Update: false,
      Delete: false,
      Download: false,
      Approval: false,
    };

    const matchedTab = getMatchedTab() as TabListObject;

    if (matchedTab[tabName]) {
      const authTypeCode: string = (matchedTab[tabName] as MenuObject).authTypeCode;
      const authTypeCodeSet = new Set(authTypeCode.split(','));

      result = Object.keys(result).reduce((acc: AuthObject, ele: string) => {
        const key: keyof typeof AuthEnum = ele as keyof typeof AuthEnum; // AuthEnum의 키로 제한
        acc[key] = authTypeCodeSet.has(AuthEnum[key]);
        return acc;
      }, result);
    } else {
      notFoundRoute();
    }
    return result;
  };

  const notFoundRoute = () => {
    throw new Error('데이터에서 현재 라우트를 찾을 수 없습니다.');
  }

  // 외부에 노출할 메소드
  return {
    getMenuAuth,
    getMenuAuthObject,
    getTabAuth,
    getTabAuthObject,
  };
})();

export default AuthModule;
