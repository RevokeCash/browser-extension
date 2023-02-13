import React from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation } from '../../i18n';
import Select from '../common/Select';

// This has been copy pasted with slight mdifications from RevokeCash/revoke.cash

const LanguageSelect = () => {
  const { locale, setLocale } = useTranslation();
  const { darkMode } = useColorTheme();

  const options = [
    { value: 'en', name: 'English', emoji: '🇬🇧' },
    { value: 'es', name: 'Español', emoji: '🇪🇸' },
    { value: 'zh', name: '中文', emoji: '🇨🇳' },
  ];

  const update = (option: any) => setLocale(option.value);

  const displayOption = (option: any) => `${option.emoji} ${option.name}`;

  return (
    <Select
      instanceId="language-select"
      className="w-30"
      controlTheme={darkMode ? 'dark' : 'light'}
      menuTheme={darkMode ? 'dark' : 'light'}
      value={options.find((option) => option.value === locale) ?? options[0]}
      options={options}
      onChange={update}
      formatOptionLabel={displayOption}
      menuPlacement="top"
      isSearchable={false}
      size="md"
    />
  );
};

export default LanguageSelect;
