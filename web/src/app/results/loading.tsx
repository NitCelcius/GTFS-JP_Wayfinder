import { LoadingSpinner } from "../components/common/LoadingSpinner/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
}
