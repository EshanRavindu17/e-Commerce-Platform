import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
