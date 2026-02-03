import * as z from 'zod/v4';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '@/components/ui/field';
import { useCliente } from '@/contexts/expediente-digital-cliente/ClienteContext';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ExpDigiCard from './ExpDigiCard';
import { EXP_DIGI_DEFAULT_VALUES, EXP_DIGI_SCHEMAS } from '../schemas/schemasMain';
import { submitFolderAndUpdateProgress } from '@/lib/expediente-digital-cliente/submitFolderAndUpdateProgress';
import { InputController } from '../InputController';

export function CartaEncomiendaSub() {
  const { casa_id, setProgressMap, setFolderProgressFromDocKeys, folderMappings } = useCliente();

  // Adjust to the folder key you registered in schemasMain + folderMappings
  const FOLDER_KEY = 'com.encomienda';

  const DOC_KEYS = React.useMemo(() => folderMappings[FOLDER_KEY]?.docKeys ?? [], [folderMappings]);

  const { getCasaUsername } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = EXP_DIGI_SCHEMAS[FOLDER_KEY];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY],
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('client_id', casa_id);
      formData.append('uploaded_by', getCasaUsername() || 'MYGP');

      // Use docKey from schema/defaultValues so it always matches FOLDER_MAPPINGS
      if (data.cartaEncomienda3901?.file) {
        formData.append(data.cartaEncomienda3901.docKey, data.cartaEncomienda3901.file);
      }

      if (data.cartaEncomienda3072?.file) {
        formData.append(data.cartaEncomienda3072.docKey, data.cartaEncomienda3072.file);
      }

      if (data.avisoPrivacidad?.file) {
        formData.append(data.avisoPrivacidad.docKey, data.avisoPrivacidad.file);
      }

      const { failed } = await submitFolderAndUpdateProgress({
        folderKey: FOLDER_KEY,
        formData,
        docKeys: DOC_KEYS,
        setProgressMap,
        recomputeFolderProgress: setFolderProgressFromDocKeys,
      });

      if (failed.length > 0) {
        toast.error(`Fallaron: ${failed.join(', ')}`);
      } else {
        toast.success('Archivos guardados correctamente');
        form.reset(EXP_DIGI_DEFAULT_VALUES[FOLDER_KEY]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al subir los archivos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ExpDigiCard
      title="Cartas Encomienda y Aviso de Privacidad"
      folderKey={FOLDER_KEY}
      formId="form-carta-encomienda"
      isFormSubmitting={isSubmitting}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} id="form-carta-encomienda">
        <FieldGroup>
          <div className="space-y-4 mb-4">
            <InputController
              form={form}
              controllerName="cartaEncomienda3901.file"
              docKey="com.encomienda.3901"
              fieldLabel="Carta Encomienda Patente 3901:"
            />

            <InputController
              form={form}
              controllerName="cartaEncomienda3072.file"
              docKey="com.encomienda.3072"
              fieldLabel="Carta Encomienda Patente 3072:"
            />

            <InputController
              form={form}
              controllerName="avisoPrivacidad.file"
              docKey="com.privacidad"
              fieldLabel="Aviso de Privacidad:"
            />
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
