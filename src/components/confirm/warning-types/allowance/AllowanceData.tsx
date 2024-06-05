import React from 'react';
import { useTranslations } from '../../../../i18n';
import { getChainExplorerUrl } from '../../../../lib/chains/chains';
import { AllowanceWarningData } from '../../../../lib/types';
import DivideContainer from '../../../common/DivideContainer';
import KeyValue from '../../../common/KeyValue';
import MenuItemOrLink from '../../../common/MenuItemOrLink';
import DataSeparator from '../../common/DataSeparator';
import AllowanceAsset from './AllowanceAsset';
import AllowanceSpender from './AllowanceSpender';

interface Props {
  data: AllowanceWarningData;
}

const AllowanceData = ({ data }: Props) => {
  const t = useTranslations();
  const explorerUrl = getChainExplorerUrl(data.chainId);

  return (
    <>
      <MenuItemOrLink size="small" href={explorerUrl ? `${explorerUrl}/address/${data.spender}` : undefined}>
        <KeyValue>
          <div>{t('confirm_allowance.spender')}</div>
          <AllowanceSpender address={data.spender} chainId={data.chainId} />
        </KeyValue>
      </MenuItemOrLink>

      <DataSeparator />

      <DivideContainer>
        {data.assets.map((address, i) => (
          <MenuItemOrLink
            size="small"
            href={explorerUrl ? `${explorerUrl}/address/${address}` : undefined}
            key={`${address}-${i}`}
          >
            <AllowanceAsset address={address} chainId={data.chainId} />
          </MenuItemOrLink>
        ))}
      </DivideContainer>
    </>
  );
};

export default AllowanceData;
