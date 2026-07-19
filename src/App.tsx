import React, { useEffect, useState } from 'react';
import MaintenancePage from './components/MaintenancePage';
import './App.css';

// ============================================
// DB Health Check Configuration
// ============================================
const HEALTH_CHECK_URL = import.meta.env.VITE_API_HEALTH_URL || '/api/health';
const HEALTH_CHECK_TIMEOUT = 8000; // 8 seconds
const MAX_RETRIES = 2;

interface HealthStatus {
  ok: boolean;
  error?: string;
}

const checkDatabaseHealth = async (): Promise<HealthStatus> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    const response = await fetch(HEALTH_CHECK_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: `Server responded with status ${response.status} (${response.statusText})`,
      };
    }

    const data = await response.json().catch(() => null);
    if (data && typeof data === 'object' && 'status' in data && data.status !== 'ok') {
      return {
        ok: false,
        error: `API health status: ${data.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      ok: false,
      error: `Connection failed: ${message}`,
    };
  }
};

// ============================================
// Main App Component
// ============================================
const App: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const performHealthCheck = async () => {
    setIsLoading(true);
    const result = await checkDatabaseHealth();
    setDbStatus(result);
    setIsLoading(false);
  };

  useEffect(() => {
    performHealthCheck();
  }, [retryCount]);

  // Optional: Show a minimal loader while checking
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffde00',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: '1.25rem',
          color: '#0a0a0a',
        }}
      >
        <div
          style={{
            border: '4px solid #0a0a0a',
            padding: '24px 40px',
            backgroundColor: '#ffffff',
            boxShadow: '8px 8px 0px 0px #0a0a0a',
          }}
        >
          CHECKING SYSTEM STATUS...
        </div>
      </div>
    );
  }

  // If DB check fails, render the custom maintenance page
  if (dbStatus && !dbStatus.ok) {
    return (
      <MaintenancePage
        onRetry={() => setRetryCount((prev) => prev + 1)}
        errorDetails={dbStatus.error}
      />
    );
  }

  // ============================================
  // YOUR EXISTING APP CONTENT GOES BELOW
  // ============================================
  return (
    <div className="App">
      {/* Replace this with your actual app routes/components */}
      <h1>CampusConnect</h1>
      <p>All systems operational.</p>
    </div>
  );
};

export default App;
