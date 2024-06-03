import React from 'react';
import { Theme, useColorTheme } from '../../../hooks/useColorTheme';
import { useTranslations } from '../../../i18n';
import SelectPage, { Option } from '../settings/SelectPage';

const ColorThemeSelectPage = () => {
  const t = useTranslations();
  const { theme, setTheme } = useColorTheme();

  const options: Array<Option<Theme>> = [
    { value: 'system', label: t('popup.color_theme.themes.system') },
    { value: 'dark', label: t('popup.color_theme.themes.dark') },
    { value: 'light', label: t('popup.color_theme.themes.light') },
  ] as const;

  const selected = options.find((option) => option.value === theme) ?? options[0];

  return (
    <SelectPage
      title={t('popup.color_theme.title')}
      options={options}
      selected={selected}
      select={(option) => setTheme(option.value)}
    />
  );
};

export default ColorThemeSelectPage;
