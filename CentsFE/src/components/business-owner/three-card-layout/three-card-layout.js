import React from 'react';
import Card from '../../commons/card/card';

const ThreeCardLayout = (props) => {
    return(
        <div className="three-card-layout">
            <Card className="top-card">
                {props.topCardContent}
            </Card>
            <div className="second-row">
                <Card className="left-card">
                    {props.leftCardContent}
                </Card>
                <Card className="right-card">
                    {props.rightCardContent}
                </Card>
            </div>
        </div>
    )
}

export default ThreeCardLayout;