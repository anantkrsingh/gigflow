import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "./components/ui/toaster";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateGig from "./pages/CreateGig";
import GigDetails from "./pages/GigDetails";
import MyGigs from "./pages/MyGigs";
import MyBids from "./pages/MyBids";
import SocketListener from "./components/SocketListener";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SocketListener />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/create-gig" element={<CreateGig />} />
          <Route path="/gig/:id" element={<GigDetails />} />
          <Route path="/my-gigs" element={<MyGigs />} />
          <Route path="/my-bids" element={<MyBids />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
