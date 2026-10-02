import { Suspense } from 'react';
import CompanyDetailsView from '@/components/CompanyDetailsView';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const staticIds = Array.from({ length: 150 }, (_, i) => ({ id: String(i + 1) }));
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajraxsentinel-backend.onrender.com';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_URL}/api/companies/?active_only=true`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timer);
    if (res && res.ok) {
      const companies = await res.json();
      if (Array.isArray(companies)) {
        const apiIds = companies.map((c: any) => ({ id: String(c.id) }));
        const combined = [...staticIds];
        for (const item of apiIds) {
          if (!combined.some(c => c.id === item.id)) {
            combined.push(item);
          }
        }
        return combined;
      }
    }
  } catch {
    // fallback to static IDs
  }
  return staticIds;
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const numericId = resolvedParams?.id && !isNaN(parseInt(resolvedParams.id)) ? parseInt(resolvedParams.id) : undefined;
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-command-950 items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <CompanyDetailsView companyId={numericId} />
    </Suspense>
  );
}
