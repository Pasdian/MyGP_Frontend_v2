import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import DeliveriesUpsertPhaseButton from '@/components/buttons/upsertPhase/DeliveriesUpsertPhaseButton';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { deliveriesColumns } from '@/lib/columns/deliveriesColumns';
import { ExceptionCodeCombo } from '@/components/comboboxes/ExceptionCodeCombo';
import AuthProvider from '@/components/AuthProvider/AuthProvider';

function DeliveriesUpsertBtnWrapper() {
  const data = [
    {
      REFERENCIA: 'PAE251806',
      EE__GE: '977183',
      GUIA_HOUSE: 'EDC1315924',
      ENTREGA_TRANSPORTE_138: '2025-07-07 14:01:00.0000 ', // Monday
      CE_138: '',
      ENTREGA_CDP_140: '2025-07-03 13:02:00.0000 ',
      CE_140: '',
    },
    {
      REFERENCIA: 'PAE251807',
      EE__GE: '976573, 976575',
      GUIA_HOUSE: 'EDC1313986',
      ENTREGA_TRANSPORTE_138: '2025-06-20 14:01:00.0000 ',
      CE_138: '',
      ENTREGA_CDP_140: '2025-07-04 13:29:00.0000 ',
      CE_140: '',
    },
  ];
  const table = useReactTable({
    data: data ? data : [],
    columns: deliveriesColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Filtering
    getPaginationRowModel: getPaginationRowModel(), // Pagination
  });
  return <DeliveriesUpsertPhaseButton row={table.getRow('0')} />;
}

describe('Deliveries', () => {
  it('upserts a phase with the same date without exception code', async () => {
    render(
      <AuthProvider>
        <DeliveriesUpsertBtnWrapper />
        <Toaster />
      </AuthProvider>
    );

    const firstModifyButton = screen.getAllByRole('button', { name: /modificar/i })[0];
    await userEvent.click(firstModifyButton);

    const cdpInput = screen.getByLabelText(/fecha de entrega a cdp/i);
    await userEvent.clear(cdpInput);
    await userEvent.type(cdpInput, '2025-07-07'); // Monday
    expect(cdpInput).toHaveValue('2025-07-07'); // Monday

    const timeInput = screen.getByLabelText(/hora/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '07:00');
    expect(timeInput).toHaveValue('07:00');

    const saveChanges = screen.getByRole('button', { name: /guardar cambios/i });
    await userEvent.click(saveChanges);
    const toast = await screen.findByText(/datos modificados correctamente/i);
    expect(toast).toBeInTheDocument();
  });

  it('upserts a phase with 1 day ahead without exception code', async () => {
    render(
      <AuthProvider>
        <DeliveriesUpsertBtnWrapper />
        <Toaster />
      </AuthProvider>
    );

    const firstModifyButton = screen.getAllByRole('button', { name: /modificar/i })[0];
    await userEvent.click(firstModifyButton);

    const cdpInput = screen.getByLabelText(/fecha de entrega a cdp/i);
    await userEvent.clear(cdpInput);
    await userEvent.type(cdpInput, '2025-07-08'); // Tuesday
    expect(cdpInput).toHaveValue('2025-07-08'); // Tuesday

    const timeInput = screen.getByLabelText(/hora/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '07:00');
    expect(timeInput).toHaveValue('07:00');

    const saveChanges = screen.getByRole('button', { name: /guardar cambios/i });
    await userEvent.click(saveChanges);
    const toast = await screen.findByText(/datos modificados correctamente/i);
    expect(toast).toBeInTheDocument();
  });

  it('fails to upsert a phase with 2 days ahead without exception code', async () => {
    render(
      <AuthProvider>
        <DeliveriesUpsertBtnWrapper />
        <Toaster />
      </AuthProvider>
    );

    const firstModifyButton = screen.getAllByRole('button', { name: /modificar/i })[0];
    await userEvent.click(firstModifyButton);

    const cdpInput = screen.getByLabelText(/fecha de entrega a cdp/i);
    await userEvent.clear(cdpInput);
    await userEvent.type(cdpInput, '2025-07-09'); // Tuesday
    expect(cdpInput).toHaveValue('2025-07-09'); // Tuesday

    const timeInput = screen.getByLabelText(/hora/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '07:00');
    expect(timeInput).toHaveValue('07:00');

    const saveChanges = screen.getByRole('button', { name: /guardar cambios/i });
    await userEvent.click(saveChanges);
    const errorMessage = await screen.findByText(/coloca un código de excepción/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('upserts a phase with 2 days ahead with exception code', async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    render(
      <AuthProvider>
        <DeliveriesUpsertBtnWrapper />
        <ExceptionCodeCombo onSelect={() => {}} currentValue="" />
        <Toaster />
      </AuthProvider>
    );

    const firstModifyButton = screen.getAllByRole('button', { name: /modificar/i })[0];
    await userEvent.click(firstModifyButton);

    const cdpInput = screen.getByLabelText(/fecha de entrega a cdp/i);
    await userEvent.clear(cdpInput);
    await userEvent.type(cdpInput, '2025-07-09'); // Wednesday
    expect(cdpInput).toHaveValue('2025-07-09'); // Wednesday

    const timeInput = screen.getByLabelText(/hora/i);
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, '07:00');
    expect(timeInput).toHaveValue('07:00');

    const exceptionCodeBtn = screen.getByRole('button', { name: /código de excepción/i });
    await userEvent.click(exceptionCodeBtn);

    expect(await screen.findByText(/causa global/i)).toBeInTheDocument();

    const demorasEnProcesoAduanero = await screen.findByText(/demoras en proceso aduanero/i);
    await userEvent.hover(demorasEnProcesoAduanero);

    await waitFor(async () => {
      expect(await screen.findByText(/aa01/i)).toBeVisible();
    });

    await userEvent.click(await screen.findByText(/aa01/i));
    expect(screen.getByRole('button', { name: /AA01/i })).toBeInTheDocument();

    const saveChanges = screen.getByRole('button', { name: /guardar cambios/i });
    await userEvent.click(saveChanges);
    const toast = await screen.findByText(/datos modificados correctamente/i);
    expect(toast).toBeInTheDocument();
  });
});
