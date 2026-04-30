"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  allowedRole: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // useEffect(() => {
  //   setIsMounted(true);
  //   if (typeof window !== "undefined") {
  //     const r = localStorage.getItem("role");
  //     setRole(r);
  //     if (r !== allowedRole) {
  //       router.replace("/403");
  //     }
  //   }
  // }, [allowedRole, router]);

  // if (!isMounted) return null;
  // if (role !== allowedRole) return null;
  return <>{children}</>;
}
