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
import OrderModifyCancel from "../pages/Orders/OrderModifyCancel";
import MultiTraderControl from "../pages/Orders/MultiTraderControl";
const OrderRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/monitoring" element={<OrderMonitoring />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/new" element={<OrderNew />} />
          <Route path="/tradeHistory" element={<OrderTradeHistory />} />
          <Route path="/portfolio" element={<OrderPortfolio />} />
        <Route path="/multi-trader-control" element={<MultiTraderControl />} />
          <Route path="/modify-cancel" element={<OrderModifyCancel />} />
        </Routes>
      </div>
    );
  }

  export default OrderRouter