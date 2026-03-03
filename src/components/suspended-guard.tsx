"use client";

import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";

type Props = { suspended: boolean };

export function SuspendedGuard({ suspended }: Props) {
  const pathname = usePathname();
  if (suspended && pathname !== "/suspended") {
    redirect("/suspended");
  }
  return null;
}
