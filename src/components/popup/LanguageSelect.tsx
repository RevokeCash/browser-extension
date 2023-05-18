import React from 'react';
import { FormatOptionLabelMeta } from 'react-select';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation } from '../../i18n';
import Logo from '../common/Logo';
import Select from '../common/Select';

// This has been copy pasted with slight mdifications from RevokeCash/revoke.cash

interface Option {
  value: string;
  name: string;
}

const LanguageSelect = () => {
  const { locale, setLocale } = useTranslation();
  const { darkMode } = useColorTheme();

  const options: Option[] = [
    { value: 'en', name: 'English' },
    { value: 'zh', name: '中文' },
    { value: 'ru', name: 'Русский' },
    { value: 'ja', name: '日本語' },
    { value: 'es', name: 'Español' },
  ];

  const update = (option: any) => setLocale(option.value);

  const displayOption = (option: Option, { context }: FormatOptionLabelMeta<Option>) => {
    const src = `/images/flags/${option.value}.svg`;
    return (
      <div className="flex gap-1 items-center">
        <Logo src={src} alt={option.name} size={16} border />
        <div>{option.name}</div>
      </div>
    );
  };

  return (
    <Select
      instanceId="language-select"
      className="w-full"
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
