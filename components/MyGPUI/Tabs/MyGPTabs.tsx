import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface MyGPTab {
  value: string;
  label: string;
}

interface MyGPTabsProps {
  tabs: MyGPTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * MyGPTabs — auto-sizing, scrollable tab header component.
 * - Each tab adjusts width to its label.
 * - Overflow is horizontally scrollable (no wrapping).
 */
export function MyGPTabs({ tabs, defaultValue, value, onValueChange, className }: MyGPTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn('mb-4 w-full max-w-full overflow-hidden', className)}
    >
      <TabsList
        className={cn(
          'w-full', // fill available width
          'flex gap-2 overflow-x-auto no-scrollbar p-1',
          'whitespace-nowrap scroll-smooth',
          'bg-muted/50 border rounded-md' // background uses full width
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'cursor-pointer flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition',
              'data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm',
              'hover:bg-blue-100 dark:hover:bg-blue-900/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2'
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
