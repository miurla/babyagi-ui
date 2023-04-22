import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { FC } from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="flex w-full bg-[#202123] px-4 py-3">
      <button className="p-2" onClick={onMenuClick}>
        <HamburgerMenuIcon />
      </button>
    </nav>
  );
};
