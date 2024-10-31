import type { Meta, StoryObj } from '@storybook/vue3';
import QDraggableTree from '../components/QDraggableTree.vue';
import data from '../data/data.json'

const meta: Meta<typeof QDraggableTree> = {
  title: 'Example/QDraggableTree',
  component: QDraggableTree,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'TreeData[] 타입 구조의 데이터',
      defaultValue: data,
      control: { type: 'object' },  // JSON 데이터를 편집할 수 있는 객체 형식의 control 설정
      },
  },
};


export default meta;
type Story = StoryObj<typeof QDraggableTree>;
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Primary: Story = {
  args: {
    data: data,
  },
};