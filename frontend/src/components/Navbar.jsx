import { Link } from "react-router-dom";

function Navbar() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (

    <div className="bg-black text-white p-3 flex justify-between">

      <Link to="/matches">Virtual EPL</Link>

      <div className="flex gap-4">

        <Link to="/table">Table</Link>

        <Link to="/leaderboard">Leaderboard</Link>

        <Link to="/profile">Profile</Link>

        {!user && <Link to="/login">Login</Link>}

      </div>

    </div>

  );

}

export default Navbar;
