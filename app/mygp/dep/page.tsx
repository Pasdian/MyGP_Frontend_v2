'use client'

import { MyGPButtonPrimary } from '@/components/MyGPUI/Buttons/MyGPButtonPrimary'
import { MyGPCombo } from '@/components/MyGPUI/Combobox/MyGPCombo'
import { useCompanies } from '@/hooks/useCompanies'
import React from 'react'

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
     <MyGPButtonPrimary>
      Ver archivo
     </MyGPButtonPrimary>
    </div>
  )
}
