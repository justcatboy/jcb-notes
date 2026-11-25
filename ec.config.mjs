import { defineEcConfig, pluginFramesTexts } from 'astro-expressive-code';

pluginFramesTexts.addLocale('ru', {
  terminalWindowFallbackTitle: 'Терминал',
  copyButtonTooltip: 'Скопировать',
  copyButtonCopied: 'Скопировано',
});

export default defineEcConfig({
  defaultLocale: 'ru',
  defaultProps: { frame: 'code' },
  themes: ['min-dark', 'min-light'],
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
  useDarkModeMediaQuery: true,
  styleOverrides: {
    borderRadius: '0',
    borderWidth: '1px',
    borderColor: 'var(--line)',
    codeBackground: 'var(--code-bg)',
    codeFontFamily: 'var(--mono)',
    codeFontSize: '13.5px',
    codeLineHeight: '1.6',
    uiFontFamily: 'var(--mono)',
    uiFontSize: '12.5px',
    focusBorder: 'var(--accent)',
    frames: {
      shadowColor: 'transparent',
      editorBackground: 'var(--code-bg)',
      editorTabBarBackground: 'var(--bg)',
      editorTabBarBorderBottomColor: 'var(--line)',
      editorActiveTabBackground: 'var(--code-bg)',
      editorActiveTabForeground: 'var(--fg)',
      editorActiveTabIndicatorTopColor: 'transparent',
      editorActiveTabIndicatorBottomColor: 'transparent',
      editorActiveTabBorderColor: 'var(--line)',
      terminalBackground: 'var(--code-bg)',
      terminalTitlebarBackground: 'var(--bg)',
      terminalTitlebarForeground: 'var(--muted)',
      terminalTitlebarBorderBottomColor: 'var(--line)',
      terminalTitlebarDotsForeground: 'var(--line)',
      inlineButtonForeground: 'var(--muted)',
      inlineButtonBorder: 'var(--line)',
      tooltipSuccessBackground: 'var(--fg)',
      tooltipSuccessForeground: 'var(--bg)',
    },
  },
});
