import { useEffect, useState } from "react";

function VirtualMatchViewer({ match }) {

const [minute,setMinute] = useState(0);
const [homeScore,setHomeScore] = useState(0);
const [awayScore,setAwayScore] = useState(0);

useEffect(()=>{

let timer;

if(match.status === "live"){

timer = setInterval(()=>{

setMinute(prev=>{

if(prev >= 90){

clearInterval(timer);
return 90;

}

return prev + 1;

})

},1000)

}

if(match.status === "finished"){

setHomeScore(match.homeScore);
setAwayScore(match.awayScore);
setMinute(90);

}

return ()=>clearInterval(timer);

},[match]);


return (

<div className="bg-[#020617] rounded-lg p-3 text-center">

<div className="text-sm text-gray-400 mb-2">
Minute {minute}'
</div>

<div className="text-2xl font-bold text-green-400">

{match.status === "finished"
? `${match.homeScore} - ${match.awayScore}`
: `${homeScore} - ${awayScore}`}

</div>

<div className="text-xs text-gray-500 mt-1">

{match.status === "betting" && "Betting Open"}
{match.status === "live" && "Match Live"}
{match.status === "finished" && "Full Time"}

</div>

</div>

)

}

export default VirtualMatchViewer
