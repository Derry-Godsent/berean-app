import { useEffect } from "react";
import { StoreProvider } from "./ui";
import { AppProvider, useApp } from "../app/store";
import { ProfileProvider } from "../app/profile";
import { ThemeProvider } from "../app/theme";
import Shell from "../app/Shell";
import Home from "../screens/Home";
import Seasons from "../screens/Seasons";
import Reader from "../screens/Reader";
import Play from "../screens/Play";
import Journey from "../screens/Journey";
import Room from "../screens/Room";
import Studio from "../screens/Studio";
import Me from "../screens/Me";
import Support from "../screens/Support";

function Screens() {
  const { screen } = useApp();
  switch (screen) {
    case "seasons":
      return <Seasons />;
    case "read":
      return <Reader />;
    case "play":
      return <Play />;
    case "journey":
      return <Journey />;
    case "room":
      return <Room />;
    case "studio":
      return <Studio />;
    case "me":
      return <Me />;
    case "support":
      return <Support />;
    default:
      return <Home />;
  }
}

export default function Berean() {
  useEffect(() => {
    document.title = "Berean — The Bible, in seasons";
  }, []);

  return (
    <StoreProvider>
      <ThemeProvider>
        <ProfileProvider>
          <AppProvider>
            <Shell>
              <Screens />
            </Shell>
          </AppProvider>
        </ProfileProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
