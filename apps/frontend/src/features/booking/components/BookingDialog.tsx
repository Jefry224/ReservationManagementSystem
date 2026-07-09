import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AlertCircle } from "lucide-react";

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

interface BookingDialogProps {
  activeSlot: AvailabilitySlot | null;
  selectedProvider: Provider | null;
  onClose: () => void;
  isPending: boolean;
  onSubmitBooking: (email: string) => void;
  bookingError: string | null;
}

export function BookingDialog({
  activeSlot,
  selectedProvider,
  onClose,
  isPending,
  onSubmitBooking,
  bookingError,
}: BookingDialogProps) {
  const [patientEmail, setPatientEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  if (!activeSlot || !selectedProvider) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!patientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    onSubmitBooking(patientEmail);
  };

  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Review booking details and enter your email address to confirm.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {/* Appointment details */}
          <div className="rounded-lg bg-muted/50 p-4 border border-border flex flex-col gap-2.5 text-sm text-foreground">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium">Clinician:</span>
              <span className="font-semibold text-foreground">{selectedProvider.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground font-medium">Date:</span>
              <span className="font-semibold text-foreground">
                {new Date(activeSlot.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground font-medium">Time:</span>
              <span className="font-semibold text-foreground">
                {formatSlotTime(activeSlot.startTime)} - {formatSlotTime(activeSlot.endTime)} (30 mins)
              </span>
            </div>
          </div>

          {/* Patient email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="patient-email" className="text-xs font-semibold text-foreground">
              Patient Email Address
            </label>
            <Input
              id="patient-email"
              type="email"
              placeholder="name@example.com"
              value={patientEmail}
              onChange={(e) => {
                setPatientEmail(e.target.value);
                setEmailError("");
              }}
              required
              className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {emailError && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Booking request error */}
          {bookingError && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{bookingError}</span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Confirming..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
