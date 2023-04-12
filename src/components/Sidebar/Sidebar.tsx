import { FC } from 'react';
import { SidebarSettings } from './SidebarSettings';
import { SidebarTheme } from './SidebarTheme';

export const Sidebar: FC = () => {
  return (
    <aside
      className={`fixed bottom-0 top-0 z-50 flex h-full w-64 flex-none flex-col space-y-2 bg-[#202123] p-2 transition-all sm:relative sm:top-0`}
    >
      <div className="flex h-full flex-col justify-end">
        <SidebarTheme />
        <SidebarSettings />
      </div>
    </aside>
  );
};
