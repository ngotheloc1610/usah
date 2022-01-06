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
const OrderRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/monitoring" element={<OrderMonitoring />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/new" element={<OrderNew />} />
          <Route path="/tradeHistory" element={<OrderTradeHistory />} />

        </Routes>
      </div>
    );
  }

  export default OrderRouter