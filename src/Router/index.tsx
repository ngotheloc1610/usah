import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import OrderRouter from "./OrderRouter";

const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dashboard />} />
       <Route path="/orders/*" element={<OrderRouter/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom