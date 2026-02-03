import { z } from 'zod/v4';
import { createPdfSchema, expiryDateSchema } from './utilSchema';

export const buildRepresentanteSchema = (ineSize: number) =>
  z.object({
    nombre: z
      .string({ message: 'Ingresa el nombre' })
      .min(1, 'Ingresa el nombre')
      .max(100, 'Máximo 100 caracteres'),
    apellido1: z
      .string({ message: 'Ingresa el primer apellido' })
      .min(1, 'Ingresa el primer apellido')
      .max(100, 'Máximo 100 caracteres'),
    apellido2: z.string('Ingresa el segundo apellido').max(100, 'Máximo 100 caracteres').optional(),
    rfc: z
      .string({ message: 'Ingresa un RFC' })
      .max(13, { error: 'El RFC es de máximo 13 caracteres' })
      .min(1, 'Ingresa un RFC'),
    curp: z
      .string({ message: 'Ingresa el curp' })
      .min(1, 'Ingresa el CURP')
      .max(18, 'Máximo 18 caracteres'),
    address_1: z
      .string({ message: 'Ingresa una dirección' })
      .min(1, 'Ingresa la dirección')
      .max(100, { message: 'Máximo 100 caracteres' }),
    neighbourhood: z
      .string({ message: 'Ingresa una colonia' })
      .min(1, 'Ingresa la colonia')
      .max(100, { message: 'Máximo 100 caracteres' }),
    municipality: z
      .string({ message: 'Ingresa un municipio' })
      .min(1, 'Ingresa la municipio')
      .max(100, { message: 'Máximo 100 caracteres' }),
    city: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    state: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    postal_code: z
      .string({ message: 'Ingresa una ciudad' })
      .min(1, 'Ingresa la ciudad')
      .max(100, { message: 'Máximo 100 caracteres' }),
    correoElectronico: z
      .email({
        pattern: z.regexes.email,
        error: 'El correo eléctronico es inválido',
      })
      .max(100, 'Máximo 100 caracteres'),
    numeroOficina: z.string().min(1, { error: 'Ingresa un número de oficina' }),
    telefonoRepresentanteLegal: z
      .string({
        message: 'Ingresa un número de teléfono',
      })
      .length(10, { message: 'El teléfono debe de ser igual a 10 caracteres' }),

    ine: z.object({
      file: createPdfSchema(ineSize),
      category: z.number(),
      filepath: z.string(),
      filename: z.string(),
    }),
    ineExp: expiryDateSchema,
  });
