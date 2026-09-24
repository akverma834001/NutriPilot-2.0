import { useContext } from 'react';
import { PersonalStateContext } from './PersonalStateContext';

export const usePersonalState = () => {
  const context = useContext(PersonalStateContext);
  if (!context) {
    throw new Error('usePersonalState must be used within a PersonalStateProvider');
  }
  return context;
};
