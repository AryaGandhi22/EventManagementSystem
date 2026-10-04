import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CalendarDays,
  ClipboardList,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { getNotifications, markNotificationRead, clearNotifications } from "../api";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
  }, []);

  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const filteredNotifications =
    activeFilter === "unread"
      ? notifications.filter((notification) => !notification.is_read)
      : notifications;

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((old) =>
        old.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Typically there would be a mark-all-read API, but we'll mark them locally for now
      // and maybe do it via clearNotifications or individually if we wanted to be strict.
      // We will just do it locally so it feels fast, and it might not persist unless we make N calls.
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await markNotificationRead(n.id);
      }
      setNotifications((old) =>
        old.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const getIcon = (type) => {
    if (type === "event") {
      return <CalendarDays size={19} />;
    }

    if (type === "registration") {
      return <ClipboardList size={19} />;
    }

    if (type === "success") {
      return <CheckCircle2 size={19} />;
    }

    if (type === "warning") {
      return <AlertCircle size={19} />;
    }

    return <Info size={19} />;
  };

  return (
    <section className="student-notifications-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            NOTIFICATIONS
          </div>

          <h1>Notifications</h1>

          <p>
            Stay updated about your events,
            registrations, and campus activities.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="student-stats-grid">

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon blue">
              <Bell size={21} />
            </div>
          </div>

          <h3>{notifications.length}</h3>
          <p>Total Notifications</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon orange">
              <AlertCircle size={21} />
            </div>
          </div>

          <h3>{unreadCount}</h3>
          <p>Unread</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon green">
              <Check size={21} />
            </div>
          </div>

          <h3>
            {notifications.length -
              unreadCount}
          </h3>

          <p>Read</p>
        </div>

      </div>

      {/* NOTIFICATIONS */}
      <div className="student-card">

        <div className="student-notifications-header">

          <div>
            <h2>Recent Notifications</h2>

            <p>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }.`
                : "You're all caught up."}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="student-mark-all"
              onClick={markAllAsRead}
            >
              <Check size={14} />
              Mark all as read
            </button>
          )}

        </div>

        {/* FILTERS */}
        <div className="student-notification-filters">

          <button
            type="button"
            className={
              activeFilter === "all"
                ? "student-notification-filter active"
                : "student-notification-filter"
            }
            onClick={() =>
              setActiveFilter("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              activeFilter === "unread"
                ? "student-notification-filter active"
                : "student-notification-filter"
            }
            onClick={() =>
              setActiveFilter("unread")
            }
          >
            Unread
            {unreadCount > 0 && (
              <span>{unreadCount}</span>
            )}
          </button>

        </div>

        {/* LIST */}
        {filteredNotifications.length === 0 ? (
          <div className="student-empty-state">
            <Bell size={30} />

            <h3>No notifications</h3>

            <p>
              You don't have any unread
              notifications.
            </p>
          </div>
        ) : (
          <div className="student-notification-list">

            {filteredNotifications.map(
              (notification) => (
                <div
                  className={
                    !notification.is_read
                      ? "student-notification-item unread"
                      : "student-notification-item"
                  }
                  key={notification.id}
                >

                  <div
                    className={`student-notification-icon ${notification.type}`}
                  >
                    {getIcon(
                      notification.type
                    )}
                  </div>

                  <div className="student-notification-content">

                    <div className="student-notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>

                      {(!notification.is_read) && (
                        <span className="student-unread-dot" />
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="student-notification-time">
                      {new Date(notification.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>

                  </div>

                  {(!notification.is_read) && (
                    <button
                      type="button"
                      className="student-notification-read"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >
                      <Check size={14} />
                      Mark read
                    </button>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>

    </section>
  );
};

export default StudentNotifications;