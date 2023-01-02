import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation } from '../../i18n';
import Select from '../common/Select';

const ColorThemeSelect = () => {
  const { darkMode, theme, setTheme } = useColorTheme();
  const { t } = useTranslation();

  const options = [
    { value: 'system', icon: <ComputerDesktopIcon className="w-4 h-4" /> },
    { value: 'dark', icon: <MoonIcon className="w-4 h-4" /> },
    { value: 'light', icon: <SunIcon className="w-4 h-4" /> },
  ] as const;

  const selectTheme = (option: typeof options[number]) => setTheme(option.value);

  const displayOption = (option: typeof options[number]) => (
    <div className="flex gap-1 items-center">
      {option.icon} {t(`popup.settings.color_themes.${option.value}`)}
    </div>
  );

  return (
    <Select
      instanceId="color-theme-select"
      className="w-30"
      controlTheme={darkMode ? 'dark' : 'light'}
      menuTheme={darkMode ? 'dark' : 'light'}
      value={options.find((option) => option.value === theme)}
      options={options}
      onChange={selectTheme as any}
      formatOptionLabel={displayOption as any}
      menuPlacement="top"
      isSearchable={false}
    />
  );
};

export default ColorThemeSelect;
