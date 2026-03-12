import { useEffect, useState } from "react";
import API from "../api/axios";

function Profile() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    API.get("/auth/profile").then(res => {
      setUser(res.data);
    });

  }, []);

  if (!user) return <p>Loading...</p>;

  return (

    <div className="p-4">

      <h1>{user.username}</h1>

      <p>Balance: ${user.balance}</p>

      <p>Wins: {user.wins}</p>

      <p>Losses: {user.losses}</p>

    </div>

  );

}

export default Profile;
