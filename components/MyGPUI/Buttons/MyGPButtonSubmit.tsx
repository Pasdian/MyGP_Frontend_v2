import { Loader2, SaveAll } from 'lucide-react';
import { MyGPButtonPrimary } from './MyGPButtonPrimary';
import React from 'react';

export default function MyGPButtonSubmit({
  isSubmitting,
  children,
  isSubmittingText = 'Enviando',
  ...props
}: {
  isSubmitting?: boolean;
  children?: React.ReactNode;
  isSubmittingText?: string;
} & React.ComponentProps<typeof MyGPButtonPrimary>) {
  return (
    <MyGPButtonPrimary type="submit" disabled={isSubmitting} {...props}>
      {isSubmitting ? (
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
      )}
    </MyGPButtonPrimary>
  );
}
