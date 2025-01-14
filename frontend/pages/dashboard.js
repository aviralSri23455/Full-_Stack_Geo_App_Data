import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('../components/MapContainer'), { ssr: false });

const Dashboard = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login'); // Redirect if not authenticated
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return null; // Prevent rendering until authentication is verified
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
           
            <div className="flex-1 h-full">
                <MapContainer />
            </div>
        </div>
    );
};

export default Dashboard;
