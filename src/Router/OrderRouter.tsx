import {
    BrowserRouter,
    Routes,
    Route
  } from "react-router-dom";
import HomePage from "../pages/HomePage";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderMonitoring from "../pages/Orders/OrderMonitoring";
import OrderNew from "../pages/Orders/OrderNew";
import OrderTradeHistory from "../pages/Orders/OrderTradeHistory"
import OrderPortfolio from "../pages/Orders/OrderPortfolio"
const OrderRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/monitoring" element={<OrderMonitoring />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/new" element={<OrderNew />} />
          <Route path="/tradeHistory" element={<OrderTradeHistory />} />
          <Route path="/porfolio" element={<OrderPortfolio />} />
        </Routes>
      </div>
    );
  }

  export default OrderRouter