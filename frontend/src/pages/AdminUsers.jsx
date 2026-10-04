import { useEffect, useState } from "react";

import {
  Search,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  X,
} from "lucide-react";

import { getAdminUsers } from "../api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState("");

  const loadUsers = async (searchValue = "") => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers({
        search: searchValue,
      });

      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load users:", e);

      setError(
        e?.data?.detail ||
          e?.message ||
          "Unable to load users."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);
    loadUsers(value);
  };

  const handleMoreClick = (userId) => {
    setOpenMenu((current) =>
      current === userId ? null : userId
    );
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setModalType("view");
    setOpenMenu(null);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType("edit");
    setOpenMenu(null);
  };

  const handleToggleStatus = (user) => {
    const newStatus =
      user.status === "Active"
        ? "Inactive"
        : "Active";

    setUsers((currentUsers) =>
      currentUsers.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    setOpenMenu(null);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType("");
  };

  return (
    <div
      className="admin-dashboard"
      onClick={() => setOpenMenu(null)}
    >
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
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="admin-table-panel">
        <div className="admin-table-header">
          <div>
            <h2>All Users</h2>

            <p>
              Registered users in the system.
            </p>
          </div>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <div className="admin-users-table">
          <div className="admin-users-heading">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="admin-users-empty">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="admin-users-empty">
              No users found.
            </div>
          ) : (
            users.map((user) => (
              <div
                className="admin-users-row"
                key={user.id || user.email}
              >
                <div className="admin-user-cell">
                  <div className="admin-user-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <strong>
                      {user.name || user.username}
                    </strong>

                    <span>
                      {user.email || "No email"}
                    </span>
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

                <div
                  className="admin-user-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title={
                      user.status === "Active"
                        ? "Deactivate user"
                        : "Activate user"
                    }
                    onClick={() =>
                      handleToggleStatus(user)
                    }
                  >
                    {user.status === "Active" ? (
                      <UserX size={17} />
                    ) : (
                      <UserCheck size={17} />
                    )}
                  </button>

                  <div className="admin-user-menu-wrapper">
                    <button
                      type="button"
                      title="More options"
                      onClick={() =>
                        handleMoreClick(user.id)
                      }
                    >
                      <MoreVertical size={17} />
                    </button>

                    {openMenu === user.id && (
                     <div className="admin-user-dropdown">
  <button
    type="button"
    onClick={() => handleView(user)}
  >
    <Eye size={16} />
    <span>View Details</span>
  </button>

  <button
    type="button"
    onClick={() => handleToggleStatus(user)}
  >
    {user.status === "Active" ? (
      <>
        <UserX size={16} />
        <span>Deactivate User</span>
      </>
    ) : (
      <>
        <UserCheck size={16} />
        <span>Activate User</span>
      </>
    )}
  </button>
</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* USER DETAILS / EDIT MODAL */}
      {selectedUser && (
        <div
          className="admin-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-modal-header">
              <div>
                <h2>
                  {modalType === "view"
                    ? "User Details"
                    : "Edit User"}
                </h2>

                <p>
                  {modalType === "view"
                    ? "View registered user information."
                    : "Edit user information."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="admin-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-user-details">
              <div className="admin-detail-avatar">
                {selectedUser.name
                  ? selectedUser.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>

              <div className="admin-detail-item">
                <label>Name</label>
                <strong>
                  {selectedUser.name ||
                    selectedUser.username ||
                    "Not available"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Username</label>
                <strong>
                  {selectedUser.username ||
                    "Not available"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Email</label>
                <strong>
                  {selectedUser.email ||
                    "Not available"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Role</label>
                <strong>
                  {selectedUser.role ||
                    "User"}
                </strong>
              </div>

              <div className="admin-detail-item">
                <label>Status</label>
                <strong
                  className={
                    selectedUser.status ===
                    "Active"
                      ? "admin-detail-active"
                      : "admin-detail-inactive"
                  }
                >
                  {selectedUser.status ||
                    "Unknown"}
                </strong>
              </div>
            </div>

            {modalType === "edit" && (
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-modal-cancel"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-modal-save"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;