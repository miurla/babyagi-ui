import { FC, useEffect, useState } from 'react';
import { SidebarButton } from './SidebarButton';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { translate } from '../../utils/translate';

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
      text={
        theme === 'light'
          ? `${translate("DARK_MODE", "common")}`
          : `${translate("LIGHT_MODE", "common")}`
      }
      icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }}
    />
  );
};
