import { useState, useEffect } from 'react';
import teams from './json/teams.json';
import './App.css';

function App() {
  const [match, setMatch] = useState(0);
  const [team1, setTeam1] = useState('Yellow');
  const [team2, setTeam2] = useState('Red');
  const [stats1, setStats1] = useState([]);
  const [stats2, setStats2] = useState([]);
  const [tourny, setTourny] = useState([]);

  const [winMatrix, setWinMatrix] = useState(new Array(10).fill([]));
  const teamlist = Object.keys(teams['Teams']);

  const buildMatrix = () => {
    let result = [];
    for (let i = 0; i <= teamlist.length + 1; i++) {
      let temp = new Array(teamlist.length + 2).fill(0);
      result.push(temp);
      for (let j = 0; j <= teamlist.length; j++) {
        if (i === 0) {
          if (j === 0) {
            result[i][j] = "";
          } else {
            result[i][j] = teamlist[j - 1];
          }
        } else if (i === j) {
          result[i][j] = "-";
        } else if (j === 0) {
          result[i][j] = teamlist[i - 1]
        }
      }
    }
    setWinMatrix(result);
  }

  const updateMatrix = (obj1, obj2, name1, name2) => {
    let res = winMatrix;
    let index1 = 0, index2 = 0;
    name1 = name1 || team1;
    name2 = name2 || team2;
    for (let i = 0; i < teamlist.length; i++) {
      if (teamlist[i] === name1) index1 = i + 1;
      if (teamlist[i] === name2) index2 = i + 1;
    }
    if (obj1['Points'] > obj2['Points']) {
      res[index1][index2] += 1;
      res[index1][9] += 1;
      res[9][index2] += 1;
    } else if (obj1['Points'] < obj2['Points']) {
      res[index2][index1] += 1;
      res[index2][9] += 1;
      res[9][index1] += 1;
    } else {
      res[index1][index2] += 0.5;
      res[index2][index1] += 0.5;
      res[index1][9] += 0.5;
      res[index2][9] += 0.5;
      res[9][index1] += 0.5;
      res[9][index2] += 0.5;
    }

    setWinMatrix([...res]);
  }

  const setStats = (teamOne, teamTwo) => {
    let arrayOne = new Array(8).fill(0);
    let arrayTwo = new Array(8).fill(0);

    const getPoss = (handling, stealing) => {
      let ratio = handling / (1.25 * stealing);
      return Math.min(ratio, 1);
    }

    const getShots = (dunking, shooting, blocking) => {
      const m3 = Math.min((shooting / 100) * (shooting / (1.5 * blocking)), (shooting / 100));
      const a3 = 0.15 * (shooting / dunking) * m3;
      const mDunk = Math.min(dunking / (2 * blocking), 0.9);
      const aDunk = dunking / (2 * shooting) * mDunk;
      const aShot = 1 - aDunk;
      const mShot = Math.min((shooting / 100) * (shooting / blocking), (shooting / 100));

      return [a3, m3, aDunk, mDunk, aShot, mShot].map(element => {
        return Math.max(Math.min(element, 1), 0);
      });
    }

    const getRebound = (one, two) => {
      return Math.max(Math.min(one / (2 * two), 1), 0);
    }

    teamOne = teamOne || team1;
    teamTwo = teamTwo || team2;

    [arrayOne, arrayTwo].forEach((x, i) => {
      let t1, t2;
      if (i === 0) {
        t1 = teams['Teams'][teamOne]
        t2 = teams['Teams'][teamTwo]
      } else {
        t2 = teams['Teams'][teamOne]
        t1 = teams['Teams'][teamTwo]
      }
      x[0] = getPoss(t1['Handling'], t2['Stealing']);
      [x[1], x[2], x[3], x[4], x[5], x[6]] = getShots(t1['Dunking'], t1['Shooting'], t2['Blocking']);
      x[7] = getRebound(t1['Rebounding'], t2['Rebounding']);
    })

    setStats1(arrayOne);
    setStats2(arrayTwo);
    return [arrayOne, arrayTwo]
  }

  const roundRobin = (teams) => {
    const tournament = [];
    const half = Math.ceil(teams.length / 2);
    const groupA = teams.slice(0, half);
    const groupB = teams.slice(half, teams.length);

    const getRound = (groupA, groupB) => {
      const total = [];
      groupA.forEach((el, i) => {
        total.push([el, groupB[i]]);
      })
      return total;
    }

    tournament.push(getRound(groupA, groupB));

    for (let i = 1; i < teams.length - 1; i++) {
      groupA.splice(1, 0, groupB.shift());
      groupB.push(groupA.pop());
      tournament.push(getRound(groupA, groupB))
    }

    console.log(tournament)
    console.log("Number of Rounds:", tournament.length)
    setTourny(tournament);
    return tournament;
  }

  const playRound = () => {
    for (let i = 0; i < tourny.length; i++) {
      let round = tourny[i];
      for (let j = 0; j < round.length; j++) {
        let game = tourny[i][j];
        setTeam1(game[0]);
        setTeam2(game[1]);
        setMatch(match + 1);
        let [first, second] = setStats(game[0], game[1]);
        let name1 = game[0], name2 = game[1];
        getScore(first, second, name1, name2);
      }
    }
  }

  const getScore = (teamOne, teamTwo, name1, name2) => {
    console.log(teamOne, teamTwo);
    let sheet = {};

    const score3 = (chance, team, number) => {
      let random = Math.random();
      if (random <= chance) {
        sheet[team]['3M'] = (sheet[team]['3M'] || 0) + 1;
        sheet[team]['Points'] = (sheet[team]['Points'] || 0) + 3;
      } else {
        if (team === 0) {
          chance = stats1[7];
        } else {
          chance === stats2[7];
        }
        makeRebound(chance, team, number + 1);
      }
    }

    const scoreDunk = (chance, team, number) => {
      let random = Math.random();
      if (random <= chance) {
        sheet[team]['DM'] = (sheet[team]['DM'] || 0) + 1;
        sheet[team]['Points'] = (sheet[team]['Points'] || 0) + 2;
      } else {
        if (team === 0) {
          chance = stats1[7];
        } else {
          chance === stats2[7];
        }
        makeRebound(chance, team, number + 1);
      }
    }

    const scoreShot = (chance, team, number) => {
      let random = Math.random();
      if (random <= chance) {
        sheet[team]['SM'] = (sheet[team]['SM'] || 0) + 1;
        sheet[team]['Points'] = (sheet[team]['Points'] || 0) + 2;
      } else {
        if (team === 0) {
          chance = stats1[7];
        } else {
          chance === stats2[7];
        }
        makeRebound(chance, team, number + 1);
      }
    }

    const makeRebound = (chance, team, number) => {
      let random = Math.random();
      let stats;
      if (team === 0) {
        stats = stats1;
      } else {
        stats = stats2;
      }
      if (random <= chance) {
        sheet[team]['Rebounds'] = (sheet[team]['Rebounds'] || 0) + 1;
        if (number <= 3) {
          random = Math.random();
          if (random <= stats[1]) {
            sheet[team]['3A'] = (sheet[team]['3A'] || 0) + 1;
            score3(stats[2], team, number);
          } else if (random <= stats[3] * (1 - stats[1])) {
            sheet[team]['DA'] = (sheet[team]['DA'] || 0) + 1;
            scoreDunk(stats[4], team, 0);
          } else {
            sheet[team]['SA'] = (sheet[team]['SA'] || 0) + 1;
            scoreShot(stats[6], team, 0);
          }
        }
      }
    }

    teamOne = teamOne || stats1;
    teamTwo = teamTwo || stats2;
    name1 = name1 || team1;
    name2 = name2 || team2;

    [teamOne, teamTwo].forEach((x, index) => {
      sheet[index] = {};
      for (let i = 0; i < 100; i++) {
        let random = Math.random();
        if (random <= x[0]) {
          sheet[index]['Poss'] = (sheet[index]['Poss'] || 0) + 1;
          random = Math.random();

          if (random <= x[1]) {
            sheet[index]['3A'] = (sheet[index]['3A'] || 0) + 1;
            score3(x[2], index, 0);
          } else if (random <= x[3] * (1 - x[1])) {
            sheet[index]['DA'] = (sheet[index]['DA'] || 0) + 1;
            scoreDunk(x[4], index, 0);
          } else {
            sheet[index]['SA'] = (sheet[index]['SA'] || 0) + 1;
            scoreShot(x[6], index, 0);
          }
        }
      }
    });

    console.log(`${team1}: ${sheet[0]['Points']}`)
    console.log(`${team2}: ${sheet[1]['Points']}`)
    console.log(sheet[0], sheet[1]);
    updateMatrix(sheet[0], sheet[1], name1, name2);
  }

  useEffect(() => {
    buildMatrix();
  }, []);

  useEffect(() => {
    setStats();
  }, [team1, team2]);

  let tooltips = ['Possession', '3 Att', '3%', 'Dunk Att', 'Dunk%', 'Shot Att', 'Shot%', 'Reb%']
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
        <div>
          <div className='box'>
            <div>
              <h3>
                <select placeholder='team' defaultValue={'Yellow'} onChange={e => setTeam1(e.target.value)}>
                  {teamlist.map((el, i) => (
                    <option value={el} key={i}>{el}</option>
                  ))}
                </select>
              </h3>
              {Object.keys(teams['Teams'][team1]).map((el, i) => (
                <p key={i}>{`${el}: ${teams['Teams'][team1][el]}`}</p>
              ))}
              <p style={{ borderTop: '1px solid black', paddingTop: '0.5em' }}>{`Total: ${Object.values(teams['Teams'][team1]).reduce((a, b) => a + b)}`}</p>
            </div>

            <div>
              <h3>
                <select placeholder='team' defaultValue={'Red'} onChange={e => setTeam2(e.target.value)}>
                  {teamlist.map((el, i) => (
                    <option value={el} key={i}>{el}</option>
                  ))}
                </select>
              </h3>
              {Object.keys(teams['Teams'][team2]).map((el, i) => (
                <p key={i}>{`${el}: ${teams['Teams'][team2][el]}`}</p>
              ))}
              <p style={{ borderTop: '1px solid black', paddingTop: '0.5em' }}>{`Total: ${Object.values(teams['Teams'][team2]).reduce((a, b) => a + b)}`}</p>
            </div>
          </div>

          <div className='box'>
            <div>
              {stats1.map((el, i) => (
                <p style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} key={i}>
                  <span>{`${tooltips[i]}: `}</span>
                  <span>{`${Math.floor(el * 1000) / 10} %`}</span>
                </p>
              ))}
            </div>
            <div>
              {stats2.map((el, i) => (
                <p style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} key={i}>
                  <span>{`${tooltips[i]}: `}</span>
                  <span>{`${Math.floor(el * 1000) / 10} %`}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className='record'>
          {teamlist.map((el, i) => (
            <p key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{`${el}:`}</span>
              <span>{`${winMatrix[i + 1][9] || 0} - ${winMatrix[9][i + 1] || 0}`}</span>
            </p>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', width: '300px' }}>
        <button style={{ marginTop: '1em' }} onClick={() => getScore()}>Go!</button>
        <button style={{ marginTop: '1em' }} onClick={() => roundRobin(teamlist)}>Matches</button>
        <button style={{ marginTop: '1em' }} onClick={() => playRound()}>Round</button>
      </div>
      <div className='grid'>
        {winMatrix.map((el, i) => (
          i < 9
            ? <div className='row' key={i}>
              {el.map((x, idx) => (
                idx < 9
                  ? <p style={{ width: '100px' }} key={idx}>{x}</p>
                  : ""
              ))}
            </div>
            : ""
        ))}
      </div>
    </>
  )
}

export default App