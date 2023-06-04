import { FC } from 'react';
import { CollapsedButton } from '../Sidebar/CollapsedButton';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="flex h-12 w-full bg-[#202123] p-2">
      <CollapsedButton onClick={onMenuClick} isWhite={true} isLeft={true} />
    </nav>
  );
};
