import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useAsync } from 'react-async-hook';
import InfoBlock from './common/InfoBlock';
import { twMerge } from 'tailwind-merge';
import Spinner from '../common/Spinner';
import Href from '../common/Href';
import { KERBERUS_API_KEY, Urls } from '../../lib/constants';
import { useTranslations } from 'use-intl';

interface Props {
  hostname: string;
}

const HostnameAnalysis = ({ hostname }: Props) => {
  const t = useTranslations();

  const { result, loading, error } = useAsync(async () => {
    const API_BASE_URL = 'https://v3.kerberus.com/detection/v3/v1';
    const res = await fetch(`${API_BASE_URL}/widget/scan/domain/${hostname}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KERBERUS_API_KEY,
      },
    });
    return res.json();
  }, []);

  if (error) return null;

  const className = twMerge(
    result?.data?.isBlocked ? 'bg-red-600/10 dark:bg-red-300/10' : 'bg-green-600/10 dark:bg-green-300/10',
    loading && 'bg-neutral-200 dark:bg-neutral-750',
    'h-12 px-3 text-xs mt-2',
  );

  return (
    <InfoBlock className={className}>
      <div className="w-full flex flex-col gap-2">
        <div className="flex gap-2 justify-between">
          <HostnameAnalysisResult isBlocked={result?.data?.isBlocked} isLoading={loading} />
          <Href
            href={Urls.KERBERUS}
            className="flex flex-col items-end justify-center text-zinc-500 dark:text-zinc-400 visited:text-zinc-500 dark:visited:text-zinc-400 hover:text-[#5470FF] hover:visited:text-[#5470FF] hover:dark:text-[#5470FF]"
            underline="none"
          >
            <div className="flex items-center justify-center gap-2">
              <div>{t.rich('common.domain_analysis.powered_by')}</div>
              <img src="/images/vendor/kerberus-icon.svg" alt="Kerberus" className="h-6" />
            </div>
            <div className="w-full text-right text-[10px]">{t('common.domain_analysis.install_for_coverage')}</div>
          </Href>
        </div>
      </div>
    </InfoBlock>
  );
};

interface HostnameAnalysisResultProps {
  isBlocked?: boolean;
  isLoading?: boolean;
}

const HostnameAnalysisResult = ({ isBlocked, isLoading }: HostnameAnalysisResultProps) => {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Spinner />
        <div>{t('common.domain_analysis.checking_domain')}</div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <XCircleIcon className="h-6 w-6 text-red-600" />
        <div>{t('common.domain_analysis.risk_detected')}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0  ">
      <CheckCircleIcon className="h-6 w-6 text-green-600" />
      <div>{t('common.domain_analysis.no_issues_found')}</div>
    </div>
  );
};

export default HostnameAnalysis;
