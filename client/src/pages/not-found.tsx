import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-full w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-404-title">
              404 Page Not Found
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-404-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6">
            <Button asChild data-testid="button-back-home">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
