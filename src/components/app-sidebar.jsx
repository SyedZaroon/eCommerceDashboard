"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  BotIcon,
  ShoppingBasket,
  User,
  Package2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/authentication/hasPermission";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "eCommerce",
      logo: <GalleryVerticalEndIcon />,
    },
  ],
  navMain: [
    {
      title: "Orders",
      url: "#",
      icon: <Package2 />,
      items: [
        {
          title: "Order List",
          url: "/dashboard/orders",
          resource: "ORDERS",
          action: "READ",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      isActive: true,
      icon: <ShoppingBasket />,
      items: [
        {
          title: "Add Product",
          url: "/dashboard/addproduct",
          resource: "PRODUCTS",
          action: "CREATE",
        },
        {
          title: "Add Collection",
          url: "/dashboard/addcollection",
          resource: "COLLECTION",
          action: "CREATE",
        },
        {
          title: "Product List",
          url: "/dashboard/productlist",
          resource: "PRODUCTS",
          action: "READ",
        },
      ],
    },
    {
      title: "Users",
      url: "#",
      icon: <User />,
      items: [
        {
          title: "Add Users",
          url: "/dashboard/adduser",
          resource: "USER",
          action: "CREATE",
        },
        {
          title: "User List",
          url: "/dashboard/userlist",
          resource: "USER",
          action: "READ",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { user } = useAuth();

  const filteredNavMain = data.navMain
    .map((section) => {
      // Sections without sub-items (e.g. Orders)
      if (!section.items) {
        return section;
      }

      // Filter sub-items based on permissions
      const filteredItems = section.items.filter((item) =>
        hasPermission(user, item.resource, item.action),
      );

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => {
      // Keep direct navigation items
      if (!section.items) return true;

      // Keep sections only if they have permitted sub-items
      return section.items.length > 0;
    });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
