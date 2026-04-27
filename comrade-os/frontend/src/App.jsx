import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
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
        </Router>
    );
}

export default App;