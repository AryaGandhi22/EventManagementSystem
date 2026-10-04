import { useState } from "react";
import {
  Bell,
  Check,
  CalendarDays,
  ClipboardList,
  AlertCircle,
  Info,
  CheckCircle2,
} from "lucide-react";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "event",
      title: "Upcoming Event Reminder",
      message:
        "Tech Fest 2026 is coming up soon. Make sure you are ready for the event.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "registration",
      title: "Registration Confirmed",
      message:
        "Your registration for Tech Fest 2026 has been confirmed.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "event",
      title: "Event Updated",
      message:
        "The venue or schedule for one of your registered events has been updated.",
      time: "3 hours ago",
      unread: false,
    },
    {
      id: 4,
      type: "info",
      title: "New Event Available",
      message:
        "A new campus event matching your interests is now available.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const filteredNotifications =
    activeFilter === "unread"
      ? notifications.filter(
          (notification) => notification.unread
        )
      : notifications;

  const markAsRead = (id) => {
    setNotifications((old) =>
      old.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: false,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((old) =>
      old.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
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
                    notification.unread
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

                      {notification.unread && (
                        <span className="student-unread-dot" />
                      )}

                    </div>

                    <p>
                      {notification.message}
                    </p>

                    <span className="student-notification-time">
                      {notification.time}
                    </span>

                  </div>

                  {notification.unread && (
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