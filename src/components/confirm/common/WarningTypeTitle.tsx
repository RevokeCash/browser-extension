import React from 'react';
import { useTranslations } from '../../../i18n';
import { WarningType } from '../../../lib/constants';

interface Props {
  type: WarningType;
}

const WarningTypeTitle = ({ type }: Props) => {
  const t = useTranslations();

  return (
    <div className="w-full text-center px-4 py-3 text-neutral-850 dark:text-neutral-200">
      {t(`confirm_${type}.title`)}
    </div>
  );
};

export default WarningTypeTitle;
