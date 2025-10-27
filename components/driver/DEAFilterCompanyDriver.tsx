import React from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import CompanySelect from '../selects/CompanySelect';
import { FilterIcon } from 'lucide-react';

export default function DEAFilterCompanyDriver({
  companySelect,
  setCompanySelect,
}: {
  companySelect: string[];
  setCompanySelect: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  React.useEffect(() => {
    // Run the tour once per user
    const seenKey = 'companyFilterTourSeen';
    if (!localStorage.getItem(seenKey)) {
      const tour = driver({
        allowClose: true,
        showProgress: false,
        popoverClass: 'text-xs',
        showButtons: ['next', 'close'],
        nextBtnText: 'Siguiente',
        doneBtnText: 'Cerrar',
        steps: [
          {
            element: '#company-select-filter',
            popover: {
              title: 'Filtrar clientes',
              description: 'Haz clic en el ícono para seleccionar los clientes que deseas filtrar.',
              side: 'bottom',
              align: 'start',
            },
          },
        ],
      });

      tour.drive();
      localStorage.setItem(seenKey, 'true');
    }
  }, []);

  return (
    <CompanySelect
      id="company-select-filter"
      className="h-5 text-xs w-[50px]"
      value={companySelect}
      onChange={setCompanySelect}
      placeHolder={<FilterIcon width={5} height={5} />}
    />
  );
}
