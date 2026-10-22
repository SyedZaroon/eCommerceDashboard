import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";


const UserForm = ({ formData, onInputChange, onSubmit, loading }) => {
  return (
    <>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New User</h1>
            <p className="text-sm text-muted-foreground">
              Create a new user profile and assign permissions.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>
                Enter personal information and credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Usman Ali"
                  required
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="usman@example.com"
                  required
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="********"
                  required
                  name="password"
                  value={formData.password}
                  onChange={onInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Role</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="Customer"
                  name="role"
                  value={formData.role}
                  onChange={onInputChange}
                >
                  <option value="Customer">Customer</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Link to="/dashboard/users">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Save User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default UserForm;
