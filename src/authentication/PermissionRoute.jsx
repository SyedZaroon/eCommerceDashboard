
import { Navigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";

import { useAuth } from "@/context/AuthContext";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermission } from "./hasPermission";

export default function PermissionRoute({
  resource,
  action,
  children,
}) {
  const { user, loading } = useAuth();

  // Wait until authentication check completes
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking permissions...
        </p>
      </div>
    );
  }

  // Redirect unauthenticated or inactive users
  if (!user || user.status !== "Active") {
    return <Navigate to="/login" replace />;
  }

  // Check the required permission
  if (!hasPermission(user, resource, action)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <ShieldAlert className="size-7 text-destructive" />
            </div>

            <CardTitle className="text-2xl">
              Access Denied
            </CardTitle>

            <CardDescription>
              You do not have permission to access this page.
              Please contact your administrator if you think
              this is a mistake.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Required permission:{" "}
              <span className="font-medium text-foreground">
                {resource} / {action}
              </span>
            </p>
          </CardContent>

          <CardFooter className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 size-4" />
              Go Back
            </Button>

            <Button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render the page only when permission is granted
  return children;
}
