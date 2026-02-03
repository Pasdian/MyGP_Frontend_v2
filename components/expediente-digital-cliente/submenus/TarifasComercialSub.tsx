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

export function TarifasComercialSub() {
  const { casa_id, setProgressMap, setFolderProgressFromDocKeys, folderMappings } = useCliente();

  const FOLDER_KEY = 'com.tarifas';

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

      if (data.tarifaAutorizada?.file) {
        formData.append(data.tarifaAutorizada.docKey, data.tarifaAutorizada.file);
      }

      if (data.tarifaPreferencial?.file) {
        formData.append(data.tarifaPreferencial.docKey, data.tarifaPreferencial.file);
      }

      if (data.tarifaUSA?.file) {
        formData.append(data.tarifaUSA.docKey, data.tarifaUSA.file);
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
      title="Tarifas"
      folderKey={FOLDER_KEY}
      formId="form-tarifas-comercial"
      isFormSubmitting={isSubmitting}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} id="form-tarifas-comercial">
        <FieldGroup>
          <div className="space-y-4 mb-4">
            <InputController
              form={form}
              controllerName="tarifaAutorizada.file"
              docKey="com.tarifa.aut"
              fieldLabel="Tarifa Autorizada (deberá entregarse en original):"
            />

            <InputController
              form={form}
              controllerName="tarifaPreferencial.file"
              docKey="com.tarifa.pre"
              fieldLabel="Tarifa de Preclasificación (en caso de aplicar):"
            />

            <InputController
              form={form}
              controllerName="tarifaUSA.file"
              docKey="com.tarifa.usa"
              fieldLabel="Tarifa Americana (en caso de aplicar):"
            />
          </div>
        </FieldGroup>
      </form>
    </ExpDigiCard>
  );
}
