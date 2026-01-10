'use client'

import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary'
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo'
import { useCompanies } from '@/hooks/useCompanies'
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileIcon } from 'lucide-react'

export default function DEP(){
  const [client, setClient] = React.useState('')
  const {rows: companies, loading: isCompaniesLoading} = useCompanies()

  const companiesOptions = React.useMemo(() => {
    return companies.map(company => ({
      value: company.CVE_IMP,
      label: company.NOM_IMP
    }))
  }, [companies])

  return (
    <div>
     <div className="w-72">
       <MyGPCombo placeholder="Selecciona un cliente" value={client} setValue={setClient} options={companiesOptions} label="Selecciona un cliente" showValue/>
     </div>
     <DocumentosImportadorAccordion/>
     <DocumentosComercialAccordion/>
     <DocumentosComplementarios/>
    </div>
  )
}

export function DocumentosComplementarios(){
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1 text-white"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-green-700 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_auto] gap-2 place-items-center">
          <FileIcon size={18}/>
          <p>Documentos Complementarios</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance">
          <div className='grid grid-cols-[250px_auto] gap-4'>
            <Label htmlFor='cuestionario_prevencion_lavado'>Cuestionario de Prevención de Lavado de Activos y Financiación de Terrorismo:</Label>
            <Input id='cuestionario_prevencion_lavado' type='file'/> 
            <Label htmlFor='alta_cliente'>Alta de Clientes:</Label>
            <Input id='alta_clientes' type='file'/> 
            <Label htmlFor='lista_clinton'>Lista Clinton:</Label>
            <Input id='lista_clinton' type='file'/> 
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function DocumentosComercialAccordion() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1 text-white"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-slate-700 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_auto] gap-2 place-items-center">
          <FileIcon size={18}/>
          <p>Documentos del Área Comercial</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance">
          <div className='grid grid-cols-[250px_auto] gap-4'>
            <Label htmlFor='carta_encomienda_3901'>Carta Encomienda patente 3901:</Label>
            <Input id='carta_encomienda_3901' type='file'/> 
            <Label>Carta Encomienda patente 3072:</Label>
            <Input id='carta_encomienda_3901' type='file'/> 
            <Label>Aviso de Privacidad</Label>
            <Input id='aviso_privacidad' type='file'/> 
            <Label>Acuerdo Confidencialidad</Label>
            <Input id='acuerdo_confidencialidad' type='file'/> 
            <Label>Acuerdo de Colaboración Socio Comercial</Label>
            <Input id='acuerdo_colaboracion_socio' type='file'/> 
            <Label>Tarifa Autorizada (deberá entregarse en original)</Label>
            <Input id='tarifa_autorizada' type='file'/> 
            <Label>Tarifa de Preclasificación (en caso de aplicar)</Label>
            <Input id='tarifa_preclasificacion' type='file'/> 
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function DocumentosImportadorAccordion() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue="item-1 text-white"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-blue-800 text-white px-2 [&>svg]:text-white mb-2">
          <div className="grid grid-cols-[auto_auto] gap-2 place-items-center">
            <FileIcon size={18}/>
            <p>Documentos del Importador y/o Exportador</p>
          </div>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-2 text-balance">
          <ActaConstitutivaAccordion/>
          <DatosContactoAccordion/>
          <HaciendaImportadorAccordion/>
          <BajoProtestaAccordion/>
          <AcreditacionAccordion/>
          <HaciendaAgenteAduanalAccordion/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function ActaConstitutivaAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Documentos del Importador</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid grid-cols-[150px_auto_70px_auto] gap-2">
              <Label htmlFor="acta_constitutiva">Acta Constitutiva:</Label>
              <Input id="acta_constitutiva" type="file" />
              <Label htmlFor="acta_constitutiva_exp">Expira en:</Label>
              <Input id="acta_constitutiva_exp" type="date" />

              <Label htmlFor="poder_notarial">Poder Notarial:</Label>
              <Input id="poder_notarial" type="file" />
              <Label htmlFor="poder_notarial_exp">Expira en:</Label>
              <Input id="poder_notarial_exp" type="date" />

              <Label htmlFor="representante_legal">Identificación del Representante Legal:</Label>
              <Input id="representante_legal" type="file" />
              <Label htmlFor="representante_legal_exp">Expira en:</Label>
              <Input id="representante_legal_exp" type="date" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}

function DatosContactoAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Datos de Contacto del Importador</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid grid-cols-[150px_auto_150px_auto] gap-y-10 gap-x-4">
              <Label htmlFor="email">Correo Electronico:</Label>
              <Input id="email" placeholder="ejemplo@gmail.com" className="col-span-3"/>

              <Label htmlFor="numero_oficina">Número de Oficina</Label>
              <Input id="numero_oficina" placeholder="1234" className="col-span-3"/>

              <Label htmlFor="representante_legal">Identificación del Representante Legal:</Label>
              <Input id="representante_legal" placeholder="xyz" className="col-span-3" />

              <Label htmlFor="comprobante_domicilio">Comprobante de Domicilio:</Label>
              <Input id="comprobante_domicilio" type="file" />
              <Label htmlFor="comprobante_domicilio_exp">Comprobante de domicilio expira en:</Label>
              <Input id="comprobante_domicilio_exp" type="date" />

              <Label htmlFor="fotos_domicilio_fiscal" className="self-start">Fotos Domicilio Fiscal:</Label>
              <div id="fotos_domicilio_fiscal" className="grid grid-rows-2 gap-2 col-span-3">
                <Input id="fotos_domicilio_fiscal_1" type="file" />
                <Input id="fotos_domicilio_fiscal_2" type="file" />
              </div>

              <Label htmlFor="acreditacion">Documento que acredite la legal propiedad del inmueble:</Label>
              <Input id="acreditacion" type="file"/>
              <Label htmlFor="acreditacion_exp">Documento que acredita la legal propiedad del inmueble expira en:</Label>
              <Input id="acreditacion_exp" type="date" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}

function HaciendaImportadorAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Datos de Hacienda del Importador</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid grid-cols-[150px_auto] gap-y-4 gap-x-4">
              <Label htmlFor="sat_rfc_importador">RFC</Label>
              <Input id="sat_rfc_importador" placeholder="RFC1234"/>
              <Label htmlFor="sat_cer_importador">Certificado del Importador (.cer)</Label>
              <Input id="sat_cer_importador" type="file" />
              <Label htmlFor="sat_efirma_importador">e-firma del Importador(.key)</Label>
              <Input id="sat_efirma_importador" type="file" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}

function BajoProtestaAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Manifiesto Bajo Protesta</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid place-items-center grid-cols-[25px_350px_auto] gap-y-4 gap-x-4">
              <Checkbox />
              <Label htmlFor="manifiesto_bajo_protesta_1">Manifiesto bajo protesta de decir verdad del usuario que solicito la operación</Label>
              <Input id="manifiesto_bajo_protesta_1" type="file" />
              <Checkbox />
              <Label htmlFor="manifiesto_bajo_protesta_2">Manifiesto bajo protesta de decir verdad en el que el agente aduanal señale que verifico a los usuarios</Label>
              <Input id="manifiesto_bajo_protesta_2" type="file" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}

function AcreditacionAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Documentos que acredita el Agente Aduanal</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid place-items-center grid-cols-[155px_auto] gap-y-4 gap-x-4">
              <Label htmlFor="acreditación_opinion">Opinión de Cumplimiento de Obligaciones Fiscales (mes en curso)</Label>
              <Input id="acreditación_opinion" type="file" />
              <Label htmlFor="datos_bancarios_hoja_membretada">Datos Bancarios en Hoja Membretada</Label>
              <Input id="datos_bancarios_hoja_membretada" type="file" />
              <Label htmlFor="generacion_encargo_conferido">Generación del Encargo Conferido A.A. José Antonio Pascal Calvillo (no aplica en exportación)</Label>
              <Input id="generacion_encargo_conferido" type="file" />
              <Label htmlFor="generacion_encargo_conferido">Generación del Encargo Conferido A.A. Marco Antonio Bremer García (no aplica en exportación)</Label>
              <Input id="generacion_encargo_conferido" type="file" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}
function HaciendaAgenteAduanalAccordion(){
  return(
    <Accordion type="single" collapsible className="w-full" defaultValue="item-2 text-white">
      <AccordionItem value="item-2" className="ml-4">
        <AccordionTrigger className="bg-blue-500 text-white px-2 [&>svg]:text-white">Datos de Hacienda del Agente Aduanal</AccordionTrigger>
        <AccordionContent>
          <Card className="w-full px-4">
            <div className="grid grid-cols-[150px_auto] gap-y-4 gap-x-4">
              <Label htmlFor="sat_cer_agente_aduanal">Certificado del Agente Aduanal (.cer)</Label>
              <Input id="sat_cer_agente_aduanal" type="file" />
              <Label htmlFor="sat_efirma_agente_aduanal">e-firma del Agente Aduanal (.key)</Label>
              <Input id="sat_efirma_agente_aduanal" type="file" />
            </div>
          </Card> 
        </AccordionContent>     
      </AccordionItem>
    </Accordion>
  )
}
