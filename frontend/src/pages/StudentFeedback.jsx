import { useState } from "react";
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  CalendarDays,
  MapPin,
} from "lucide-react";

const StudentFeedback = () => {
  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [comment, setComment] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const [submitted, setSubmitted] = useState(false);

  /*
   * Temporary frontend data.
   * This will later come from the feedback API
   * and the student's completed registrations.
   */
  const [pendingEvents] = useState([
    {
      id: 1,
      title: "Tech Fest 2026",
      category: "Technical",
      date: "09 Oct 2026",
      venue: "Auditorium Hall",
    },
  ]);

  const [feedbackHistory, setFeedbackHistory] =
    useState([
      {
        id: 1,
        event: "Annual Cultural Fest",
        rating: 5,
        comment:
          "Excellent event with great organization.",
        date: "18 Sep 2026",
      },
    ]);

  const openFeedback = (event) => {
    setSelectedEvent(event);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSuggestions("");
    setSubmitted(false);
  };

  const closeFeedback = () => {
    setSelectedEvent(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSuggestions("");
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating) return;

    const newFeedback = {
      id: Date.now(),
      event: selectedEvent.title,
      rating,
      comment,
      date: new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
    };

    setFeedbackHistory((old) => [
      newFeedback,
      ...old,
    ]);

    setSubmitted(true);
  };

  return (
    <section className="student-feedback-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            MY FEEDBACK
          </div>

          <h1>Event Feedback</h1>

          <p>
            Share your experience and help improve
            future campus events.
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="student-stats-grid">

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon orange">
              <Star size={21} />
            </div>
          </div>

          <h3>
            {feedbackHistory.length}
          </h3>

          <p>Feedback Given</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon blue">
              <MessageSquare size={21} />
            </div>
          </div>

          <h3>
            {pendingEvents.length}
          </h3>

          <p>Pending Feedback</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon green">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <h3>
            {feedbackHistory.length > 0
              ? (
                  feedbackHistory.reduce(
                    (sum, item) =>
                      sum + item.rating,
                    0
                  ) /
                  feedbackHistory.length
                ).toFixed(1)
              : "0.0"}
          </h3>

          <p>Average Rating</p>
        </div>

        <div className="student-stat-card">
          <div className="student-stat-top">
            <div className="student-stat-icon purple">
              <Star size={21} />
            </div>
          </div>

          <h3>5</h3>

          <p>Rating Scale</p>
        </div>

      </div>

      {/* PENDING FEEDBACK */}
      <div className="student-card">

        <div className="student-card-header">
          <div>
            <h2>Pending Feedback</h2>

            <p>
              Tell us about events you recently
              attended.
            </p>
          </div>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="student-empty-state">
            <CheckCircle2 size={30} />

            <h3>All caught up!</h3>

            <p>
              You have no pending feedback requests.
            </p>
          </div>
        ) : (
          <div className="student-feedback-grid">

            {pendingEvents.map((event) => (
              <div
                className="student-feedback-card"
                key={event.id}
              >

                <div className="student-feedback-card-header">
                  <span className="student-category">
                    {event.category}
                  </span>

                  <span className="student-feedback-pending">
                    Pending
                  </span>
                </div>

                <h3>{event.title}</h3>

                <div className="student-feedback-event-info">

                  <span>
                    <CalendarDays size={14} />
                    {event.date}
                  </span>

                  <span>
                    <MapPin size={14} />
                    {event.venue}
                  </span>

                </div>

                <button
                  type="button"
                  className="student-feedback-submit"
                  onClick={() =>
                    openFeedback(event)
                  }
                >
                  <Star size={15} />
                  Give Feedback
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* FEEDBACK HISTORY */}
      <div className="student-card">

        <div className="student-card-header">
          <div>
            <h2>Feedback History</h2>

            <p>
              Your previously submitted feedback.
            </p>
          </div>
        </div>

        {feedbackHistory.length === 0 ? (
          <div className="student-empty-state">
            <MessageSquare size={28} />

            <h3>No feedback submitted</h3>

            <p>
              Your feedback history will appear here.
            </p>
          </div>
        ) : (
          <div className="student-feedback-history">

            {feedbackHistory.map((item) => (
              <div
                className="student-feedback-history-item"
                key={item.id}
              >

                <div>
                  <h3>{item.event}</h3>

                  <span>
                    {item.date}
                  </span>
                </div>

                <div className="student-history-rating">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <Star
                        key={star}
                        size={15}
                        fill={
                          star <= item.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )
                  )}

                </div>

                <p>
                  {item.comment ||
                    "No written comment."}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* FEEDBACK MODAL */}
      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() =>
            !submitted && closeFeedback()
          }
        >
          <div
            className="modal-container student-feedback-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {!submitted ? (
              <>
                <div className="modal-header">

                  <div>
                    <h2>Event Feedback</h2>

                    <p>
                      {selectedEvent.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={closeFeedback}
                  >
                    ×
                  </button>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="student-feedback-form"
                >

                  {/* RATING */}
                  <div className="student-feedback-field">

                    <label>
                      How would you rate this event?
                    </label>

                    <div className="student-star-rating">

                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={star}
                            type="button"
                            className="student-star-button"
                            onMouseEnter={() =>
                              setHoverRating(
                                star
                              )
                            }
                            onMouseLeave={() =>
                              setHoverRating(0)
                            }
                            onClick={() =>
                              setRating(star)
                            }
                          >
                            <Star
                              size={30}
                              fill={
                                star <=
                                (hoverRating ||
                                  rating)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        )
                      )}

                    </div>

                    <span className="student-rating-text">
                      {rating === 0
                        ? "Select a rating"
                        : rating === 1
                        ? "Poor"
                        : rating === 2
                        ? "Below Average"
                        : rating === 3
                        ? "Good"
                        : rating === 4
                        ? "Very Good"
                        : "Excellent"}
                    </span>

                  </div>

                  {/* COMMENT */}
                  <div className="student-feedback-field">

                    <label htmlFor="feedback-comment">
                      Your experience
                    </label>

                    <textarea
                      id="feedback-comment"
                      value={comment}
                      onChange={(e) =>
                        setComment(
                          e.target.value
                        )
                      }
                      placeholder="What did you like about the event?"
                      rows={4}
                    />

                  </div>

                  {/* SUGGESTIONS */}
                  <div className="student-feedback-field">

                    <label htmlFor="feedback-suggestions">
                      Suggestions for improvement
                    </label>

                    <textarea
                      id="feedback-suggestions"
                      value={suggestions}
                      onChange={(e) =>
                        setSuggestions(
                          e.target.value
                        )
                      }
                      placeholder="How could future events be improved?"
                      rows={3}
                    />

                  </div>

                  <div className="modal-actions">

                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeFeedback}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!rating}
                    >
                      <Send size={14} />
                      Submit Feedback
                    </button>

                  </div>

                </form>
              </>
            ) : (
              <div className="student-feedback-success">

                <div className="student-feedback-success-icon">
                  <CheckCircle2 size={34} />
                </div>

                <h2>Thank You!</h2>

                <p>
                  Your feedback for{" "}
                  <strong>
                    {selectedEvent.title}
                  </strong>{" "}
                  has been submitted successfully.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={closeFeedback}
                >
                  Done
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};

export default StudentFeedback;