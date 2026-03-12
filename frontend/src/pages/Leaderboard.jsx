import { useEffect, useState } from "react";
import API from "../api/axios";

function Leaderboard() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    API.get("/leaderboard").then(res => {
      setUsers(res.data);
    });

  }, []);

  return (

    <div className="p-4">

      <h1>Top Players</h1>

      {users.map((u,i) => (

        <div key={u._id}>

          {i+1}. {u.username} — ${u.balance}

        </div>

      ))}

    </div>

  );

}

export default Leaderboard;
