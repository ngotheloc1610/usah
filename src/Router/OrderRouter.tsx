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
import SummaryTrading from "../pages/Orders/SummaryTrading"
import OrderModifyCancel from "../pages/Orders/OrderModifyCancel";
import MultiTraderControl from "../pages/Orders/MultiTraderControl";
import BigOrderMonitoring from "../pages/Orders/BigOrderMonitoring";
const OrderRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/big-order-monitoring" element={<BigOrderMonitoring />} />
          <Route path="/monitoring" element={<OrderMonitoring />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/new" element={<OrderNew />} />
          <Route path="/tradeHistory" element={<OrderTradeHistory />} />
          <Route path="/summary-trading" element={<SummaryTrading />} />
          <Route path="/multi-trader-control" element={<MultiTraderControl />} />
          <Route path="/modify-cancel" element={<OrderModifyCancel />} />
        </Routes>
      </div>
    );
  }

  export default OrderRouter