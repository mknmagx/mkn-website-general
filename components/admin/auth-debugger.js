/**
 * Auth Debug Component
 * 401 hatalarını debug etmek için kullanılır
 */
"use client";

import { useState } from "react";
import { useAdminAuth } from "../../hooks/use-admin-auth";
import { authenticatedFetch } from "../../lib/api/auth-fetch";

export default function AuthDebugger() {
  const [debugResult, setDebugResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAdminAuth();

  const testAuth = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      console.log("🔍 Starting auth debug test...");
      const response = await authenticatedFetch("/api/admin/debug/auth");
      const data = await response.json();

      setDebugResult({
        success: true,
        data,
        status: response.status,
      });
    } catch (error) {
      console.error("Debug test failed:", error);
      setDebugResult({
        success: false,
        error: error.message,
        status: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testShopifyAPI = async () => {
    setLoading(true);
    setDebugResult(null);

    try {
      const response = await authenticatedFetch(
        "/api/admin/integrations/shopify"
      );
      const data = await response.json();

      setDebugResult({
        success: true,
        data,
        status: response.status,
        endpoint: "/api/admin/integrations/shopify",
      });
    } catch (error) {
      setDebugResult({
        success: false,
        error: error.message,
        status: "Error",
        endpoint: "/api/admin/integrations/shopify",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Auth Debug Panel</h1>

      {/* User Info */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Current User Info</h2>
        {user ? (
          <div className="space-y-1 text-sm">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Role:</strong> {user.userRole}
            </div>
            <div>
              <strong>Is Admin:</strong> {user.isAdmin ? "✅ Yes" : "❌ No"}
            </div>
            <div>
              <strong>Permissions:</strong>{" "}
              {user.permissions
                ? JSON.stringify(user.permissions, null, 2)
                : "Loading..."}
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Not authenticated</div>
        )}
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={testAuth}
          disabled={loading || !user}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Auth Endpoint"}
        </button>

        <button
          onClick={testShopifyAPI}
          disabled={loading || !user}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Shopify API"}
        </button>
      </div>

      {/* Results */}
      {debugResult && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-2">Test Results</h2>
          <div
            className={`p-4 rounded ${
              debugResult.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="mb-2">
              <strong>Status:</strong>
              <span
                className={
                  debugResult.success
                    ? "text-green-600 ml-2"
                    : "text-red-600 ml-2"
                }
              >
                {debugResult.status}
              </span>
            </div>

            {debugResult.endpoint && (
              <div className="mb-2">
                <strong>Endpoint:</strong>{" "}
                <code className="ml-2">{debugResult.endpoint}</code>
              </div>
            )}

            <div>
              <strong>Response:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(
                  debugResult.success
                    ? debugResult.data
                    : { error: debugResult.error },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Console Log Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Debug Info</h3>
        <p className="text-yellow-700 text-sm mt-1">
          Detaylı debug logları için browser console'u (F12) kontrol edin. Auth
          ve API çağrıları hakkında ayrıntılı bilgiler orada görüntülenecektir.
        </p>
      </div>
    </div>
  );
}
