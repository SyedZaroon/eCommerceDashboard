import { AppSidebar } from "@/components/app-sidebar";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@base-ui/react";
import { Outlet } from "react-router-dom";
import { Field } from "./field";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 py-4 w-full bg-sidebar">
            <Field className="justify-center" orientation="horizontal">
              <Input className="bg-white text-black placeholder:text-gray-500 p-2 rounded-xl w-full" type="search" placeholder="Search..." />
            </Field>
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
