import { FC } from 'react';
import { SidebarSettings } from './SidebarSettings';
import { SidebarTheme } from './SidebarTheme';
import { Cross2Icon } from '@radix-ui/react-icons';

interface SidebarProps {
  onMenuClick: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onMenuClick }) => {
  return (
    <aside
      className={`fixed bottom-0 top-0 z-50 flex h-full w-64 flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex justify-end">
          <button className="p-3 sm:hidden" onClick={onMenuClick}>
            <Cross2Icon />
          </button>
        </div>
        <div>
          <SidebarTheme />
          <SidebarSettings />
        </div>
      </div>
    </aside>
  );
};
