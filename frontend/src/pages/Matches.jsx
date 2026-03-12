import { useEffect, useState } from "react";
import API from "../api/axios";

function Matches() {

  const [matches, setMatches] = useState([]);
  const [week, setWeek] = useState(1);
  const [countdown, setCountdown] = useState(60);
  const [phase, setPhase] = useState("betting");

  const user = JSON.parse(localStorage.getItem("user"));

  /* LOAD CURRENT MATCHES */
<div className="text-3xl text-green-400 font-bold mb-4">
Next Round In: {countdown}s
</div>
  const loadMatches = async () => {

    try {

      const res = await API.get("/matches/current");

      setMatches(res.data.matches);
      setWeek(res.data.week);
      setCountdown(res.data.countdown);
      setPhase(res.data.phase);

    } catch (err) {

      console.log("Error loading matches");

    }

  };

  useEffect(() => {

    loadMatches();

    const interval = setInterval(() => {

      loadMatches();

    }, 3000);

    return () => clearInterval(interval);

  }, []);

  /* PLACE BET */

  const placeBet = async (matchId, betType, prediction, odds) => {

    const stake = prompt("Enter stake");

    if (!stake) return;

    try {

      await API.post("/bets/place", {
        userId: user.id,
        matchId,
        betType,
        prediction,
        odds,
        stake: Number(stake)
      });
      const user = JSON.parse(localStorage.getItem("user"))

localStorage.setItem(
"user",
JSON.stringify({
...user,
balance: user.balance - stake
})
)

      alert("Bet placed");

    } catch (err) {

      alert("Bet failed");

    }

  };

  return (

    <div className="min-h-screen bg-[#0f172a] text-white p-4">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-black mb-4">
          EPL — WEEK: {week}
        </h1>

        <div className="mb-6 text-green-400 font-bold">
          Phase: {phase} | Time: {countdown}s
        </div>

        {matches.map(match => (

          <div
            key={match._id}
            className="bg-[#111827] p-4 mb-4 rounded-xl border border-gray-800"
          >

            {/* Teams */}

            <div className="flex justify-between mb-3">

              <span>{match.homeTeam.name}</span>

              <span className="text-gray-500">🆚</span>

              <span>{match.awayTeam.name}</span>

            </div>

            <Stadium>
             <VirtualMatchViewer match={match}/>
            </Stadium>

            </div>

            {/* Score if finished */}

            {match.status === "finished" && (

              <div className="text-center mb-3 text-green-400 font-bold">

                {match.homeScore} - {match.awayScore}

              </div>

            )}

            {/* 1X2 */}

            <div className="grid grid-cols-3 gap-2 mb-2">

              <button
                onClick={() =>
                  placeBet(match._id, "1X2", "home", match.homeOdds)
                }
                className="bg-blue-600 p-2 rounded"
              >
                1 ({match.homeOdds})
              </button>

              <button
                onClick={() =>
                  placeBet(match._id, "1X2", "draw", match.drawOdds)
                }
                className="bg-blue-600 p-2 rounded"
              >
                X ({match.drawOdds})
              </button>

              <button
                onClick={() =>
                  placeBet(match._id, "1X2", "away", match.awayOdds)
                }
                className="bg-blue-600 p-2 rounded"
              >
                2 ({match.awayOdds})
              </button>

            </div>

            {/* OVER 2.5 */}

            <div className="grid grid-cols-2 gap-2 mb-2">

              <button
                onClick={() =>
                  placeBet(match._id, "OVER_UNDER", "over2.5", match.over25)
                }
                className="bg-green-700 p-2 rounded"
              >
                Over 2.5 ({match.over25})
              </button>

              <button
                onClick={() =>
                  placeBet(match._id, "OVER_UNDER", "under2.5", match.under25)
                }
                className="bg-green-700 p-2 rounded"
              >
                Under 2.5 ({match.under25})
              </button>

            </div>

            {/* GG / NG */}

            <div className="grid grid-cols-2 gap-2">

              <button
                onClick={() =>
                  placeBet(match._id, "GG_NG", "gg", match.ggOdds)
                }
                className="bg-purple-700 p-2 rounded"
              >
                GG ({match.ggOdds})
              </button>

              <button
                onClick={() =>
                  placeBet(match._id, "GG_NG", "ng", match.ngOdds)
                }
                className="bg-purple-700 p-2 rounded"
              >
                NG ({match.ngOdds})
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Matches;
