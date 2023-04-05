import {
    Routes,
    Route
  } from "react-router-dom";
import ResetTeamPassword from "../pages/Authentication/reset-team-password";

const TeamRouter = () => {
    return (
      <div>
        <Routes>
          <Route path="/reset-password" element={<ResetTeamPassword />} />
        </Routes>
      </div>
    );
  }

  export default TeamRouter