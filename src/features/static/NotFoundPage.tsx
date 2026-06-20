import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow text-muted-foreground">404</p>
        <h1 className="display-2 mt-3 text-foreground">This page is quiet.</h1>
        <p className="mt-3 text-muted-foreground">
          The page you were looking for isn&apos;t here. Let&apos;s get you back to somewhere
          softer.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Return home
        </Link>
      </div>
    </div>
  );
}
