import { NotFoundPage } from "@healhub/ui/not-found";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Admin · Page not found"
      subtitle="The page you're looking for doesn't exist or may have been moved within the admin panel."
      homeLabel="Back to admin home"
      homeHref="/admin-dashboard"
    />
  );
}