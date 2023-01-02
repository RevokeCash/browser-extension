import React from 'react';
import Switch from 'react-switch';
import useBrowserStorage from '../../hooks/useBrowserStorage';
import { useColorTheme } from '../../hooks/useColorTheme';

interface Props {
  storageKey: string;
  label: string;
  defaultValue: boolean;
}

const BooleanSetting = ({ storageKey, label, defaultValue }: Props) => {
  const { darkMode } = useColorTheme();
  const [value, setValue] = useBrowserStorage('local', storageKey, defaultValue);

  if (value === undefined) return null;

  return (
    <div className="flex justify-between items-center w-full border border-black dark:border-white rounded-lg px-2 py-1">
      <div className="text-sm">{label}</div>
      <Switch
        checked={value}
        onChange={(checked: boolean) => setValue(checked)}
        onColor={darkMode ? '#fff' : '#000'}
        onHandleColor={darkMode ? '#000' : '#fff'}
        offColor="#aaa"
        offHandleColor="#333"
        checkedIcon={false}
        uncheckedIcon={false}
        height={16}
        width={32}
        activeBoxShadow="0 0 2px 3px #aaa"
      />
    </div>
  );
};

export default BooleanSetting;
