import moment, {
  type DurationInputArg1,
  type DurationInputArg2,
  type MomentInput,
} from 'moment';
import axios from 'axios';
import { Dialog } from 'quasar';
import type { ResponseData } from './survey-interface';

export const addDateFormat = (
  value: MomentInput | null | undefined,
  addValue: DurationInputArg1,
  addType: DurationInputArg2,
  format?: string
) => {
  let result = '';
  const dt = moment(value ?? new Date());
  result = moment(dt)
    .add(addValue, addType)
    .format(format ?? 'YYYY.MM.DD');

  return result;
};

export const surveyAxios = (url: string, method: string, data: any, onSucessCallback: (data: ResponseData) => void): void => {
  axios({
      url: url,
      method: method,
      data: data,
    })
      .then(({ data, status }: { data: ResponseData; status: number }) => {
        if(status >= 200 && status < 300) onSucessCallback(data)
      })
      .catch((error) => {
        console.error('오류 발생:', error);
        Dialog.create({
          title: '오류',
          message: '요청 중 문제가 발생했습니다.',
        });
      });
}

export const surveyAwaitAxios = async (url: string, method: string, data: any): Promise<any> => {
  return await axios({
      url: url,
      method: method,
      data: data,
    })
      .then(({ data, status }: { data: any; status: number }) => {
        if(status >= 200 && status < 300) return data;
      })
      .catch((error) => {
        console.error('오류 발생:', error);
        Dialog.create({
          title: '오류',
          message: '복사 요청 중 문제가 발생했습니다.',
        });
      });
}
