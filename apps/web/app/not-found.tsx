import { NotFoundPage } from "@healhub/ui/not-found";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Page not found"
      subtitle="The page you're looking for doesn't exist or may have been moved. Let's get you back to browsing doctors and hospitals."
      homeLabel="Back to Healhub"
      homeHref="/"
    />
  );
}