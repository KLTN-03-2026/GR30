"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReportDetail } from "@/components/features/reports/ReportDetail";
import { ReportForm } from "@/components/features/reports/ReportForm";
const MOCK_REPORTS: any[] = [];
import { Button } from "@/components/ui/button";
import { Report } from "@/types/report";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const isEditingParam = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingParam);
  const [report, setReport] = useState<Report | null>(null);

  const id = params.id as string;

  useEffect(() => {
    // In a real app, this would be an API fetch
    const found = MOCK_REPORTS.find((r) => r.id === id);
    if (found) {
      setReport(found);
    }
  }, [id]);

  useEffect(() => {
    setIsEditing(isEditingParam);
  }, [isEditingParam]);

  const handleEditToggle = () => {
    if (isEditing) {
      router.push(`/owner/reports/${id}`);
    } else {
      router.push(`/owner/reports/${id}?edit=true`);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="-ml-4">
              <Link href="/owner/reports">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang Báo cáo
              </Link>
            </Button>
            
            {!isEditing && report && (
              <Button onClick={handleEditToggle}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa Báo cáo
              </Button>
            )}
          </div>

          {!report ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Đang tải chi tiết báo cáo...</p>
            </div>
          ) : isEditing ? (
            <ReportForm 
              report={report} 
              onCancel={() => router.push(`/owner/reports/${id}`)} 
            />
          ) : (
            <ReportDetail report={report} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
