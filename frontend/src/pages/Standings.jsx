import { useEffect, useState } from "react";
import API from "../api/axios";
import "./Standings.css";

function Standings() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const res = await API.get("/table");
      setTeams(res.data.teams || []);
    } catch (err) {
      console.error("Failed to fetch standings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading standings...</div>;

  return (
    <div className="standings-page">
      <h2>League Table</h2>
      
      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.sort((a, b) => b.points - a.points).map((team, index) => (
            <tr key={team._id} className={index < 4 ? "top-four" : ""}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.wins}</td>
              <td>{team.draws}</td>
              <td>{team.losses}</td>
              <td>{team.goalsFor}</td>
              <td>{team.goalsAgainst}</td>
              <td>{team.goalDifference}</td>
              <td className="points">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Standings;
