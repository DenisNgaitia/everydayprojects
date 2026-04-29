import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import FinancePage from './pages/FinancePage';
import SchedulePage from './pages/SchedulePage';
import DietPage from './pages/DietPage';
import StudyPage from './pages/StudyPage';
import FitnessPage from './pages/FitnessPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public route — login page (no Layout wrapper) */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected routes — wrapped in Layout */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/ai" element={<AIChat />} />
                                        <Route path="/finance" element={<FinancePage />} />
                                        <Route path="/schedule" element={<SchedulePage />} />
                                        <Route path="/diet" element={<DietPage />} />
                                        <Route path="/study" element={<StudyPage />} />
                                        <Route path="/fitness" element={<FitnessPage />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;