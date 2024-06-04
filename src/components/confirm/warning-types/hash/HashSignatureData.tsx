import React from 'react';
import { useTranslations } from '../../../../i18n';
import { HashSignatureWarningData } from '../../../../lib/types';
import { AddressOrDisplay } from '../../../common/AddressOrDisplay';
import KeyValue from '../../../common/KeyValue';
import MenuItem from '../../../common/MenuItem';
import InfoBlock from '../../common/InfoBlock';

interface Props {
  data: HashSignatureWarningData;
}

const HashSignatureData = ({ data }: Props) => {
  const t = useTranslations();

  return (
    <>
      <MenuItem size="small">
        <KeyValue>
          <div>{t('confirm_hash.hash')}</div>
          <AddressOrDisplay address={data.hash} />
        </KeyValue>
      </MenuItem>
      <InfoBlock>{t('confirm_hash.explanation')}</InfoBlock>
    </>
  );
};

export default HashSignatureData;
