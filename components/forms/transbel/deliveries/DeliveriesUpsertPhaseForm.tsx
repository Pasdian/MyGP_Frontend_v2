'use client';

import React from 'react';

import { z } from 'zod/v4';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import { getDeliveries } from '@/types/transbel/getDeliveries';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import ExceptionCodeCombo from '@/components/comboboxes/ExceptionCodeCombo';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { IconTrashFilled } from '@tabler/icons-react';
import { deliveriesUpsertPhaseSchema } from '@/lib/schemas/transbel/deliveries/deliveriesUpsertPhaseSchema';
import { GPClient } from '@/lib/axiosUtils/axios-instance';
import { transbelModuleEvents } from '@/lib/posthog/events';
import posthog from 'posthog-js';
import { DeliveriesContext } from '@/contexts/DeliveriesContext';
import { formatISOtoDDMMYYYY } from '@/lib/utilityFunctions/formatISOtoDDMMYYYY';
import { MyGPButtonGhost } from '@/components/MyGPUI/Buttons/MyGPButtonGhost';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { FileController } from '@/components/expediente-digital-cliente/form-controllers/FileController';

const posthogEvent =
  transbelModuleEvents.find((e) => e.alias === 'TRANSBEL_MODIFY_DELIVERY')?.eventName || '';
const GESTOR_CLIENT_CODE = '005009';
const GESTOR_DEST_FOLDER = '04-VUCEM';

const getFileExtension = (filename: string) => {
  const trimmed = filename.trim();
  const lastDotIndex = trimmed.lastIndexOf('.');
  return lastDotIndex > -1 ? trimmed.slice(lastDotIndex) : '';
};

const renameFile = (file: File, nextName: string) =>
  new File([file], nextName, {
    type: file.type,
    lastModified: file.lastModified,
  });

export default function DeliveriesUpsertPhaseForm({ row }: { row: Row<getDeliveries> }) {
  const { user, getCasaUsername } = useAuth();
  const { setDeliveries } = React.useContext(DeliveriesContext);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof deliveriesUpsertPhaseSchema>>({
    resolver: zodResolver(deliveriesUpsertPhaseSchema),
    mode: 'onChange',
    defaultValues: {
      ref: row?.original?.REFERENCIA || '',
      phase: '140',
      exceptionCode: row?.original?.CE_140 || '',
      cdp: row?.original?.ENTREGA_CDP_140 || '',
      user: user.complete_user.user.casa_user_name
        ? user.complete_user.user.casa_user_name
        : 'MYGP',
      transporte: row?.original?.ENTREGA_TRANSPORTE_138?.split(' ')[0],
      podFile: undefined,
      gpsFile: undefined,
      otherFile: undefined,
    },
  });

  async function onSubmit(data: z.infer<typeof deliveriesUpsertPhaseSchema>) {
    setIsSubmitting(true);
    try {
      const casaUsername = getCasaUsername() || 'MYGP';
      const uploadFiles = [
        data.podFile
          ? renameFile(data.podFile, `${data.ref}-POD${getFileExtension(data.podFile.name)}`)
          : null,
        data.gpsFile
          ? renameFile(data.gpsFile, `${data.ref}-GPS${getFileExtension(data.gpsFile.name)}`)
          : null,
        data.otherFile ? renameFile(data.otherFile, `${data.ref}-${data.otherFile.name}`) : null,
      ].filter((file): file is File => file !== null);

      const uploadsFormData = new FormData();
      uploadsFormData.append('client', GESTOR_CLIENT_CODE);
      uploadsFormData.append('reference', data.ref);
      uploadsFormData.append('dest_folder', GESTOR_DEST_FOLDER);
      uploadsFormData.append('uploaded_by', casaUsername);
      uploadFiles.forEach((file) => {
        uploadsFormData.append('filenames', file.name);
        uploadsFormData.append('upload_files', file);
      });

      const phaseResponse = await GPClient.patch(`/api/casa/upsertPhase/${data.ref}`, {
        phase: data.phase,
        exceptionCode: data.exceptionCode,
        date: data.cdp,
        user: data.user,
      });

      if (phaseResponse.status !== 200) {
        toast.error('No se pudieron actualizar tus datos');
        return;
      }

      if (uploadFiles.length > 0) {
        await GPClient.post('/pyapi/gestor/uploads', uploadsFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const response = phaseResponse.data.data;
      const { NUM_REFE, FEC_ETAP } = response;

      setDeliveries((prev) =>
        prev.map((item) =>
          item.REFERENCIA === NUM_REFE
            ? {
                REFERENCIA: item.REFERENCIA,
                EE__GE: item.EE__GE,
                GUIA_HOUSE: '',
                ENTREGA_TRANSPORTE_138: item.ENTREGA_TRANSPORTE_138_FORMATTED,
                CE_138: item.CE_138,
                ENTREGA_CDP_140: FEC_ETAP,
                CE_140: item.CE_140,
                has_guia_house_error: false,
                has_entrega_cdp_error: false,
                has_entrega_transporte_error: false,
                BUSINESS_DAYS_ERROR_MSG: '',
                MSA_130_ERROR_MSG: '',
                ENTREGA_TRANSPORTE_138_ERROR_MSG: '',
                ENTREGA_CDP_140_ERROR_MSG: '',
                GUIA_HOUSE_ERROR_MSG: '',
                ENTREGA_TRANSPORTE_138_FORMATTED: '',
                ENTREGA_CDP_140_FORMATTED: formatISOtoDDMMYYYY(FEC_ETAP),
              }
            : item
        )
      );

      toast.success('Datos modificados correctamente');
      posthog.capture(posthogEvent);
    } catch (error: unknown) {
      const axiosLikeError = error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
          };
        };
      };

      toast.error(
        axiosLikeError.response?.data?.detail ||
          axiosLikeError.response?.data?.message ||
          'Error de conexión'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="ref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Referencia..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transporte"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a Transporte</FormLabel>
                <FormControl>
                  <Input disabled type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cdp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega a CDP</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileController
            form={form}
            fieldLabel="Prueba de Entrega (POD)"
            controllerName="podFile"
            accept=""
            buttonText="Adjuntar POD"
          />

          <FileController
            form={form}
            fieldLabel="GPS"
            controllerName="gpsFile"
            accept=""
            buttonText="Adjuntar GPS"
          />

          <FileController
            form={form}
            fieldLabel="Otros"
            controllerName="otherFile"
            accept=""
            buttonText="Adjuntar archivo"
          />

          <FormField
            control={form.control}
            name="exceptionCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Excepción</FormLabel>
                <FormControl>
                  <div className="flex">
                    <div className="mr-2">
                      <ExceptionCodeCombo
                        onSelect={(value) => {
                          field.onChange(value);
                          form.trigger();
                        }}
                        currentValue={field.value}
                      />
                    </div>
                    <Button
                      className="cursor-pointer bg-red-500 hover:bg-red-600"
                      type="button"
                      onClick={() => {
                        form.setValue('exceptionCode', '');
                        form.trigger();
                      }}
                    >
                      <IconTrashFilled />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuario</FormLabel>
                <FormControl>
                  <Input disabled placeholder="Usuario..." className="mb-4 uppercase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <MyGPButtonGhost>Cancelar</MyGPButtonGhost>
          </DialogClose>
          <MyGPButtonSubmit isSubmitting={isSubmitting} />
        </DialogFooter>
      </form>
    </Form>
  );
}
