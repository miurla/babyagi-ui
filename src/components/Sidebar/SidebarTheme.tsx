import { FC, useEffect, useState } from 'react';
import { SidebarButton } from './SidebarButton';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

export const SidebarTheme: FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SidebarButton
      text={theme === 'light' ? 'Dark mode' : 'Light mode'}
      icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }}
    />
  );
};
