import Settings from '@/components/Generation/Dashboard/Settings'
import ProtectedRoute from '@/components/PrivateRoute'

export default function App(){
    return (
        <ProtectedRoute>
            <Settings />
        </ProtectedRoute>
    )
}