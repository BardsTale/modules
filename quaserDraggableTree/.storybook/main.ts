import type { StorybookConfig } from "@storybook/vue3-webpack5";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/vue3-webpack5",
    options: {},
  },
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (config) => {
    // SCSS 및 CSS 처리 로더 추가
    config.module?.rules?.push({
      test: /\.scss$/,
      use: [
        'style-loader', // CSS를 DOM에 삽입
        'css-loader', // CSS를 JS로 변환
        'sass-loader', // SCSS를 CSS로 변환
      ],
    });
    return config;
  },
};
export default config;
