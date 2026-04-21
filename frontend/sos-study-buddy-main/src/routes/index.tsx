import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sos_token");
      if (token) {
        throw redirect({ to: "/dashboard" });
      } else {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: () => null,
});
