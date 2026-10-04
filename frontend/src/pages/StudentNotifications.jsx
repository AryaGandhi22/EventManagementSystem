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
import { getRegistrations, getEvents } from "../api";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const READ_NOTIFICATIONS_KEY = "student_read_notifications";

  const getReadNotificationIds = () => {
  try {
    return JSON.parse(
      localStorage.getItem(READ_NOTIFICATIONS_KEY) || "[]"
    );
  } catch {
    return [];
  }
};

  useEffect(() => {
  const loadNotifications = async () => {
    try {
      const [registrations, events] = await Promise.all([
        getRegistrations(),
        getEvents({ upcoming: true }),
      ]);

      const generatedNotifications = [];

      const readNotificationIds = new Set(
  getReadNotificationIds().map(String)
);

      registrations.forEach((registration) => {
        const event = registration.event_details;

        if (!event) return;

        if (registration.status === "registered") {
          generatedNotifications.push({
            id: `registration-${registration.id}`,
            type: "registration",
            title: "Registration Confirmed",
            message: `Your registration for ${event.title} has been confirmed.`,
            time: "Recently",
            unread: !readNotificationIds.has(
  `registration-${registration.id}`
),
          });

          if (event.start_date) {
            const eventDate = new Date(event.start_date);
            const now = new Date();

            if (eventDate > now) {
              generatedNotifications.push({
                id: `reminder-${registration.id}`,
                type: "event",
                title: "Upcoming Event Reminder",
                message: `${event.title} is coming up. Make sure you are ready for the event.`,
                time: eventDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                unread: !readNotificationIds.has(
  `reminder-${registration.id}`
),
              });
            }
          }
        }

        if (registration.status === "waitlisted") {
          generatedNotifications.push({
            id: `waitlist-${registration.id}`,
            type: "warning",
            title: "Event Waitlist",
            message: `You are currently waitlisted for ${event.title}.`,
            time: "Recently",
            unread: !readNotificationIds.has(
  `waitlist-${registration.id}`
),
          });
        }
      });

      events.forEach((event) => {
        const alreadyRegistered = registrations.some(
          (registration) =>
            String(registration.event) === String(event.id)
        );

        if (!alreadyRegistered) {
          generatedNotifications.push({
            id: `new-event-${event.id}`,
            type: "info",
            title: "New Event Available",
            message: `${event.title} is now available to explore.`,
            time: event.start_date
              ? new Date(event.start_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Recently",
            unread: !readNotificationIds.has(`new-event-${event.id}`),
          });
        }
      });

      setNotifications(generatedNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  loadNotifications();
}, []);

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
  const readIds = getReadNotificationIds();

  if (!readIds.map(String).includes(String(id))) {
    readIds.push(id);
    localStorage.setItem(
      READ_NOTIFICATIONS_KEY,
      JSON.stringify(readIds)
    );
  }

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
  const readIds = getReadNotificationIds();

  notifications.forEach((notification) => {
    if (!readIds.map(String).includes(String(notification.id))) {
      readIds.push(notification.id);
    }
  });

  localStorage.setItem(
    READ_NOTIFICATIONS_KEY,
    JSON.stringify(readIds)
  );

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