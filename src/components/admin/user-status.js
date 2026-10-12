// A rejected sign-up is saved as a suspended account with `rejected: true`
// (see models/User.js). The administrator sees it as its own status, so it is
// not mistaken for a working account that was suspended.

/** The status to show for a user: "pending", "active", "suspended" or "rejected". */
export function userStatus(user) {
  return user.status === "suspended" && user.rejected ? "rejected" : user.status;
}
