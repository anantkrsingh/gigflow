import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchGigs } from "@/store/gigSlice";
import { logout } from "@/store/authSlice";
import { checkAuth } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "@/lib/api";

export default function Home() {
  const dispatch = useAppDispatch();
  const { gigs, loading } = useAppSelector((state) => state.gigs);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchGigs());
    dispatch(checkAuth());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    dispatch(fetchGigs(search));
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-black">
            GigFlow
          </Link>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/create-gig")}>
                  Post a Gig
                </Button>
                <Button variant="outline" onClick={() => navigate("/my-gigs")}>
                  My Gigs
                </Button>
                <Button variant="outline" onClick={() => navigate("/my-bids")}>
                  My Bids
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/register")}>Register</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-black">Browse Gigs</h1>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Search gigs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No gigs found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <Card key={gig._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{gig.title}</CardTitle>
                  <CardDescription>by {gig.ownerId.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">${gig.budget}</span>
                    <Link to={`/gig/${gig._id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

