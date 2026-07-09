import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { User } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  email: string;
}

interface ProviderListProps {
  providers: Provider[];
  selectedProviderId: string | undefined;
  onSelectProvider: (provider: Provider) => void;
  isLoading: boolean;
}

export function ProviderList({
  providers,
  selectedProviderId,
  onSelectProvider,
  isLoading,
}: ProviderListProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <span>Providers</span>
        </CardTitle>
        <CardDescription>Select a clinician to see their hours</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col gap-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground p-4 text-center">Loading providers...</div>
        ) : providers.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
            No providers found in DB.
          </div>
        ) : (
          providers.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProvider(p)}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all cursor-pointer flex flex-col gap-1 ${
                selectedProviderId === p.id
                  ? "border-primary bg-primary/5 text-primary-foreground font-medium"
                  : "border-border hover:bg-accent/40 text-foreground"
              }`}
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="text-xs text-muted-foreground">{p.email}</span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
