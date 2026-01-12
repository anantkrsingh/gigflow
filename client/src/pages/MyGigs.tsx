import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkAuth } from "@/store/authSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function MyGigs() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const fetchMyGigs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/gigs/my-gigs");
        setMyGigs(response.data.gigs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchMyGigs();
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
          <p className="mb-4">Please login to view your gigs</p>
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
            <Button variant="outline" onClick={() => navigate("/create-gig")}>
              Create Gig
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Gigs</h1>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : myGigs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't posted any gigs yet</p>
            <Button onClick={() => navigate("/create-gig")}>Create Your First Gig</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGigs.map((gig) => (
              <Card key={gig._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{gig.title}</CardTitle>
                  <CardDescription>
                    Status: <span className={`font-semibold ${
                      gig.status === "open" ? "text-green-600" : "text-gray-600"
                    }`}>
                      {gig.status}
                    </span>
                  </CardDescription>
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

