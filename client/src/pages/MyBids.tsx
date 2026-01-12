import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { checkAuth } from "@/store/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function MyBids() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const fetchMyBids = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/bids/my-bids");
        setBids(response.data.bids);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchMyBids();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please login to view your bids</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-black">GigFlow</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bids</h1>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : bids.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't placed any bids yet</p>
            <Button onClick={() => navigate("/")}>Browse Gigs</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <Card key={bid._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{bid.gigId?.title || "Gig"}</CardTitle>
                  <CardDescription>
                    Status: <span className={`font-semibold ${
                      bid.status === "hired" ? "text-green-600" :
                      bid.status === "rejected" ? "text-red-600" :
                      "text-yellow-600"
                    }`}>
                      {bid.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{bid.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">${bid.price}</span>
                    <Link to={`/gig/${bid.gigId._id || bid.gigId}`}>
                      <Button variant="outline">View Gig</Button>
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

