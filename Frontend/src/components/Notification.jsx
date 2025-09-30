import { useNotificationStore } from "../stores/notificationStore";
import { X } from "lucide-react";

function Notifications() {
  const {notifications, removeNotification} = useNotificationStore();

  return (
    <div className="fixed top-[65px] right-4 space-y-2 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-lg px-4 py-2 shadow-md text-white ${
            n.type === "success"
              ? "bg-green-600"
              : n.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {n.message}
          <button className="ml-2" onClick={()=>removeNotification(n.id)}><X size={10}/></button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
