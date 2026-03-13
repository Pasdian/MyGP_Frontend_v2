import React from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import CompanySelect from '../selects/CompanySelect';

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
      className="h-5 text-xs"
      value={companySelect}
      onChange={setCompanySelect}
      placeHolder="Filtrar"
    />
  );
}
