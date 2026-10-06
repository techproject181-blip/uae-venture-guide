import { requireUser } from "@/lib/guards";

// The role check runs here, above the loading screen, so a wrong role gets a
// real 404 instead of a "not found" page sent with status 200.
export default async function Layout({ children }) {
  await requireUser({ roles: ["mentor"] });
  return children;
}
