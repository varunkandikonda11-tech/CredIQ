import { Route, Routes } from "react-router-dom";
import { RequireLender } from "@/components/layout/RequireLender";
import BorrowerPage from "@/pages/BorrowerPage";
import LandingPage from "@/pages/LandingPage";
import LenderPage from "@/pages/LenderPage";
import LoginPage from "@/pages/LoginPage";
import PricingPage from "@/pages/PricingPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/borrower" element={<BorrowerPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/lender"
        element={
          <RequireLender>
            <LenderPage />
          </RequireLender>
        }
      />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  );
}
