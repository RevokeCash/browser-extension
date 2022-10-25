import React from 'react';
import Select from 'react-select';
import { useTranslation } from '../i18n';

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
      value={options.find((option) => option.value === locale)}
      options={options}
      onChange={update}
      formatOptionLabel={displayOption}
      menuPlacement="top"
      isSearchable={false}
      styles={{
        menu: (styles) => ({
          ...styles,
          width: 100,
          margin: 0,
          fontSize: '0.875rem',
        }),
        menuList: (styles) => ({
          ...styles,
          width: 100,
          padding: 0,
        }),
        dropdownIndicator: (styles) => ({
          ...styles,
          padding: 2,
        }),
        valueContainer: (styles) => ({
          ...styles,
          padding: 2,
        }),
        control: (styles) => ({
          ...styles,
          minHeight: 24,
          cursor: 'pointer',
        }),
        option: (styles) => ({
          ...styles,
          cursor: 'pointer',
          padding: '4px 8px',
        }),
      }}
      theme={(theme) => ({
        ...theme,
        borderRadius: 4,
        colors: {
          ...theme.colors,
          primary: 'black',
          primary25: '#ddd',
          neutral10: 'black',
          neutral20: 'black',
          neutral30: 'black',
          neutral40: 'black',
          neutral50: 'black',
          neutral60: 'black',
          neutral70: 'black',
          neutral80: 'black',
          neutral90: 'black',
        },
      })}
    />
  );
};

export default LanguageSelect;
