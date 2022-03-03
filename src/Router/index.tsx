import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import OrderRouter from "./OrderRouter";
import News from "../pages/News"
import Report from "../pages/Report";
import SettingScreen from "../pages/Setting/Index";
import OrderBookCommon from "../pages/Orders/OrderBookCommon";
import MultipleOrders from "../pages/Orders/MultipleOrders";
import MultiTraderControl from "../pages/Orders/MultiTraderControl";
import Login from "../pages/Authentication/Login";

const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders/*" element={<OrderRouter />} />
        <Route path="/news" element={<News />} />
        <Route path="/setting" element={<SettingScreen />} />
        <Route path="/report" element={<Report />} />
        <Route path="/order-book" element={<OrderBookCommon />} />
        <Route path="/order/multi-orders" element={<MultipleOrders />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom