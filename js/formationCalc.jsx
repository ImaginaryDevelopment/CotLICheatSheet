(app =>{
    app.WorldsWake = class WorldsWake extends React.Component{
        constructor(){
            super()
            this.state = this.getInitialState();
        }
        getInitialState(){
            var data = app.calculate();
            return {formation:app.formation, dps:data.globalDps, dpsCruId:null};
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
            var dpsSelector = (
                <HeroSelect crusaders={jsonData.crusaders.filter(cru => formation.filter(f => f != null).findIndex( f => f.id == cru.id) >= 0)} onHeroChange={cruId => {
                    app.formationDps = getCrusader(cruId);
                    app.setDPS(null, cruId);
                    this.setState({dpsCruId:cruId});
                    app.calculate();
                    }
                } selectedHeroId={this.state.dpsCruId} />
            );
            return (<div>
                <div>{dpsSelector}</div>
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
                            <td  title="slot1"> {makeHeroSelect(1)}</td>
                            <td /><td title="slot7">{makeHeroSelect(7)}</td>
                        </tr>
                        <tr title="row3">
                            <td /><td title="slots5">{makeHeroSelect(5)}</td>
                            <td /><td title="slot9">{makeHeroSelect(9)}</td>

                        </tr>
                        <tr title="row4">
                            <td title="slot2">{makeHeroSelect(2)}</td>
                            <td />
                            <td title="slot8">{makeHeroSelect(8)}</td>
                        </tr>
                        <tr title="row5">
                            <td /><td title="slot6">{makeHeroSelect(6)}</td>
                        </tr>
                        <tr title="row6">
                            <td title="slot3">{makeHeroSelect(3)}</td>
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
