import {
  Search,
  UserRound,
  CalendarDays,
  MessageSquare,
  MoreVertical,
  Star,
} from "lucide-react";
import { useState } from "react";

function AdminFeedback() {
  const [search, setSearch] = useState("");

  const feedbackList = [
    {
      id: 1,
      participant: "Aarav Sharma",
      email: "aarav@college.com",
      event: "Tech Fest 2026",
      rating: 5,
      comment: "Excellent event with great technical sessions.",
      date: "20 Sep 2026",
    },
    {
      id: 2,
      participant: "Sneha Patil",
      email: "sneha@college.com",
      event: "Cultural Night",
      rating: 4,
      comment: "Very well organized and enjoyable.",
      date: "25 Sep 2026",
    },
   
    {
      id: 3,
      participant: "Kavya More",
      email: "kavya@college.com",
      event: "AI Workshop",
      rating: 3,
      comment: "The workshop was useful but could be longer.",
      date: "30 Sep 2026",
    },
    {
      id: 4,
      participant: "Rohan Deshmukh",
      email: "rohan@college.com",
      event: "Tech Fest 2026",
      rating: 5,
      comment: "Loved the project demonstrations and sessions.",
      date: "01 Oct 2026",
    },
    {
      id: 5,
      participant: "Isha Kulkarni",
      email: "isha@college.com",
      event: "Cultural Night",
      rating: 4,
      comment: "Amazing performances and good overall experience.",
      date: "02 Oct 2026",
    },
  ];

  const filteredFeedback = feedbackList.filter((feedback) =>
    `${feedback.participant} ${feedback.email} ${feedback.event} ${feedback.comment}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Feedback</h1>
          <p>Review participant feedback and event ratings.</p>
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

        <div className="admin-feedback-grid">
          {filteredFeedback.map((feedback) => (
            <div className="admin-feedback-card" key={feedback.id}>
              <div className="admin-feedback-top">
                <div className="admin-feedback-user">
                  <div className="admin-feedback-avatar">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <strong>{feedback.participant}</strong>
                    <span>{feedback.email}</span>
                  </div>
                </div>

                <button className="admin-more-btn">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="admin-feedback-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= feedback.rating ? "currentColor" : "none"}
                  />
                ))}
                <span>{feedback.rating}/5</span>
              </div>

              <div className="admin-feedback-event">
                <MessageSquare size={17} />
                <span>{feedback.event}</span>
              </div>

              <p className="admin-feedback-comment">
                “{feedback.comment}”
              </p>

              <div className="admin-feedback-bottom">
                <div className="admin-feedback-date">
                  <CalendarDays size={15} />
                  <span>{feedback.date}</span>
                </div>

                <button className="admin-view-btn">
                  View
                </button>
              </div>
            </div>
          ))}

          {filteredFeedback.length === 0 && (
            <div className="admin-empty-state">
              No feedback found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminFeedback;