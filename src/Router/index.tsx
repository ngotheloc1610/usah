import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import OrdersPage from "../pages/OrdersPage";

const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<HomePage/>} />
       <Route path="/orders" element={<OrdersPage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom