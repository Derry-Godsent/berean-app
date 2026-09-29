import { useEffect, useState } from "react";
import Berean from "./berean/Berean";
import { SupportPage } from "./screens/Support";

export default function App() {
  const read = () =>
    (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "") || "/";
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onHash = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route.startsWith("/support")) return <SupportPage />;
  return <Berean />;
}
