import { createBrowserRouter, Navigate } from "react-router-dom";
import { RootLayout } from "@/shared/components/RootLayout";
import { BookingDashboard } from "@/features/booking/components/BookingDashboard";
import { ReservationsDashboard } from "@/features/reservations/components/ReservationsDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="/patient" replace />,
      },
      {
        path: "patient",
        element: <BookingDashboard />,
      },
      {
        path: "provider/:providerId",
        element: <ReservationsDashboard />,
      },
    ],
  },
]);
