(app =>{
    app.WorldsWake = class WorldsWake extends React.Component{
        render(){
            return (<div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td title="slot0"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>0</td>
                        </tr>
                        <tr title="row1">
                            <td/><td title="slot4"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>4</td>
                        </tr>
                        <tr title="row2">
                            <td  title="slot1"> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>1</td> 
                            <td /><td title="slot7"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>7</td> 
                        </tr>
                        <tr title="row3">
                            <td /><td title="slots5"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>5</td>
                            <td /><td title="slot9"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>9</td>

                        </tr>
                        <tr title="row4">
                            <td title="slot2"> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>2</td> 
                            <td />
                            <td title="slot8"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>8</td> 
                        </tr>
                        <tr title="row5">
                            <td /><td title="slot6"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>6</td>
                        </tr>
                        <tr title="row6">
                            <td title="slot3"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>3</td> 
                        </tr>
                </tbody>
                </table>
            </div>);
        }
    };
    app.FormationCalc = class FormationCalc extends React.Component{
        constructor(){
            super();
            this.state = {selectedWorld:"World's Wake'"};
        }
        render(){
            var worlds = [
                worldsWake
            ];
            var formation;
            if(this.state.selectedWorld == "World's Wake");
            formation = <WorldsWake />;
            return (<div>
                <select>
                {
                    worlds.map(w => <option key={w.name} value={w.name}>{w.name}</option>)
                    });
                }
                </select>
                {formation}
                </div>
                )
        }
    }
})(window)
