import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Calendar, Clock, Mail, CalendarDays } from "lucide-react";

interface Reservation {
  id: string;
  patientEmail: string;
  startTime: string;
  endTime: string;
}

interface AppointmentsTableProps {
  reservations: Reservation[];
  isLoading: boolean;
}

export function AppointmentsTable({ reservations, isLoading }: AppointmentsTableProps) {
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>Upcoming Appointments</span>
        </CardTitle>
        <CardDescription>A real-time list of your next scheduled patients</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground p-12 text-center">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="text-sm text-muted-foreground p-16 border border-dashed rounded-md text-center flex flex-col items-center justify-center gap-2">
            <Calendar className="h-8 w-8 text-muted-foreground/60 mb-1" />
            <p className="font-medium">No upcoming appointments</p>
            <p className="text-xs max-w-xs">
              When patients reserve a slot from the portal, they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Patient Email</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => {
                  const startFormat = formatDateTime(res.startTime);
                  const endFormat = formatDateTime(res.endTime);
                  
                  return (
                    <tr key={res.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{res.patientEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-foreground">{startFormat.date}</td>
                      <td className="py-3.5 px-4 text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{startFormat.time} - {endFormat.time}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
