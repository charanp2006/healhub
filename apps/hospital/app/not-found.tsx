import { NotFoundPage } from "@healhub/ui/not-found";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Clinic · Page not found"
      subtitle="The page you're looking for doesn't exist or may have been moved within the clinic portal."
      homeLabel="Back to clinic home"
      homeHref="/hospital-dashboard"
    />
  );
}