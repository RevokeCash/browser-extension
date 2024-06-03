import React from 'react';
import Switch from 'react-switch';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { useColorTheme } from '../../../hooks/useColorTheme';

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
    <div className="flex justify-between items-center w-full px-5 py-4 gap-4 bg-neutral-0 dark:bg-neutral-750">
      <div>{label}</div>
      <Switch
        checked={value}
        onChange={(checked: boolean) => setValue(checked)}
        onColor={darkMode ? '#262626' : '#EBEBEB'} // bg-neutral-150 dark:bg-neutral-800
        onHandleColor="#FDB952" // bg-brand
        offColor={darkMode ? '#262626' : '#EBEBEB'} // bg-neutral-150 dark:bg-neutral-800
        offHandleColor={darkMode ? '#A3A3A3' : '#525252'} // bg-neutral-400 dark:bg-neutral-600
        checkedIcon={false}
        uncheckedIcon={false}
        height={26}
        width={52}
        handleDiameter={18}
        activeBoxShadow="0 0 0px 2px #FDB952" // bg-brand
      />
    </div>
  );
};

export default BooleanSetting;
