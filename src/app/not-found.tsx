import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import Logo from "../components/logo";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="text-4xl font-medium tracking-tight">Page Not Found</h1>
        <p className="text-base">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
