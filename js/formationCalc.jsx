(app =>{
    app.WorldsWake = class WorldsWake extends React.Component{
        constructor(){
            super()
            this.state = this.getInitialState();
        }
        getInitialState(){
            var data = app.calculateMultipliers();
            return {formation:app.formation, dps:data.globalDps, dpsCruId:null, gold:null};
        }
        calculateMyMultipliers(stateMods){
                var data = app.calculateMultipliers();
                var stateMods = stateMods || {};
                stateMods.dps=data.globalDps;
                stateMods.gold=data.globalGold;
                console.log('stateMods', stateMods);
                return stateMods;
        }
        render(){
            var changeFormation = slotNumber => cruId => {
                var crusader = getCrusader(cruId);
                // if the crusader is already in a different slot, remove him from there, swap with the one that is there.
                app.formation.map((c,i) => {
                    if (c == crusader && i != slotNumber && (cruId != null && cruId != "0"))
                    {
                        if(app.formation[i])
                            app.formation[i].spot = null;
                        app.formation[i]= app.formation[slotNumber];
                        if(app.formation[i])
                            app.formation[i].spot = i;
                    }
                });
                if(app.formation[slotNumber] && app.formation[slotNumber].spot == slotNumber)
                    app.formation[slotNumber].spot = undefined;
                app.formation[slotNumber]=crusader;
                if(crusader != null)
                    crusader.spot = slotNumber;
                var stateMods = this.calculateMyMultipliers();
                stateMods[slotNumber] = cruId;
                this.setState(stateMods);
            };
            var makeHeroSelect = slotNumber => {
                var selectedCru = app.formation[slotNumber];
                var cruGearQ = selectedCru && app.crusaderGear[selectedCru.id];
                var availableCrusaders = jsonData.crusaders.filter(cru =>
                    // crusaders in slots that aren't in formation
                    formation.filter(f => f != null).find(f=> f.slot == cru.slot) == null
                    || selectedCru == cru

                );
                return (<div>{slotNumber}
                    <HeroSelect dontSort={true}
                                crusaders={availableCrusaders}
                                onHeroChange={ changeFormation(slotNumber)}
                                selectedHeroId={selectedCru && selectedCru.id}
                                />
                                {
                                    selectedCru!= null ?
                                        <GearBox cru={selectedCru} cruGearQ={cruGearQ} />
                                        : null
                                }
                </div>);
            };
            var dpsSelector = (
                <HeroSelect crusaders={jsonData.crusaders.filter(cru => formation.filter(f => f != null).findIndex( f => f.id == cru.id) >= 0)} onHeroChange={cruId => {
                    app.formationDps = getCrusader(cruId);
                    formation.filter(f => f != null).map(cru => cru.isDPS = false);
                    app.setDPS(null, cruId);
                    app.calculateMultipliers();
                    var stateMods = this.calculateMyMultipliers();
                    stateMods.dpsCruId=cruId;
                    this.setState(stateMods);
                    }
                } selectedHeroId={this.state.dpsCruId} />
            );
            var dpsCru = this.state.dpsCruId && jsonData.crusaders.find(cru => this.state.dpsCruId == cru.id);
            return (<div>
                <div>{dpsSelector}</div>
                <p>Dps Multiplier: {this.state.dps}{dpsCru && dpsCru.zapped === true ? " zapped" : null}</p>
                <p>Gold Multiplier: {this.state.gold}</p>
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
