import { Link } from "react-router-dom";

function Navbar(){

return(

<div className="bg-[#0f172a] text-white p-4 flex justify-between items-center border-b border-[#1e293b]">

<div className="font-bold text-green-400 text-lg">

🥅 Virtual⚽Football 🥅

</div>

<div className="flex gap-6 text-sm">

<Link to="/matches" className="hover:text-green-400">
Matches
</Link>

<Link to="/table" className="hover:text-green-400">
Table
</Link>

<Link to="/leaderboard" className="hover:text-green-400">
Leaderboard
</Link>

<Link to="/profile" className="hover:text-green-400">
Profile
</Link>

</div>

</div>

)

}

export default Navbar
