(app =>{

    app.WorldsWake = class WorldsWake extends React.Component{
        constructor(props){
            super(props)
            if(Array.isArray(props.formation)){
                props.formation.map((cruId,i) =>{
                    // if there is no cruId in this formation spot, or we are past the number of formation spots in this world
                    if(!(cruId != null) || i >= worldsWake.spots)
                        return cruId;
                    var crusader = getCrusader(cruId);
                    if(crusader != null)
                        crusader.spot = i;
                });
            }
        }
        render(){
            // cruId may be "0" in the none case
            var changeFormation = slotNumber => cruId => {
                if(cruId == "0")
                    cruId = null;
                var crusader = getCrusader(cruId);
                var slotCru = getCrusader(app.formationIds[slotNumber]);
                if(slotCru && slotCru.spot == slotNumber)
                    slotCru.spot = undefined;
                app.formationIds[slotNumber]=cruId;
                this.props.onFormationChange(slotNumber,cruId);
                if(crusader != null)
                    crusader.spot = slotNumber;
            };
            var makeHeroSelect = slotNumber => {
                var selectedCruId = this.props.formation[slotNumber];
                var selectedCru = getCrusader(selectedCruId);

                var cruGearQ = selectedCru && app.crusaderGear && app.crusaderGear[selectedCru.id];
                var availableCrusaders = jsonData.crusaders.filter(cru =>
                    // crusaders in slots that aren't in formation
                    this.props.formation.filter(f => f != null && f != "0").find(f=> getCrusader(f).slot == cru.slot) == null
                    || (selectedCru && selectedCru.id == cru.id)
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
                <HeroSelect crusaders={jsonData.crusaders.filter(cru => this.props.formation.filter(f => f != null).findIndex( fId => fId == cru.id) >= 0)}
                    onHeroChange={cruId => {
                        if(cruId == "0")
                            cruId = null;
                            // app... settings are for the calc to pickup
                        app.formationDps = getCrusader(cruId);
                        this.props.formation.filter(f => f != null && f != "0").map(fCruId => getCrusader(fCruId).isDPS = false);
                        app.setDPS(cruId);
                        app.calculateMultipliers();
                        this.props.onDpsChange(cruId);
                    }
                } selectedHeroId={this.props.dpsCruId} />
            );
            return (<div>
                <div>Main dps: {dpsSelector}</div>
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
                <div>{JSON.stringify(this.props.formation)}</div>
            </div>);
        }
    };









    app.FormationCalc = class FormationCalc extends React.Component{
        constructor(){
            super();
            this.getInitialState = this.getInitialState.bind(this);
            this.onFormationChange = this.onFormationChange.bind(this);
            this.onDpsChange = this.onDpsChange.bind(this);
            this.storageKey="formationCalc";
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.state = this.getInitialState();
        }
        getInitialState(){
            var initial = readIt(this.storageKey, {});
            if(!(initial.selectedWorld != null))
                initial.selectedWorld = "World's Wake";
            if(!(initial.formation != null) || !Array.isArray(initial.formation))
            {
                initial.formation = [];
                for(var i=0;i<currentWorld.spots;i++) {
                    initial.formation.push(null);
                }
            }

            // copy state out to global shared for calc
            // does this work, or has the calc already closed over the actual array it will use?
            app.formationIds = initial.formation;
            if(initial.dpsCruId){
                app.setDPS(initial.dpsCruId);
            }
            return initial;
        }
        onFormationChange(slot,cruId){
            var stateMods = {};
            stateMods.formation = (this.state.formation || []).slice(0);
            stateMods.formation[slot] = cruId;
            this.setState(stateMods);
        }
        onDpsChange(cruId){
            var stateMods = {dpsCruId:!(cruId != null) || cruId == 0? undefined:cruId};
            this.setState(stateMods);
        }
        componentDidUpdate(prevProps, prevState){
            if(prevState!= this.state){
                storeIt(this.storageKey, this.state);
                window.formationCalcState = this.state;
            }
        }
        render(){
            var worlds = [
                worldsWake
            ];
            var data = app.calculateMultipliers();
            window.multiplierData = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCru = this.state.dpsCruId && jsonData.crusaders.find(cru => this.state.dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(data.globalGold) == "number")? (data.globalGold + "") : "";
            if(playerGold && typeof(+playerGold) == "number" && +playerGold > 0)
                goldText = goldText + " * " + playerGold + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));

            var formation;
            if(this.state.selectedWorld == "World's Wake");
                formation = <WorldsWake formation={this.state.formation} dpsCruId={this.state.dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />
            return (<div>
                <select>
                {
                    worlds.map(w => <option key={w.name} value={w.name}>{w.name}</option>)
                    });
                }
                </select>
                <div title="Your gold multiplier with no one in formation"><div>BaseGoldMult:</div><TextInputUnc onChange={g => this.setState({gold:g})} type="number" value={playerGold} /></div>
                <p>Dps Multiplier: {data && data.globalDps}{dpsCru && dpsCru.zapped === true ? " zapped" : null}</p>
                <p>Gold Multiplier: {goldText}</p>
                {formation}
                </div>
                )
        }
    }
})(typeof global !== 'undefined' ? global : window);
