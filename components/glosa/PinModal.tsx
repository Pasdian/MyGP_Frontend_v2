'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pin } from 'lucide-react';
import { ERROR_TYPES, ERROR_CATEGORIES } from '@/lib/glosa/types';
import type { ErrorType } from '@/lib/glosa/types';

type Props = {
  open: boolean;
  draft: { x: number; y: number; file: string; page: number } | null;
  onSave: (data: { type: ErrorType; category: string; note: string }) => void;
  onCancel: () => void;
};

export default function PinModal({ open, draft, onSave, onCancel }: Props) {
  const [type, setType] = useState<ErrorType>(ERROR_TYPES[0]);
  const [category, setCategory] = useState<string>(ERROR_CATEGORIES[0]);
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave({ type, category, note });
    setNote('');
    setType(ERROR_TYPES[0]);
    setCategory(ERROR_CATEGORIES[0]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-[440px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Nueva anotación</DialogTitle>
          {draft && (
            <p className="text-[11px] text-[#737373]">
              {draft.file} · pos {Math.round(draft.x)}%, {Math.round(draft.y)}%
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Error type toggle */}
          <div>
            <Label className="text-[10px] uppercase text-[#737373] font-semibold mb-1 block">
              Tipo de error
            </Label>
            <div className="flex gap-1.5">
              {ERROR_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                    type === t
                      ? 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                      : 'border-[#E5E5E5] bg-white hover:bg-[#F5F5F5]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-[10px] uppercase text-[#737373] font-semibold mb-1 block">
              Categoría
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERROR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div>
            <Label className="text-[10px] uppercase text-[#737373] font-semibold mb-1 block">
              Descripción del cambio solicitado
            </Label>
            <Textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe el error con precisión y el cambio que se requiere."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Pin className="h-4 w-4 mr-1" />
            Agregar anotación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
