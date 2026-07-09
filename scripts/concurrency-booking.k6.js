import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Base configuration via environment variables or defaults
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PROVIDER_ID = __ENV.PROVIDER_ID || 'f12b94ba-3193-45f1-94a2-5e84f7b96ad7';
const PATIENT_EMAIL_PREFIX = __ENV.PATIENT_EMAIL_PREFIX || 'concurrency-demo';
const VUS = Number(__ENV.VUS || 20);

// Custom metrics for the final report
const created = new Counter('booking_created');
const conflicted = new Counter('booking_conflicted');

// Helper function to calculate a valid 30-minute block in the future
function nextHalfHourUtc() {
  const date = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in the future to avoid clashes with the past
  date.setUTCMinutes(date.getUTCMinutes() < 30 ? 30 : 0, 0, 0);
  return date;
}

const start = nextHalfHourUtc();
const end = new Date(start.getTime() + 30 * 60 * 1000); // Exact duration of 30 minutes

export const options = {
  scenarios: {
    concurrent_bookings: {
      executor: 'shared-iterations',
      vus: VUS,
      iterations: VUS, // Each virtual user runs exactly 1 iteration in parallel
      maxDuration: '1m',
    },
  },
  thresholds: {
    // Relax the strict HTTP failure threshold because 409 responses are expected intentionally
    http_req_failed: ['rate<=1'],
  },
};

export default function () {
  // Generate a dynamic payload for each VU (Virtual User)
  const payload = JSON.stringify({
    providerId: PROVIDER_ID,
    patientEmail: `${PATIENT_EMAIL_PREFIX}+${__VU}@example.com`,
    startTime: start.toISOString(),
    endTime: end.toISOString(), // Explicitly send the appointment end time required by the DTO
  });

  const response = http.post(`${BASE_URL}/reservations`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Classify metrics according to the controller behavior
  if (response.status === 201) {
    created.add(1);
  } else if (response.status === 409) {
    conflicted.add(1);
  }

  // Sanity check: every request should either succeed or return a controlled conflict
  check(response, {
    'status is 201 or 409': (res) => res.status === 201 || res.status === 409,
  });

  sleep(0.1);
}

// Generate a custom, clean console output when the test finishes
export function handleSummary(data) {
  const createdCount = data.metrics.booking_created?.values?.count ?? 0;
  const conflictedCount = data.metrics.booking_conflicted?.values?.count ?? 0;

  return {
    stdout: `\n========================================================\n   CONCURRENCY TEST SUMMARY\n========================================================\n\n  🚀 Total Concurrent Requests (VUs): ${VUS}\n  ✅ 201 Created (Success):           ${createdCount}\n  ❌ 409 Conflict (Blocked):          ${conflictedCount}\n\n🤖 EXPECTED OUTCOME:\n  - Exactly 1 request returns 201 Created\n  - The remaining ${VUS - 1} requests return 409 Conflict\n========================================================\n`,
  };
}
