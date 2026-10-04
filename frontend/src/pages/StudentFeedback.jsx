import { useEffect, useState } from "react";
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  createFeedback,
  getFeedback,
  getRegistrations,
  createPlatformFeedback,
} from "../api";

const StudentFeedback = () => {
  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [ratingContent, setRatingContent] = useState(0);
  const [ratingVenue, setRatingVenue] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingOrganization, setRatingOrganization] = useState(0);

  const [comment, setComment] = useState("");

  const [activeTab, setActiveTab] = useState("events");
  
  const [platformType, setPlatformType] = useState("suggestion");
  const [platformTitle, setPlatformTitle] = useState("");
  const [platformDesc, setPlatformDesc] = useState("");
  const [platformFile, setPlatformFile] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  /*
   * Temporary frontend data.
   * This will later come from the feedback API
   * and the student's completed registrations.
   */
  const [pendingEvents, setPendingEvents] = useState([]);

  const [feedbackHistory, setFeedbackHistory] = useState([]);

    useEffect(() => {
  const loadFeedbackData = async () => {
    try {
      const [registrations, feedback] = await Promise.all([
        getRegistrations(),
        getFeedback(),
      ]);

      const submittedEventIds = new Set(
        feedback.map((item) => String(item.event))
      );

      const pending = registrations
        .filter(
          (registration) =>
            registration.status === "registered" &&
            registration.event_details &&
            !submittedEventIds.has(String(registration.event))
        )
        .map((registration) => {
          const event = registration.event_details;

          return {
            id: registration.event,
            title: event.title,
            category: event.category,
            date: event.start_date
              ? new Date(event.start_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Date not specified",
            venue:
              event.venue?.name ||
              "Venue not specified",
          };
        });

      setPendingEvents(pending);

      setFeedbackHistory(
        feedback.map((item) => ({
          id: item.id,
          event: item.event_details?.title || "Event",
          rating: item.rating,
          comment: item.comment,
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Date not specified",
        }))
      );

      setLoading(false);
    } catch (error) {
      console.error("Failed to load feedback data:", error);
      setLoading(false);
    }
  };

  loadFeedbackData();
}, []);

  const openFeedback = (event) => {
    setSelectedEvent(event);
    setRating(0);
    setHoverRating(0);
    setRatingContent(0);
    setRatingVenue(0);
    setRatingValue(0);
    setRatingOrganization(0);
    setComment("");
    setSubmitted(false);
  };

  const closeFeedback = () => {
    setSelectedEvent(null);
    setRating(0);
    setHoverRating(0);
    setRatingContent(0);
    setRatingVenue(0);
    setRatingValue(0);
    setRatingOrganization(0);
    setComment("");
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!rating || !selectedEvent?.id) return;

  try {
    await createFeedback({
      event: selectedEvent.id,
      rating: rating,
      rating_content: ratingContent || null,
      rating_venue: ratingVenue || null,
      rating_value: ratingValue || null,
      rating_organization: ratingOrganization || null,
      comment: comment,
    });

    const newFeedback = {
      id: Date.now(),
      event: selectedEvent.title,
      rating: rating,
      comment: comment,
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
  } catch (error) {
    console.error("Feedback submission failed:", error);
    alert(error.message || "Failed to submit feedback.");
  }
};

  const handlePlatformSubmit = async (e) => {
    e.preventDefault();
    if (!platformTitle || !platformDesc) return;
    
    try {
      const payload = new FormData();
      payload.append("type", platformType);
      payload.append("title", platformTitle);
      payload.append("description", platformDesc);
      if (platformFile) {
        payload.append("screenshot", platformFile);
      }
      
      await createPlatformFeedback(payload);
      
      alert("Feedback submitted successfully. Thank you!");
      setPlatformTitle("");
      setPlatformDesc("");
      setPlatformFile(null);
    } catch (err) {
      alert("Failed to submit platform feedback.");
    }
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

      <div className="student-tabs" style={{ marginTop: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button
          type="button"
          className={activeTab === "events" ? "student-tab active" : "student-tab"}
          onClick={() => setActiveTab("events")}
        >
          Event Feedback
        </button>
        <button
          type="button"
          className={activeTab === "platform" ? "student-tab active" : "student-tab"}
          onClick={() => setActiveTab("platform")}
        >
          Platform Suggestions
        </button>
      </div>

      {activeTab === "events" && (
        <>
          {/* PENDING FEEDBACK */}
          <div className="student-card" style={{ marginTop: '2rem' }}>

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

                  <div className="student-feedback-field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label>Event Content</label>
                      <select value={ratingContent} onChange={(e) => setRatingContent(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <option value={0}>Rate (Optional)</option>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label>Venue Quality</label>
                      <select value={ratingVenue} onChange={(e) => setRatingVenue(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <option value={0}>Rate (Optional)</option>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label>Value for Money/Time</label>
                      <select value={ratingValue} onChange={(e) => setRatingValue(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <option value={0}>Rate (Optional)</option>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label>Organization</label>
                      <select value={ratingOrganization} onChange={(e) => setRatingOrganization(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <option value={0}>Rate (Optional)</option>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
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
      </>
      )}

      {activeTab === "platform" && (
        <div className="student-card" style={{ marginTop: '2rem' }}>
          <div className="student-card-header">
            <div>
              <h2>Submit Platform Feedback</h2>
              <p>Found a bug or have a feature suggestion? Let the admins know!</p>
            </div>
          </div>
          
          <form onSubmit={handlePlatformSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="student-feedback-field">
              <label>Feedback Type</label>
              <select value={platformType} onChange={(e) => setPlatformType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <option value="suggestion">Suggestion / Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="complaint">Complaint</option>
              </select>
            </div>
            <div className="student-feedback-field">
              <label>Title</label>
              <input type="text" value={platformTitle} onChange={(e) => setPlatformTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="Brief summary" required />
            </div>
            <div className="student-feedback-field">
              <label>Description</label>
              <textarea value={platformDesc} onChange={(e) => setPlatformDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} placeholder="Please provide details..." rows={4} required />
            </div>
            <div className="student-feedback-field">
              <label>Screenshot (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setPlatformFile(e.target.files[0])} style={{ padding: '5px' }} />
            </div>
            <div style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" disabled={!platformTitle || !platformDesc}>
                Submit to Admin
              </button>
            </div>
          </form>
        </div>
      )}

    </section>
  );
};

export default StudentFeedback;