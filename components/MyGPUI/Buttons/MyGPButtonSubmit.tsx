import { Loader2, SaveAll } from 'lucide-react';
import { MyGPButtonPrimary } from './MyGPButtonPrimary';

export default function MyGPButtonSubmit({
  isSubmitting,
  ...props
}: { isSubmitting?: boolean } & React.ComponentProps<typeof MyGPButtonPrimary>) {
  return (
    <MyGPButtonPrimary type="submit" className="w-[170px]" disabled={isSubmitting} {...props}>
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
