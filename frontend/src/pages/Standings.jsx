import { useEffect, useState } from "react";
import API from "../api/axios";

function Standings() {

  const [teams, setTeams] = useState([]);

  useEffect(() => {

    API.get("/table").then(res => {
      setTeams(res.data);
    });

  }, []);

  return (

    <div className="p-4">

      <h1>League Table</h1>

      {teams.map((t, i) => (

        <div key={t._id}>

          {i+1}. {t.name} - {t.points} pts

        </div>

      ))}

    </div>

  );

}

export default Standings;
