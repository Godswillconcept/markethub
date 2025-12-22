
import { Outlet } from 'react-router-dom';
import { QueryLoadingWrapper } from '@/ui/Loading';
import VendorDashBoardHeader from './VendorDashBoardHeader.jsx';

export default function VendorDashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <QueryLoadingWrapper loadingMessage="Loading dashboard...">
                <VendorDashBoardHeader />
                <main className="py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </QueryLoadingWrapper>
        </div>
    );
}