(app =>{

            var makeHeroSelect = (formation,slotNumber,onFormationChange) => {
                if(!(onFormationChange != null) || typeof(onFormationChange) != "function")
                    throw Error("onFormationChange is required");
                var selectedCruId = formation[slotNumber];
                var selectedCru = getCrusader(selectedCruId);

                var cruGearQ = selectedCru && app.crusaderGear && app.crusaderGear[selectedCru.id];
                var availableCrusaders = jsonData.crusaders.filter(cru =>
                    // crusaders in slots that aren't in formation
                    formation.filter(f => f != null && f != "0").find(f=> getCrusader(f).slot == cru.slot) == null
                    || (selectedCru && selectedCru.id == cru.id)
                );
                return (<div>{slotNumber}
                    <HeroSelect dontSort={true}
                                crusaders={availableCrusaders}
                                onHeroChange={ changeFormation(slotNumber, onFormationChange)}
                                selectedHeroId={selectedCru && selectedCru.id}
                                />
                                {
                                    selectedCru!= null ?
                                        <GearBox cru={selectedCru} cruGearQ={cruGearQ} />
                                        : null
                                }
                </div>);
            };
            var dpsSelector = (formation, onDpsChange, dpsCruId) => (
                <HeroSelect crusaders={jsonData.crusaders.filter(cru => formation.filter(f => f != null).findIndex( fId => fId == cru.id) >= 0)}
                    onHeroChange={cruId => {
                        if(cruId == "0")
                            cruId = null;
                            // app... settings are for the calc to pickup
                        app.formationDps = getCrusader(cruId);
                        formation.filter(f => f != null && f != "0").map(fCruId => getCrusader(fCruId).isDPS = false);
                        app.setDPS(cruId);
                        app.calculateMultipliers();
                        onDpsChange(cruId);
                    }
                } selectedHeroId={dpsCruId} />
            );
            // cruId may be "0" in the none case
            var changeFormation = (slotNumber,onFormationChange) => cruId => {
                if(!(onFormationChange != null) || typeof(onFormationChange) != "function")
                    throw Error("onFormationChange is required");
                if(cruId == "0")
                    cruId = null;
                var crusader = getCrusader(cruId);
                var slotCru = getCrusader(app.formationIds[slotNumber]);
                if(slotCru && slotCru.spot == slotNumber)
                    slotCru.spot = undefined;
                app.formationIds[slotNumber]=cruId;
                onFormationChange(slotNumber,cruId);
                if(crusader != null)
                    crusader.spot = slotNumber;
            };
    app.Descent = class Descent extends React.Component{
        constructor(props){
            super(props);
            if(Array.isArray(props.formation)){
                props.formation.map((cruId,i) =>{
                    // if there is no cruId in this formation spot, or we are past the number of formation spots in this world
                    if(!(cruId != null) || i >= descent.spots)
                        return cruId;
                    var crusader = getCrusader(cruId);
                    if(crusader != null)
                        crusader.spot = i;
                });
            }
        }
        render(){
            if(!(this.props.onFormationChange != null) || typeof(this.props.onFormationChange) != "function")
                throw Error("onFormationChange is required");
            var myMakeHeroSelect = slot => makeHeroSelect(this.props.formation, this.props.onFormationChange)
            // X X O X X 0
            // X O X O X 1
            // O X O X O 2
            // X O X O X 3
            // X X O X X 4


            // X X 3 X X | 0
            // X 1 X 6 X | 1
            // O X 4 X 8 | 2
            // X 2 X 7 X | 3
            // X X 5 X X | 4
            return (<div>
                <div>Main dps: {dpsSelector(this.props.formation, this.props.onDpsChange, this.props.dpsCruId)}</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td />
                            <td />
                            <td title="slot3">{makeHeroSelect(this.props.formation,3, this.props.onFormationChange)}</td>
                            <td/>
                            <td/>
                        </tr>
                        <tr title="row1">
                        <td/><td title="slot1">{makeHeroSelect(this.props.formation,1, this.props.onFormationChange)}</td>
                        <td/>
                        <td title="slot6">{makeHeroSelect(this.props.formation,6,this.props.onFormationChange)}</td>
                        <td />
                        </tr>
                        <tr title="row2">
                            <td title="slot0"> {makeHeroSelect(this.props.formation,0, this.props.onFormationChange)}</td>
                            <td />
                            <td title="slot4">{makeHeroSelect(this.props.formation,4, this.props.onFormationChange)}</td>
                            <td />
                            <td title="slot8">{makeHeroSelect(this.props.formation,8, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row3">
                            <td />
                            <td title="slot2">{makeHeroSelect(this.props.formation,2, this.props.onFormationChange)}</td>
                            <td />
                            <td title="slot7">{makeHeroSelect(this.props.formation,7, this.props.onFormationChange)}</td>
                            <td />
                        </tr>
                        <tr title="row4">
                            <td />
                            <td />
                            <td title="slot5">{makeHeroSelect(this.props.formation,5, this.props.onFormationChange)}</td>
                            <td />
                            <td />
                        </tr>
                </tbody>
                </table>
                <div>{JSON.stringify(this.props.formation)}</div>
                </div>);
        }
    }
    app.WorldsWake = class WorldsWake extends React.Component{
        constructor(props){
            if(!(props.onFormationChange != null) || typeof(props.onFormationChange) != "function")
                throw Error("onFormationChange is required");
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
            return (<div>
                <div>Main dps: {dpsSelector(this.props.formation, this.props.onDpsChange, this.props.dpsCruId)}</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td title="slot0">{makeHeroSelect(this.props.formation,0, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row1">
                        <td/><td title="slot4">{makeHeroSelect(this.props.formation,4, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row2">
                            <td  title="slot1"> {makeHeroSelect(this.props.formation,1, this.props.onFormationChange)}</td>
                            <td /><td title="slot7">{makeHeroSelect(this.props.formation,7, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row3">
                            <td /><td title="slots5">{makeHeroSelect(this.props.formation,5, this.props.onFormationChange)}</td>
                            <td /><td title="slot9">{makeHeroSelect(this.props.formation,9, this.props.onFormationChange)}</td>

                        </tr>
                        <tr title="row4">
                            <td title="slot2">{makeHeroSelect(this.props.formation,2, this.props.onFormationChange)}</td>
                            <td />
                            <td title="slot8">{makeHeroSelect(this.props.formation,8, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row5">
                            <td /><td title="slot6">{makeHeroSelect(this.props.formation,6, this.props.onFormationChange)}</td>
                        </tr>
                        <tr title="row6">
                            <td title="slot3">{makeHeroSelect(this.props.formation,3, this.props.onFormationChange)}</td>
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
        initializeFormationIds(worldSpots){
            if(Array.isArray(app.formationIds) && app.formationIds.length == worldSpots){
                return false;
            }
            app.formationIds = [];
            for(var i=0; i<worldSpots; i++)
                app.formationIds[i] = null;
            return true;
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
                worldsWake,
                descent
            ];
            var data = app.calculateMultipliers();
            window.multiplierData = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCru = this.state.dpsCruId && jsonData.crusaders.find(cru => this.state.dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(data.globalGold) == "number")? (data.globalGold + "") : "";
            if(playerGold && typeof(+playerGold) == "number" && +playerGold > 0)
                goldText = goldText + " * " + playerGold + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));

            var formation = null;
            if(this.state.selectedWorld == worldsWake.id)
                formation = (<WorldsWake formation={this.state.formation} dpsCruId={this.state.dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
            else if(this.state.selectedWorld == descent.id)
                formation = (<Descent formation={this.state.formation} dpsCruId={this.state.dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
            return (<div>
                <select 
                    value={this.state.selectedWorld} 
                    onChange={e => {
                        console.log('changing world');
                        var worldId = +e.target.value;
                        if(isNaN(worldId))
                            worldId = 1;
                        app.currentWorld = app.getWorldById(worldId);
                        var stateMods = {selectedWorld: worldId};
                        if(this.initializeFormationIds(app.currentWorld.spots))
                            stateMods.formation = app.formationIds;
                        this.setState(stateMods);
                        console.log(app.currentWorld.name, app.currentWorld.spots, app.formationIds, this.state.formation);
                    }} >
                    {
                        worlds.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))
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
