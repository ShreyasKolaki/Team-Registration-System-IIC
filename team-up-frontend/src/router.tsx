import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-sm mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-primary text-white rounded">
        Try again
      </button>
    </div>
  );
}

// ✅ KEEP THIS FUNCTION (VERY IMPORTANT)
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
