
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const PlaceholderPage = ({ title, description, icon }: PlaceholderPageProps) => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-gray-500">{description}</p>
      </div>
      
      <Card className="flex h-64 w-full items-center justify-center bg-slate-50">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 rounded-full bg-auction-purple/10 p-3 text-auction-purple">
            {icon}
          </div>
          <CardTitle className="mb-2">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            This page is a placeholder for the {title.toLowerCase()} functionality.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
