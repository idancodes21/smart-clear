"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileCheck2,
  Settings,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/admin/dashboard/students",
    icon: Users,
  },
  {
    label: "Clearance Reviews",
    href: "/admin/dashboard/reviews",
    icon: ClipboardCheck,
  },
  {
    label: "Certificates",
    href: "/admin/dashboard/certificates",
    icon: FileCheck2,
  },
  {
    label: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-white transition-all duration-300",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      {/* Brand */}
      <div className="flex h-20 items-center justify-between border-b px-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-700 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>

          {!collapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-bold text-gray-900">
                SmartClear
              </h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {!collapsed && (
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>
        )}

        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "bg-green-50 text-green-800"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-gray-50 p-3",
            collapsed && "justify-center",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
            A
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                Administrator
              </p>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}