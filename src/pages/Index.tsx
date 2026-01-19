import { Navigate } from 'react-router-dom';

// Redirect to dashboard - in production, check auth status
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
