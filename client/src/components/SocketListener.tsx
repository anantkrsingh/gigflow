import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { socket } from "@/lib/socket";
import { useToast } from "@/components/ui/use-toast";

export default function SocketListener() {
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    socket.on("bidHired", (data: { freelancerId: string; gigTitle: string; message: string }) => {
      if (user && user._id === data.freelancerId) {
        toast({
          title: "Congratulations!",
          description: data.message,
        });
      }
    });

    return () => {
      socket.off("bidHired");
    };
  }, [user, toast]);

  return null;
}

