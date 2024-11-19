import React from 'react';

import blueTick from '../../../assets/images/Icon_Blue_tick.svg';


const Timeline = (props) => {

  let {data} = props;
  
  if(!data){
    return null;
  }

  const TimelineItem = (({item, isLast}) => {

    const renderDataLines = (dataLines) => {

      return dataLines.map( (line, index) => {
        return <p key={`dl-${index}`} className='data'>{line}</p>
      })
    }

    return (
      <div className='timeline-item'>
        <div className='timeline'>
          {
            item.isTick
            ? <img src={blueTick} alt='icon' className='tick-icon'/>
            : <div className='point' style={item.isRed ? { background: 'red'} : {}}></div>
          }
          { !isLast &&
            <div className='line'></div>
          }
        </div>
        <div className='timeline-content'>
          <p className='head'>{item.title}</p>
          {renderDataLines(item.dataLines)}
        </div>
      </div>
    )
  });

  const render_timeline_list = (data) => {
    return data.map( (item, index) => {
      let isEndItem = index === (data.length - 1);
      return <TimelineItem key={`timeline-item-${index}`} item={item} isLast={isEndItem}/>
    })
  }

  return(
    <div className='timeline-container'>
      {render_timeline_list(data)}
    </div>
  )
}


export default Timeline;
