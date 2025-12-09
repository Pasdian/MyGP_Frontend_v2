import EmbarqueProvider from "@/app/providers/EmbarqueProvider";
import AccessGuard from "@/components/AccessGuard/AccessGuard";
import EmbarqueDataTable from "@/components/datatables/transbel/EmbarqueDataTable";

export default function DatosEmbarque() {
    return (
        <AccessGuard allowedRoles={["ADMIN", "TRANSBEL_ADMIN"]}>
            <div>
                <p className="font-semibold text-2xl">Datos de Embarque</p>
                <EmbarqueProvider>
                    <EmbarqueDataTable/>
                </EmbarqueProvider>
            </div>
        </AccessGuard>
    )
}