import { API_URL } from "@/api/client";

interface ApiDownBannerProps {
  className?: string;
}

export function ApiDownBanner({ className }: ApiDownBannerProps) {
  const target = API_URL ?? "the API";

  return (
    <p
      className={
        className ??
        "mb-6 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
      }
    >
      Could not reach <code>{target}</code> (<code>/health</code> failed). Borrower
      scoring still runs locally. Lender and assistant fall back to in-browser mocks
      until FastAPI is running — start it with{" "}
      <code>python scripts/run_api.py</code> in <code>backend/</code>.
    </p>
  );
}
