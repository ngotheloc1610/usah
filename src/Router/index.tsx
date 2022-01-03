import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import OrderRouter from "./OrderRouter";

const RouterDom = () => {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/orders/*" element={<OrderRouter/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default RouterDom