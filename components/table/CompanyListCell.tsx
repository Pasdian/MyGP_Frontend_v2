'use client';
import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export default function CompanyListCell({
  companies,
}: {
  companies: { CVE_IMP: string; NOM_IMP: string }[];
}) {
  if (!companies || companies.length === 0) return <>--</>;

  const names = companies.map((c) => c.NOM_IMP ?? '').filter(Boolean);
  if (names.length === 0) return <>--</>;

  const MAX_INLINE = 2;
  const shown = names.slice(0, MAX_INLINE);
  const rest = names.length - shown.length;

  const inline = `${shown.join(', ')}${rest > 0 ? ', …' : ''}`;
  const full = `${names.join(', ')}`;

  return (
    <div className="flex items-center gap-1">
      <span className="block truncate" title={full}>
        {inline}
      </span>
      {rest > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" size="sm" className="h-auto p-0">
              +{rest} más
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <ScrollArea className="h-64 p-3">
              <div className="space-y-1">
                {names.map((n, i) => (
                  <div key={i} className="truncate">
                    • {n}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
