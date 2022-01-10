import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import OrderRouter from "./OrderRouter";
import News from "../pages/News"
const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Dashboard />} />
       <Route path="/orders/*" element={<OrderRouter/>} />
       <Route path="/news" element={<News />} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom