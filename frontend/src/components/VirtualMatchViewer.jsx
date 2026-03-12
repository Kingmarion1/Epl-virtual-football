import { useEffect, useState } from "react";

function VirtualMatchViewer({ match }) {

  const [minute, setMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {

      setMinute((m) => {

        if (m >= 90) {
          clearInterval(interval);
          return 90;
        }

        /* random goal simulation */

        if (Math.random() < 0.05) {

          if (Math.random() > 0.5) {
            setHomeScore((s) => s + 1);
          } else {
            setAwayScore((s) => s + 1);
          }

        }

        return m + 1;

      });

    }, 300);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="bg-black text-white p-6 rounded-xl text-center">

      <h2 className="text-xl mb-4">

        {match.homeTeam.name} vs {match.awayTeam.name}

      </h2>

      <div className="text-4xl font-bold mb-3">

        {homeScore} - {awayScore}

      </div>

      <div className="text-green-400">

        {minute}'

      </div>

    </div>

  );

}

export default VirtualMatchViewer;
