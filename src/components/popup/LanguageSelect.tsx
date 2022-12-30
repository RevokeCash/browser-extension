import React from 'react';
import { useTranslation } from '../../i18n';
import Select from '../common/Select';

const LanguageSelect = () => {
  const { locale, setLocale } = useTranslation();

  const options = [
    { value: 'en', name: 'English', emoji: '🇬🇧' },
    { value: 'es', name: 'Español', emoji: '🇪🇸' },
    { value: 'zh', name: '中文', emoji: '🇨🇳' },
  ];

  const update = (option: any) => setLocale(option.value);

  const displayOption = (option: any, { context }: any) =>
    context === 'menu' ? `${option.emoji} ${option.name}` : option.emoji;

  return (
    <Select
      instanceId="language-select"
      value={options.find((option) => option.value === locale)}
      options={options}
      onChange={update}
      formatOptionLabel={displayOption}
      menuPlacement="top"
      isSearchable={false}
      minMenuWidth={110}
      size="sm"
    />
  );
};

export default LanguageSelect;
