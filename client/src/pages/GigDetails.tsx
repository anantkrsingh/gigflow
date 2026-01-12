import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBidsByGig, createBid, hireBid } from "@/store/bidSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

export default function GigDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { bids, loading } = useAppSelector((state) => state.bids);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [gig, setGig] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await api.get(`/gigs`);
        const gigs = response.data.gigs;
        const foundGig = gigs.find((g: any) => g._id === id);
        if (foundGig) {
          setGig(foundGig);
          if (user && foundGig.ownerId._id === user._id) {
            setIsOwner(true);
            dispatch(fetchBidsByGig(id!));
          }
        } else {
          toast({
            title: "Error",
            description: "Gig not found",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load gig",
          variant: "destructive",
        });
      }
    };
    if (id) {
      fetchGig();
    }
  }, [id, user, dispatch, navigate, toast]);

  const handleBid = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Please login to place a bid",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    const result = await dispatch(
      createBid({
        gigId: id!,
        message,
        price: parseFloat(price),
      })
    );
    if (createBid.fulfilled.match(result)) {
      toast({
        title: "Success",
        description: "Bid placed successfully",
      });
      setMessage("");
      setPrice("");
    } else {
      toast({
        title: "Error",
        description: "Failed to place bid",
        variant: "destructive",
      });
    }
  };

  if (!gig) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-black">GigFlow</span>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{gig.title}</CardTitle>
            <CardDescription>by {gig.ownerId.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{gig.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">${gig.budget}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                gig.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {gig.status}
              </span>
            </div>
          </CardContent>
        </Card>

        {isOwner ? (
          <Card>
            <CardHeader>
              <CardTitle>Bids ({bids.length})</CardTitle>
              <CardDescription>Review and hire freelancers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading bids...</div>
              ) : bids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No bids yet</div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <Card key={bid._id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{bid.freelancerId.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{bid.message}</p>
                          <p className="text-lg font-semibold">${bid.price}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                            bid.status === "hired" ? "bg-green-100 text-green-800" :
                            bid.status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        {bid.status === "pending" && (
                          <HireButton bidId={bid._id} />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          gig.status === "open" && (
            <Card>
              <CardHeader>
                <CardTitle>Place a Bid</CardTitle>
                <CardDescription>Submit your proposal for this gig</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleBid(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your approach and why you're the right fit..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Your Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!isAuthenticated}>
                    {isAuthenticated ? "Submit Bid" : "Login to Bid"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function HireButton({ bidId }: { bidId: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleHire = async () => {
    setLoading(true);
    try {
      const result = await dispatch(hireBid(bidId));
      if (hireBid.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Freelancer hired successfully",
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Failed to hire freelancer",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" disabled={loading}>
          Hire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Hire</DialogTitle>
          <DialogDescription>
            Are you sure you want to hire this freelancer? This will reject all other bids for this gig.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleHire} disabled={loading}>
            {loading ? "Hiring..." : "Confirm Hire"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

