import { FC } from 'react';
import { SidebarSettings } from './SidebarSettings';
import { SidebarTheme } from './SidebarTheme';
import { Executions } from './Executions';
import { SidebarHeader } from './SidebarHeader';

interface SidebarProps {
  onMenuClick: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ onMenuClick }) => {
  return (
    <aside
      className={`fixed bottom-0 top-0 z-50 flex h-full w-64 flex-none flex-col space-y-2 bg-neutral-800 p-2 transition-all sm:relative sm:top-0`}
    >
      <SidebarHeader onMenuClick={onMenuClick} />
      <Executions />
      <div className="border-t border-neutral-600 pt-2">
        <SidebarTheme />
        <SidebarSettings />
      </div>
    </aside>
  );
};
