import { FC, useEffect, useState } from 'react';
import { SidebarButton } from './SidebarButton';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import useTheme from 'next-theme';

export const SidebarTheme: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarButton
      text={theme === 'dark' ? 'Dark mode' : 'Light mode'}
      icon={theme === 'dark' ? <MoonIcon /> : <SunIcon />}
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }}
    />
  );
};
