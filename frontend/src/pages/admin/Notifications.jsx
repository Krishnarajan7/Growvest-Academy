import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Plus,
  Send,
  Trash2,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// Sample initial notifications
const initialNotifications = [
  {
    id: 1,
    title: "New Course Launched!",
    message: "We're excited to announce our new Advanced React course is now live. Enroll today and get 20% off!",
    type: "success",
    audience: "all",
    status: "sent",
    sentDate: "Jan 5, 2026",
    recipients: 2847,
  },
  {
    id: 2,
    title: "Maintenance Scheduled",
    message: "The platform will be under maintenance on January 10 from 2:00 AM to 4:00 AM IST. Services may be unavailable.",
    type: "warning",
    audience: "all",
    status: "scheduled",
    sentDate: "Jan 10, 2026",
    recipients: 0,
  },
  {
    id: 3,
    title: "Exam Results Published",
    message: "Your final exam results for the Web Development Bootcamp have been published. Check your dashboard now!",
    type: "info",
    audience: "students",
    status: "sent",
    sentDate: "Dec 28, 2025",
    recipients: 1200,
  },
  {
    id: 4,
    title: "Premium Feature Update",
    message: "Premium members now get access to 1-on-1 mentorship sessions. Book your slot today!",
    type: "success",
    audience: "premium",
    status: "sent",
    sentDate: "Dec 20, 2025",
    recipients: 450,
  },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    audience: "all",
  });

  const handleCreateNotification = (status) => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const recipientsCount =
      status === "sent"
        ? formData.audience === "all"
          ? 2847
          : formData.audience === "premium"
          ? 450
          : 1200
        : 0;

    const newNotification = {
      id:
        notifications.length > 0
          ? Math.max(...notifications.map((n) => n.id)) + 1
          : 1,
      ...formData,
      status,
      sentDate:
        status === "sent" || status === "scheduled"
          ? new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-",
      recipients: recipientsCount,
    };

    setNotifications([newNotification, ...notifications]);
    setFormData({ title: "", message: "", type: "info", audience: "all" });
    setIsAddOpen(false);
    toast.success(
      status === "sent"
        ? "Notification sent successfully!"
        : "Draft saved successfully!"
    );
  };

  const handleDeleteNotification = () => {
    if (!selectedNotification) return;

    setNotifications(
      notifications.filter((n) => n.id !== selectedNotification.id)
    );
    setIsDeleteOpen(false);
    setSelectedNotification(null);
    toast.success("Notification deleted");
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      case "alert":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-500/10 text-green-500 border border-green-500/20";
      case "scheduled":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send announcements to students
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
              <DialogDescription>
                Send an announcement to your students
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Notification title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Write your message..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Audience</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(value) =>
                      setFormData({ ...formData, audience: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3 sm:gap-2 flex flex-col sm:flex-row">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleCreateNotification("draft")}
              >
                Save as Draft
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => handleCreateNotification("sent")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter((n) => n.status === "sent").length}
                </p>
                <p className="text-sm text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter((n) => n.status === "scheduled").length}
                </p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications
                    .reduce((sum, n) => sum + n.recipients, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Manage your sent, scheduled, and draft notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No notifications yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {notification.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        {notification.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {notification.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {notification.audience === "all"
                          ? "All Users"
                          : notification.audience === "premium"
                          ? "Premium Only"
                          : "Students Only"}
                      </span>
                      {notification.status === "sent" && (
                        <>
                          <span>• Sent: {notification.sentDate}</span>
                          <span>
                            • {notification.recipients.toLocaleString()}{" "}
                            recipients
                          </span>
                        </>
                      )}
                      {notification.status === "scheduled" && (
                        <span>• Scheduled: {notification.sentDate}</span>
                      )}
                      {notification.status === "draft" && (
                        <span>• Draft</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => {
                      setSelectedNotification(notification);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              <strong>{selectedNotification?.title}</strong>"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNotification}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}