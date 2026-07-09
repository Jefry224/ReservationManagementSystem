import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Calendar, Clock } from "lucide-react";

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

interface AvailabilityCalendarProps {
  selectedProvider: Provider | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  slots: AvailabilitySlot[];
  isLoading: boolean;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export function AvailabilityCalendar({
  selectedProvider,
  selectedDate,
  onSelectDate,
  slots,
  isLoading,
  onSelectSlot,
}: AvailabilityCalendarProps) {
  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Availability Calendar</span>
          </CardTitle>
          <CardDescription>Choose a day and time slot</CardDescription>
        </div>

        {selectedProvider && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="border border-input rounded-md px-3 py-1.5 text-sm bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {!selectedProvider ? (
          <div className="text-sm text-muted-foreground p-16 border border-dashed rounded-md text-center flex flex-col items-center justify-center gap-2">
            <Clock className="h-8 w-8 text-muted-foreground/60 mb-1" />
            <p className="font-medium">No clinician selected</p>
            <p className="text-xs max-w-xs">Select a provider from the left sidebar to load their availability slots.</p>
          </div>
        ) : isLoading ? (
          <div className="text-sm text-muted-foreground p-16 text-center">Loading availability slots...</div>
        ) : slots.length === 0 ? (
          <div className="text-sm text-muted-foreground p-16 border border-dashed rounded-md text-center">
            No availability slots generated for this day.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Available slots for {selectedProvider.name}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                All slots are 30 minutes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-3 rounded-lg border text-center text-sm transition-all font-medium flex flex-col items-center justify-center gap-1 ${
                    slot.available
                      ? "border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground cursor-pointer"
                      : "border-border bg-muted/40 text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span className="text-sm">{formatSlotTime(slot.startTime)}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {slot.available ? "Free" : "Booked"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
