import MapControlsScene from "@/components/common/MapControlsScene";

/**
 * Layout chung cho phần xác thực (Auth)
 * Bao gồm background map 3D và phần nội dung con
 * Map 3D được hiển thị nền và giữ nguyên trạng thái giữa các route con
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* 3D Map Background - Persisted across routes */}
      <div className="absolute inset-0 w-full h-full z-0">
        <MapControlsScene />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}
