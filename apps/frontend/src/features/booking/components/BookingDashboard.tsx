import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { API_ROUTES } from "@/shared/lib/api";
import { ProviderList } from "./ProviderList";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { BookingDialog } from "./BookingDialog";

interface Provider {
  id: string;
  name: string;
  email: string;
}

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export function BookingDashboard() {
  const queryClient = useQueryClient();

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 10);
  });

  const [activeSlot, setActiveSlot] = useState<AvailabilitySlot | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ email: string; time: string; provider: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // 1. Load providers
  const { data: providers = [], isLoading: loadingProviders } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch(API_ROUTES.PROVIDERS);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return res.json();
    },
  });

  // 2. Load availability slots
  const { data: slots = [], isLoading: loadingSlots } = useQuery<AvailabilitySlot[]>({
    queryKey: ["availability", selectedProvider?.id, selectedDate],
    queryFn: async () => {
      if (!selectedProvider) return [];
      const res = await fetch(API_ROUTES.AVAILABILITY(selectedProvider.id, selectedDate));
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
    enabled: !!selectedProvider && !!selectedDate,
  });

  // 3. Book the appointment
  const bookMutation = useMutation({
    mutationFn: async (data: {
      providerId: string;
      patientEmail: string;
      startTime: string;
      endTime: string;
    }) => {
      const res = await fetch(API_ROUTES.RESERVATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message?.[0] || "Failed to book reservation");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSuccessInfo({
        email: data.patientEmail,
        time: new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: selectedProvider?.name || "Provider",
      });
      setShowSuccessAlert(true);
      setActiveSlot(null);
      setBookingError(null);

      // Refresh available slots
      queryClient.invalidateQueries({ queryKey: ["availability", selectedProvider?.id, selectedDate] });

      setTimeout(() => setShowSuccessAlert(false), 8000);
    },
    onError: (error: Error) => {
      setBookingError(error.message);
    },
  });

  const handleConfirmBooking = (email: string) => {
    if (!selectedProvider || !activeSlot) return;
    bookMutation.mutate({
      providerId: selectedProvider.id,
      patientEmail: email,
      startTime: activeSlot.startTime,
      endTime: activeSlot.endTime,
    });
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4">
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground">
            Select a telehealth provider, pick an available slot, and confirm your booking.
          </p>
        </div>

        {/* Success alert */}
        {showSuccessAlert && successInfo && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-900 shadow-sm animate-in fade-in-0 duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-800">Booking Confirmed!</h4>
              <p className="text-sm mt-1 text-emerald-700">
                Your appointment with <span className="font-semibold">{successInfo.provider}</span> at {successInfo.time} is successfully scheduled.
              </p>
              <p className="text-xs text-emerald-600/90 mt-2 font-medium">
                INFO: A confirmation email is being sent to <span className="underline">{successInfo.email}</span> (processed asynchronously in background queue).
              </p>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="text-emerald-500 hover:text-emerald-700 text-xs font-semibold cursor-pointer ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Clinician list */}
          <div className="md:col-span-1">
            <ProviderList
              providers={providers}
              selectedProviderId={selectedProvider?.id}
              onSelectProvider={(p) => {
                setSelectedProvider(p);
                setShowSuccessAlert(false);
              }}
              isLoading={loadingProviders}
            />
          </div>

          {/* Calendar and availability blocks */}
          <div className="md:col-span-2">
            <AvailabilityCalendar
              selectedProvider={selectedProvider}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              slots={slots}
              isLoading={loadingSlots}
              onSelectSlot={setActiveSlot}
            />
          </div>
        </div>

        {/* Confirmation dialog */}
        <BookingDialog
          activeSlot={activeSlot}
          selectedProvider={selectedProvider}
          onClose={() => setActiveSlot(null)}
          isPending={bookMutation.isPending}
          onSubmitBooking={handleConfirmBooking}
          bookingError={bookingError}
        />

      </div>
    </div>
  );
}
