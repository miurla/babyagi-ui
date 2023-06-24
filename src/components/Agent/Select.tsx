import { SelectItem } from '@/types';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import { FC } from 'react';
import Image from 'next/image';
import { translate } from '../../utils/translate';
import { InfoCard } from './InfoCard';
import Link from 'next/link';

interface Props {
  label: string;
  item: SelectItem;
  items: SelectItem[];
  onChange: (value: string) => void;
}

export const Select: FC<Props> = ({ label, item, items, onChange }) => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg)$/i;
  const alertMessage = 'GPT_4_WARNING';
  const isImage = imageExtensions.test(item.icon ?? '');
  const isAlert = alertMessage === item.message;
  const iconLabel = (item: SelectItem) => {
    const label = isImage ? (
      <Image
        src={`/${item.icon}`}
        alt={item.name}
        width={14}
        height={14}
        className="dark:invert"
      />
    ) : item.icon ? (
      <span>{item.icon}</span>
    ) : null;
    return label;
  };
  const badge = (item: SelectItem) => {
    const badge = item.badge ? (
      <span className="select-none rounded-full bg-blue-500 bg-opacity-10 px-2 py-0.5 text-[10px] text-blue-500 dark:bg-blue-500 dark:bg-opacity-10 dark:text-blue-300">
        {item.badge}
      </span>
    ) : null;
    return badge;
  };
  const linkMessage = () => {
    return (
      <label className="text-xs text-neutral-400 dark:text-neutral-400">
        {translate('DESCRIPTION_BABYAGI')} {translate('FOR_MORE_DETAILS')}
        <Link
          href={'https://twitter.com/yoheinakajima/status/1657448504112091136'}
          passHref
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {translate('REFER_TO_THE_ORIGINAL_PAPER')}
        </Link>
      </label>
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex w-full flex-col text-left text-xs">
        <div className="mb-0.5 flex h-5 items-center">
          <label className="text-neutral-400 dark:text-neutral-500">
            {label}
          </label>
          {item.message && item.id !== 'babyagi' ? (
            <InfoCard alert={isAlert}>
              <span
                className={`p-1 font-mono text-xs ${
                  isAlert
                    ? 'text-red-400 dark:text-red-600'
                    : 'text-right text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {isAlert
                  ? `${translate(item.message as string, 'constants')} `
                  : item.id !== 'babyagi'
                  ? linkMessage()
                  : `${item.message}`}
              </span>
            </InfoCard>
          ) : null}
        </div>
        <SelectPrimitive.Root onValueChange={onChange} value={item.id}>
          <SelectPrimitive.Trigger className="focus:shadow-outline inline-flex w-full cursor-pointer appearance-none items-center justify-between rounded-lg border border-neutral-200 p-3 text-xs text-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
            <SelectPrimitive.Value>
              <div className="inline-flex h-5 items-center gap-2 truncate font-mono">
                {iconLabel(item)}
                {item.name}
                {badge(item)}
              </div>
            </SelectPrimitive.Value>
            <SelectPrimitive.Icon>
              <ChevronDownIcon />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Content className="z-10">
            <SelectPrimitive.ScrollUpButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="z-20 rounded-lg border bg-white p-2 shadow-lg dark:border-neutral-900 dark:bg-neutral-800">
              <SelectPrimitive.Group>
                {items.map((item, index) => (
                  <SelectPrimitive.Item
                    key={`${item.id}-${index}`}
                    value={item.id}
                    className={
                      'relative flex select-none items-center rounded-md px-8 py-2 font-mono font-medium text-gray-700 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:focus:bg-neutral-900'
                    }
                  >
                    <SelectPrimitive.ItemText>
                      <div className="inline-flex h-6 items-center gap-2">
                        {iconLabel(item)}
                        {item.name}
                        {badge(item)}
                      </div>
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <CheckIcon />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex items-center justify-center text-gray-700 dark:text-gray-300">
              <ChevronDownIcon />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Root>
        <div className="flex items-center justify-end">
          {item.message && !isAlert && (
            <span className="p-1 font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {item.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
