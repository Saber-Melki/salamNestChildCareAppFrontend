import React from "react";
import {
  isRouteErrorResponse,
  useRouteError,
  Link,
  useLocation,
} from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();
  const location = useLocation();

  let title = "Unexpected Application Error";
  let message = "Something went wrong.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = `${error.status} ${error.statusText}`;
    message =
      (error.data && (error.data.message || String(error.data))) ||
      "The page could not be loaded.";
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="text-xs text-gray-400 mb-6">
          <div>Path: <code>{location.pathname}</code></div>
          <div>Status: <code>{status}</code></div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
          >
            Go Home
          </Link>
          <button
            onClick={() => (window.location.href = window.location.href)}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Retry
          </button>
        </div>

        <details className="mt-4 text-xs text-gray-500 whitespace-pre-wrap">
          <summary className="cursor-pointer">Details</summary>
          <pre className="mt-2 overflow-auto">
            {typeof error === "object" ? JSON.stringify(error, null, 2) : String(error)}
          </pre>
        </details>
      </div>
    </div>
  );
}
