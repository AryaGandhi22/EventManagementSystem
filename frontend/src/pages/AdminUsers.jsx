import {
  Search,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react";

function AdminUsers() {
  const users = [
    {
      name: "Aarav Sharma",
      email: "aarav@college.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Sneha Patil",
      email: "sneha@college.com",
      role: "Organizer",
      status: "Active",
    },
    {
      name: "Rahul Joshi",
      email: "rahul@college.com",
      role: "Student",
      status: "Active",
    },
    {
      name: "Kavya More",
      email: "kavya@college.com",
      role: "Student",
      status: "Inactive",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-description">
            Manage students, organizers and system users.
          </p>
        </div>
      </div>

      <div className="admin-user-toolbar">
        <div className="admin-user-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users..."
          />
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <div>
            <h2>All Users</h2>
            <p>Registered users in the system.</p>
          </div>
        </div>

        <div className="admin-users-table">
          <div className="admin-users-heading">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {users.map((user) => (
            <div
              className="admin-users-row"
              key={user.email}
            >
              <div className="admin-user-cell">
                <div className="admin-user-avatar">
                  {user.name.charAt(0)}
                </div>

                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>

              <span className="admin-role">
                {user.role}
              </span>

              <span
                className={`admin-status ${
                  user.status === "Active"
                    ? "active"
                    : "inactive"
                }`}
              >
                {user.status}
              </span>

              <div className="admin-user-actions">
                <button
                  type="button"
                  title={
                    user.status === "Active"
                      ? "Deactivate user"
                      : "Activate user"
                  }
                >
                  {user.status === "Active" ? (
                    <UserX size={17} />
                  ) : (
                    <UserCheck size={17} />
                  )}
                </button>

                <button
                  type="button"
                  title="More options"
                >
                  <MoreVertical size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;