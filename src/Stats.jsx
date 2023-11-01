import React from 'react';
import teams from './json/teams.json';
import './Stats.css';

const Stats = () => {
    const headerRow = Object.keys(teams['Teams']['Yellow']);
    headerRow.unshift('');
    return (
        <>
            <div className='stat-container'>
                <div className='stat-box'>
                    <div><b>Stats</b></div>
                    <div className='stat-row'>
                        {headerRow.map((el, i) => (
                            <p key={i} style={{ width: '100px' }}>{el}</p>
                        ))}
                    </div>
                    {Object.keys(teams['Teams']).map((el, i) => (
                        <div className='stat-row' key={i}>
                            <span style={{ width: '100px' }}>{`${el}`}</span>
                            {Object.keys(teams['Teams'][el]).map((element, index) => (
                                <span style={{ width: '100px' }}>{teams['Teams'][el][element]}</span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ borderTop: '1px solid navy', width: '90%', marginTop: 'calc(1em + 28px)' }}></div>

        </>
    )
}

export default Stats;