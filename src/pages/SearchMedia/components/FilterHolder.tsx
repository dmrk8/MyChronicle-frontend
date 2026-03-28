import React, { type ReactNode } from 'react';

interface FilterHolderProps {
  children: ReactNode;
}

export const FilterHolder: React.FC<FilterHolderProps> = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  );
};

export default FilterHolder;
