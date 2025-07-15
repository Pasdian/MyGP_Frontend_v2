export default function DEA() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full">
      <div className="grid grid-rows-3 gap-2 w-full h-full">
        <div className="bg-yellow-400 max-h-[400px] overflow-y-auto">
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
          <p>Cuenta de Gastos</p>
        </div>
        <div className="bg-yellow-500 max-h-[400px] overflow-y-auto">Expediente Aduanal</div>
        <div className="bg-yellow-600 max-h-[400px] overflow-y-auto">Comprobantes Fiscales</div>
      </div>
      <div className="grid grid-rows-3 gap-2 w-full h-full">
        <div className="bg-blue-400 max-h-[400px] overflow-y-auto">Coves</div>
        <div className="bg-blue-500 max-h-[400px] overflow-y-auto">EDocs</div>
        <div className="bg-blue-600 max-h-[400px] overflow-y-auto">Expediente Digital</div>
      </div>
      <div className="bg-green-400 sm:col-span-2 w-full h-full">Visor de Archivos</div>
    </div>
  );
}
