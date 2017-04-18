(app =>{
    app.WorldsWake = class WorldsWake extends React.Component{
        constructor(){
            super()
            this.state = this.getInitialState();
        } 
        getInitialState(){
            var data = app.calculate();
            return {formation:app.formation, dps:data.globalDps};
        }
        render(){
            var changeFormation = slotNumber => cruId => {
                app.formation[slotNumber]=getCrusader(cruId);
                var data = app.calculate();
                var stateMods = {slotNumber:cruId,dps:data.globalDps};
                console.log('stateMods', stateMods);
                this.setState(stateMods);
            };
            var makeHeroSelect = slotNumber => (
                <div>
                    <HeroSelect dontSort={true} 
                                crusaders={jsonData.crusaders} 
                                onHeroChange={ changeFormation(slotNumber)} 
                                selectedHeroId={app.formation[slotNumber] && app.formation[slotNumber].id} 
                                />{slotNumber}
                </div>
            );
            return (<div>
                <p>Dps:{this.state.dps}</p>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td title="slot0">{makeHeroSelect(0)}</td>
                        </tr>
                        <tr title="row1">
                        <td/><td title="slot4">{makeHeroSelect(4)}</td>
                        </tr>
                        <tr title="row2">
                            <td  title="slot1"> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}onHeroChange={ e=> app.formation[1]=getCrusader(e)} />1</td> 
                            <td /><td title="slot7"><HeroSelect dontSort={true} crusaders={jsonData.crusaders} onHeroChange={ e=> app.formation[7]=getCrusader(e)} />7</td> 
                        </tr>
                        <tr title="row3">
                            <td /><td title="slots5"><HeroSelect dontSort={true} crusaders={jsonData.crusaders} onHeroChange={ e=> app.formation[5]=getCrusader(e)} />5</td>
                            <td /><td title="slot9"><HeroSelect dontSort={true} crusaders={jsonData.crusaders} onHeroChange={ e=> app.formation[9]=getCrusader(e)} />9</td>

                        </tr>
                        <tr title="row4">
                            <td title="slot2"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}onHeroChange={ e=> app.formation[2]=getCrusader(e)} />2</td> 
                            <td />
                            <td title="slot8"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}onHeroChange={ e=> app.formation[8]=getCrusader(e)} />8</td> 
                        </tr>
                        <tr title="row5">
                            <td /><td title="slot6"><HeroSelect dontSort={true} crusaders={jsonData.crusaders}onHeroChange={ e=> app.formation[6]=getCrusader(e)} />6</td>
                        </tr>
                        <tr title="row6">
                            <td title="slot3"><HeroSelect dontSort={true} crusaders={jsonData.crusaders} onHeroChange={ e=> app.formation[3]=getCrusader(e)} />3</td> 
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
