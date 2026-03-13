import { useEffect, useState } from "react";
import API from "../api/axios";
import Stadium from "../components/Stadium";
import VirtualMatchViewer from "../components/VirtualMatchViewer";

function Matches() {

const [matches,setMatches] = useState([]);
const [countdown,setCountdown] = useState(0);
const [phase,setPhase] = useState("betting");
const [stake,setStake] = useState(10);

const user = JSON.parse(localStorage.getItem("user"));

/* FETCH MATCHES */

useEffect(()=>{

const fetchMatches = async()=>{

try{

const res = await API.get("/matches/current");
setMatches(res.data.matches);
setPhase(res.data.phase);
setCountdown(res.data.countdown);

}catch(err){

console.log("error loading matches")

}

}

fetchMatches();

},[]);


/* COUNTDOWN TIMER */

useEffect(()=>{

const timer = setInterval(()=>{

setCountdown(prev=>{

if(prev<=1){

window.location.reload();
return 0;

}

return prev-1;

})

},1000)

return ()=>clearInterval(timer)

},[]);


/* PLACE BET */

const placeBet = async(matchId,prediction)=>{

try{

await API.post("/bets/place",{
matchId,
prediction,
stake
})

const user = JSON.parse(localStorage.getItem("user"));

localStorage.setItem(
"user",
JSON.stringify({
...user,
balance:user.balance - stake
})
);

alert("Bet placed successfully");

}catch(err){

alert("Bet failed")

}

};


/* UI */

return (

<div className="min-h-screen bg-[#020617] text-white p-4">

<div className="max-w-4xl mx-auto">


{/* COUNTDOWN */}

<div className="text-3xl text-green-400 font-bold mb-6 text-center">

Next Round In: {countdown}s

</div>



{/* MATCHES */}

<div className="space-y-6">

{matches.map((match)=>(

<div
key={match._id}
className="bg-[#0f172a] rounded-xl p-4 border border-[#1e293b]"
>


{/* TEAMS */}

<div className="flex justify-between text-lg font-semibold mb-3">

<span>{match.homeTeam.name}</span>

<span className="text-gray-400">vs</span>

<span>{match.awayTeam.name}</span>

</div>



{/* VIRTUAL STADIUM */}

<Stadium>

<VirtualMatchViewer match={match}/>

</Stadium>



{/* BETTING BUTTONS */}

<div className="grid grid-cols-3 gap-3 mt-4">

<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"home")}
className="bg-green-600 hover:bg-green-700 p-2 rounded font-bold disabled:opacity-40"
>

1 {match.homeOdds}

</button>


<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"draw")}
className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded font-bold disabled:opacity-40"
>

X {match.drawOdds}

</button>


<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"away")}
className="bg-blue-600 hover:bg-blue-700 p-2 rounded font-bold disabled:opacity-40"
>

2 {match.awayOdds}

</button>

</div>



{/* OVER / UNDER */}

<div className="grid grid-cols-4 gap-2 mt-3 text-sm">

<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"over2.5")}
className="bg-purple-700 p-2 rounded disabled:opacity-40"
>

OV 2.5

</button>


<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"under2.5")}
className="bg-gray-700 p-2 rounded disabled:opacity-40"
>

UN 2.5

</button>


<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"gg")}
className="bg-indigo-700 p-2 rounded disabled:opacity-40"
>

GG

</button>


<button
disabled={phase !== "betting"}
onClick={()=>placeBet(match._id,"gn")}
className="bg-red-700 p-2 rounded disabled:opacity-40"
>

GN

</button>

</div>


</div>

))}

</div>


</div>

</div>

)

}

export default Matches;
