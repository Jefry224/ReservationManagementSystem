import { Link, useLocation } from "react-router-dom";
import { CalendarRange, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@/shared/lib/api";

interface Provider {
  id: string;
  name: string;
  email: string;
}

export function Header() {
  const location = useLocation();

  // Fetch providers so the portal link can target the first real provider dynamically
  const { data: providers = [] } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.PROVIDERS);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return res.json();
    },
  });

  const firstProviderId = providers[0]?.id;
  const providerPortalLink = firstProviderId ? `/provider/${firstProviderId}` : "#";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/patient" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <CalendarRange className="h-6 w-6" />
          <span>ThriveBook</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/patient"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/patient" ? "text-foreground font-semibold" : "text-muted-foreground"
            )}
          >
            Patient Booking
          </Link>
          <Link
            to={providerPortalLink}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              location.pathname.startsWith("/provider") ? "text-foreground font-semibold" : "text-muted-foreground",
              !firstProviderId && "pointer-events-none opacity-50 cursor-not-allowed"
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Provider Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
