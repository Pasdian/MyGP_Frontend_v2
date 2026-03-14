import { Loader2, SaveAll } from 'lucide-react';
import { MyGPButtonPrimary } from './MyGPButtonPrimary';
import React from 'react';
import { MyGPButtonDanger } from './MyGPButtonDanger';

export default function MyGPButtonSubmit({
  isSubmitting,
  children,
  isSubmittingText = 'Enviando',
  danger = false,
  ...props
}: {
  isSubmitting?: boolean;
  children?: React.ReactNode;
  isSubmittingText?: string;
  danger?: boolean;
} & React.ComponentProps<typeof MyGPButtonPrimary>) {
  const content = isSubmitting ? (
    <>
      <Loader2 className="animate-spin mr-2" />
      <p>{isSubmittingText}</p>
    </>
  ) : (
    <>
      {children || (
        <>
          <SaveAll /> <p>Guardar Cambios</p>
        </>
      )}
    </>
  );

  if (!danger) {
    return (
      <MyGPButtonPrimary type="submit" disabled={isSubmitting} {...props}>
        {content}
      </MyGPButtonPrimary>
    );
  }

  return (
    <MyGPButtonDanger type="submit" disabled={isSubmitting} {...props}>
      {content}
    </MyGPButtonDanger>
  );
}
