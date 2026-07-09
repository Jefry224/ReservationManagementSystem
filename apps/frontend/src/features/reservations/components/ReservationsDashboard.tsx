import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { API_ROUTES } from "@/shared/lib/api";
import { AppointmentsTable } from "./AppointmentsTable";

interface Provider {
  id: string;
  name: string;
  email: string;
}

interface Reservation {
  id: string;
  patientEmail: string;
  startTime: string;
  endTime: string;
}

export function ReservationsDashboard() {
  const { providerId } = useParams<{ providerId: string }>();

  // 1. Load the current provider details
  const { data: provider, isLoading: loadingProvider } = useQuery<Provider>({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.PROVIDER(providerId!));
      if (!res.ok) throw new Error("Provider not found");
      return res.json();
    },
    enabled: !!providerId,
  });

  // 2. Load upcoming reservations for this provider
  const { data: reservations = [], isLoading: loadingReservations } = useQuery<Reservation[]>({
    queryKey: ["reservations", providerId],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.PROVIDER_RESERVATIONS(providerId!));
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return res.json();
    },
    enabled: !!providerId,
  });

  // 3. Load all providers so the interviewer can switch views quickly during live coding
  const { data: allProviders = [] } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.PROVIDERS);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return res.json();
    },
  });

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col gap-6">
        
        {/* Top navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/patient">
            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Patient Booking</span>
            </Button>
          </Link>

          {/* Provider selector for live demo and interviewer testing */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Switch Portal:</span>
            <select
              value={providerId || ""}
              onChange={(e) => window.location.href = `/provider/${e.target.value}`}
              className="border border-input rounded-md px-3 py-1.5 text-xs bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              {allProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Portal header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Provider Dashboard
          </h1>
          <p className="text-muted-foreground">
            {loadingProvider ? (
              <span>Loading provider info...</span>
            ) : provider ? (
              <span>
                Viewing upcoming schedule for <span className="font-semibold text-primary">{provider.name}</span> ({provider.email})
              </span>
            ) : (
              <span>Viewing reservations for Provider ID: {providerId}</span>
            )}
          </p>
        </div>

        {/* Reservations list */}
        <AppointmentsTable
          reservations={reservations}
          isLoading={loadingReservations}
        />
      </div>
    </div>
  );
}
