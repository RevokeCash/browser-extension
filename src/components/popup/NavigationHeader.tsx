import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../common/Title';

interface Props {
  title: string;
}

const NavigationHeader = ({ title }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full h-20 px-4 relative justify-center items-center">
      <Title>{title}</Title>
      <div className="absolute inset-0 flex items-center p-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default NavigationHeader;
