import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import OrderRouter from "./OrderRouter";
import Report from "../pages/Report";


const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dashboard />} />
        <Route path="/orders/*" element={<OrderRouter />} />
        <Route path="/report/*" element={<Report />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom