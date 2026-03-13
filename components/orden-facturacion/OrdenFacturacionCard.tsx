import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OrdenFacturacionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="w-full gap-2">
      <CardHeader>
        <CardTitle className="font-semibold text-slate-800 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
