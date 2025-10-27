import { Loader2, SaveAll } from 'lucide-react';
import { MyGPButtonPrimary } from './MyGPButtonPrimary';

export default function MyGPButtonSubmit({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <MyGPButtonPrimary type="submit" className="w-[170px]" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin mr-2" />
          <p>Enviando</p>
        </>
      ) : (
        <>
          <SaveAll /> <p>Guardar Cambios</p>
        </>
      )}
    </MyGPButtonPrimary>
  );
}
