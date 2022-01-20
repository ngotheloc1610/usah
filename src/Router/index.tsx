import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import OrderRouter from "./OrderRouter";
import News from "../pages/News"
import Report from "../pages/Report";
import CustomerInfo from "../pages/CustomerInfo/Index";
import OrderBookCommon from "../pages/Orders/OrderBookCommon";

const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dashboard />} />
        <Route path="/orders/*" element={<OrderRouter />} />
        <Route path="/news" element={<News />} />
        <Route path="/customerInfo" element={<CustomerInfo />} />
        <Route path="/report" element={<Report />} />
        <Route path="/order-book" element={<OrderBookCommon />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom