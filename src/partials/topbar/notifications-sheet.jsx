import { useEffect, useState } from "react";
import { Calendar, Settings, Settings2, Shield, Users, CheckCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Cookies from "js-cookie";
/*import {
  useAcceptInvitationMutation,
  useRejectInvitationMutation,
  useAcceptAdminInvitationMutation,
  useRejectAdminInvitationMutation,
  useAcceptStudentInvitationMutation,
  useRejectStudentInvitationMutation,
} from "@/redux/notifications/notificationsApi";*/
export function NotificationsSheet({ trigger }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const token = Cookies.get("access_token");


  /*const [acceptInvitation] = useAcceptInvitationMutation();
  const [rejectInvitation] = useRejectInvitationMutation();
  const [acceptAdminInvitation] = useAcceptAdminInvitationMutation();
  const [rejectAdminInvitation] = useRejectAdminInvitationMutation();
  const [acceptStudentInvitation] = useAcceptStudentInvitationMutation();
  const [rejectStudentInvitation] = useRejectStudentInvitationMutation();*/

  // 🔌 WebSocket bağlanma
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8001/ws/notifications/");
    setSocket(ws);

    ws.onopen = () => {
      const user_id = Cookies.get("user_id");
      if (user_id) {
        ws.send(JSON.stringify({
          type: "authenticate",
          user_id: user_id,
        }));
      } else {
        console.error("User ID not found in localStorage.");
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [...prev, data]);
      if (!data.is_read) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket closed cleanly, code=${event.code}`);
      } else {
        console.error(`WebSocket closed unexpectedly ${event.code}`);
      }
    };

    return () => {
      ws.close();
    };
  }, [token]);

  // 📌 Davet yanıtla
  /*const handleInvitationResponse = async (notificationId, actionType) => {
    const notification = notifications.find((n) => n.id === notificationId);
    try {
      if (notification.message.toLowerCase().includes("student")) {
        actionType === "accept"
          ? await acceptStudentInvitation({ notification_id: notificationId }).unwrap()
          : await rejectStudentInvitation({ notification_id: notificationId }).unwrap();
      } else if (notification.message.toLowerCase().includes("admin")) {
        actionType === "accept"
          ? await acceptAdminInvitation({ notification_id: notificationId }).unwrap()
          : await rejectAdminInvitation({ notification_id: notificationId }).unwrap();
      } else {
        actionType === "accept"
          ? await acceptInvitation({ notification_id: notificationId }).unwrap()
          : await rejectInvitation({ notification_id: notificationId }).unwrap();
      }
      // state’ten çıkar
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Invitation response error:", err);
    }
  };*/

  // 📌 Hepsini okundu yap
  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (socket && unreadIds.length) {
      socket.send(JSON.stringify({ type: "mark_all_as_read", notification_ids: unreadIds }));
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 sm:w-[500px] sm:max-w-none inset-5 start-auto h-auto rounded-lg">
        <SheetHeader>
          <SheetTitle className="p-3">Notifications ({unreadCount})</SheetTitle>
        </SheetHeader>
        <SheetBody className="grow p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            <Tabs defaultValue="all" className="w-full relative">
              <TabsList variant="line" className="w-full px-5 mb-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <div className="grow flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" mode="icon">
                        <Settings className="size-4.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44" side="bottom" align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/account/members/teams">
                          <Users /> Invite Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings2 /> <span>Team Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to="/account/members/import-members">
                                <Shield /> Find Members
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/account/members/import-members">
                                <Calendar /> Meetings
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TabsList>

              {/* ✅ Dynamic notifications list */}
              <TabsContent value="all" className="mt-0">
                <div className="flex flex-col gap-5 p-4">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border rounded-md ${n.is_read ? "opacity-70" : "font-bold"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{n.message}</span>
                          {n.notification_type === "invitation" && (
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleInvitationResponse(n.id, "accept")}
                              >
                                <CheckCircle size={16} className="text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleInvitationResponse(n.id, "reject")}
                              >
                                <X size={16} className="text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{n.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline">Archive all</Button>
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
