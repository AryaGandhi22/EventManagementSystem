import {
  Search,
  UserRound,
  CalendarDays,
  MessageSquare,
  MoreVertical,
  Star,
  X,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getFeedback, deleteFeedback } from "../api";

function AdminFeedback() {
  console.log("ADMIN FEEDBACK PAGE LOADED");

  const [search, setSearch] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const loadFeedback = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("LOAD FEEDBACK CALLED");

      const data = await getFeedback({ all: "1" });

      console.log("FEEDBACK API DATA:", data);

      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("FEEDBACK API ERROR:", e);

      setError(e.message || "Failed to load feedback.");
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback = feedbackList.filter((feedback) => {
    const participant =
      feedback.user?.name ||
      feedback.user?.username ||
      "";

    const email = feedback.user?.email || "";

    const event =
      feedback.event_details?.title ||
      feedback.event?.title ||
      "";

    const comment = feedback.comment || "";

    return `${participant} ${email} ${event} ${comment}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getParticipantName = (feedback) =>
    feedback.user?.name ||
    feedback.user?.username ||
    "Unknown User";

  const getParticipantEmail = (feedback) =>
    feedback.user?.email ||
    "No email";

  const getEventTitle = (feedback) =>
    feedback.event_details?.title ||
    feedback.event?.title ||
    "Unknown Event";

  const handleView = (feedback) => {
    setOpenMenu(null);
    setSelectedFeedback(feedback);
  };

  const handleDelete = async (feedback) => {
    setOpenMenu(null);

    try {
      await deleteFeedback(feedback.id);

      if (selectedFeedback?.id === feedback.id) {
        setSelectedFeedback(null);
      }

      await loadFeedback();
    } catch (e) {
      window.alert(
        e.message || "Failed to delete the feedback."
      );
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Feedback</h1>
          <p>
            Review participant feedback and event ratings.
          </p>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-registration-count">
            {filteredFeedback.length} feedback
          </div>
        </div>

        {loading && (
          <div className="admin-empty-state">
            Loading feedback...
          </div>
        )}

        {!loading && error && (
          <div className="admin-empty-state">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredFeedback.length === 0 && (
            <div className="admin-empty-state">
              No feedback found.
            </div>
          )}

        {!loading &&
          !error &&
          filteredFeedback.length > 0 && (
            <div className="admin-feedback-grid">
              {filteredFeedback.map((feedback) => (
                <div
                  className="admin-feedback-card"
                  key={feedback.id}
                >
                  <div className="admin-feedback-top">
                    <div className="admin-feedback-user">
                      <div className="admin-feedback-avatar">
                        <UserRound size={20} />
                      </div>

                      <div>
                        <strong>
                          {getParticipantName(feedback)}
                        </strong>

                        <span>
                          {getParticipantEmail(feedback)}
                        </span>
                      </div>
                    </div>

                    <div className="admin-registration-actions">
                      <button
                        className="admin-more-btn"
                        type="button"
                        aria-label="More options"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === feedback.id
                              ? null
                              : feedback.id
                          )
                        }
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenu === feedback.id && (
                        <div className="admin-action-menu">
                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              handleDelete(feedback)
                            }
                          >
                            <Trash2 size={16} />
                            Delete feedback
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-feedback-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={
                          star <= feedback.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}

                    <span>
                      {feedback.rating}/5
                    </span>
                  </div>

                  <div className="admin-feedback-event">
                    <MessageSquare size={17} />

                    <span>
                      {getEventTitle(feedback)}
                    </span>
                  </div>

                  <p className="admin-feedback-comment">
                    “
                    {feedback.comment ||
                      "No comment provided."}
                    ”
                  </p>

                  <div className="admin-feedback-bottom">
                    <div className="admin-feedback-date">
                      <CalendarDays size={15} />

                      <span>
                        {formatDate(
                          feedback.created_at
                        )}
                      </span>
                    </div>

                    <button
                      className="admin-view-btn"
                      type="button"
                      onClick={() => handleView(feedback)}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {selectedFeedback && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h2>Feedback Details</h2>

                <p>
                  View participant feedback and rating.
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setSelectedFeedback(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-row">
                <span>Participant</span>

                <strong>
                  {getParticipantName(
                    selectedFeedback
                  )}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Email</span>

                <strong>
                  {getParticipantEmail(
                    selectedFeedback
                  )}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Event</span>

                <strong>
                  {getEventTitle(selectedFeedback)}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Rating</span>

                <div className="admin-feedback-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <=
                        selectedFeedback.rating
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}

                  <span>
                    {selectedFeedback.rating}/5
                  </span>
                </div>
              </div>

              <div className="admin-detail-row">
                <span>Date</span>

                <strong>
                  {formatDate(
                    selectedFeedback.created_at
                  )}
                </strong>
              </div>

              <div className="admin-detail-row">
                <span>Comment</span>

                <strong>
                  {selectedFeedback.comment ||
                    "No comment provided."}
                </strong>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-view-btn"
                onClick={() =>
                  setSelectedFeedback(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;