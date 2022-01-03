import {
    BrowserRouter,
    Routes,
    Route
  } from "react-router-dom";
import HomePage from "../pages/HomePage";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderMonitoring from "../pages/Orders/OrderMonitoring";

const OrderRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/monitoring" element={<OrderMonitoring />} />
          <Route path="/history" element={<OrderHistory />} />
        </Routes>
      </div>
    );
  }

  export default OrderRouter