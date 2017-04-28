(app =>{
    var makeFormationDiag = (formation) =>{
            var formationDiag = {};
            formation.map((cruId,i) =>{
                formationDiag[i] = {spot: i, id: cruId, mathCalcId: app.formationIds[i], columnNum: currentWorld.columnNum(i)};
            });
            return formationDiag;
    };
    var FormationDiag = (props) => (
        <pre>{JSON.stringify(makeFormationDiag(props.formation), null, ' ')}</pre>
    );

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
            var myMakeHeroSelect = slot => makeHeroSelect(this.props.formation, slot, this.props.onFormationChange)
            var formationDiag = {};
            this.props.formation.map((cruId,i) =>{
                formationDiag[i] = {spot: i, id: cruId, mathCalcId: app.formationIds[i]};
            })

            return (<div>
                <div>Main dps: {dpsSelector(this.props.formation, this.props.onDpsChange, this.props.dpsCruId)}</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td title="slot0">{myMakeHeroSelect(0)}</td>
                        </tr>
                        <tr title="row1">
                        <td/><td title="slot4">{myMakeHeroSelect(4)}</td>
                        </tr>
                        <tr title="row2">
                            <td  title="slot1"> {myMakeHeroSelect(1)}</td>
                            <td /><td title="slot7">{myMakeHeroSelect(7)}</td>
                        </tr>
                        <tr title="row3">
                            <td /><td title="slots5">{myMakeHeroSelect(5)}</td>
                            <td /><td title="slot9">{myMakeHeroSelect(9)}</td>

                        </tr>
                        <tr title="row4">
                            <td title="slot2">{myMakeHeroSelect(2)}</td>
                            <td />
                            <td title="slot8">{myMakeHeroSelect(8)}</td>
                        </tr>
                        <tr title="row5">
                            <td /><td title="slot6">{myMakeHeroSelect(6)}</td>
                        </tr>
                        <tr title="row6">
                            <td title="slot3">{myMakeHeroSelect(3)}</td>
                        </tr>
                </tbody>
                </table>
                <FormationDiag formation={this.props.formation} />
            </div>);
        }
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
            var myMakeHeroSelect = slot => makeHeroSelect(this.props.formation, slot, this.props.onFormationChange)

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
                            <td title="slot3">{myMakeHeroSelect(3)}</td>
                            <td/>
                            <td/>
                        </tr>
                        <tr title="row1">
                        <td/><td title="slot1">{myMakeHeroSelect(1)}</td>
                        <td/>
                        <td title="slot6">{myMakeHeroSelect(6)}</td>
                        <td />
                        </tr>
                        <tr title="row2">
                            <td title="slot0"> {myMakeHeroSelect(0)}</td>
                            <td />
                            <td title="slot4">{myMakeHeroSelect(4)}</td>
                            <td />
                            <td title="slot8">{myMakeHeroSelect(8)}</td>
                        </tr>
                        <tr title="row3">
                            <td />
                            <td title="slot2">{myMakeHeroSelect(2)}</td>
                            <td />
                            <td title="slot7">{myMakeHeroSelect(7)}</td>
                            <td />
                        </tr>
                        <tr title="row4">
                            <td />
                            <td />
                            <td title="slot5">{myMakeHeroSelect(5)}</td>
                            <td />
                            <td />
                        </tr>
                </tbody>
                </table>
                <FormationDiag formation={this.props.formation} />
                </div>);
        }
    };


    app.Ghostbeard = class Ghostbeard extends React.Component{
        constructor(props){
            super(props);
            if(Array.isArray(props.formation)){
                props.formation.map((cruId,i) =>{
                    // if there is no cruId in this formation spot, or we are past the number of formation spots in this world
                    if(!(cruId != null) || i >= ghostbeard.spots)
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
            var myMakeHeroSelect = slot => makeHeroSelect(this.props.formation, slot, this.props.onFormationChange)

            // 0 X 5 X A | 0
            // X 3 X 8 X | 1
            // 1 X 6 X B | 2
            // X 4 X 9 X | 3
            // 2 X 7 X C | 4
            return (<div>
                <div>Main dps: {dpsSelector(this.props.formation, this.props.onDpsChange, this.props.dpsCruId)}</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0">
                            <td title="slot0">{myMakeHeroSelect(0)}</td>
                            <td />
                            <td title="slot5">{myMakeHeroSelect(5)}</td>
                            <td/>
                            <td title="slot10">{myMakeHeroSelect(10)}</td>
                        </tr>
                        <tr title="row1">
                            <td/>
                            <td title="slot3">{myMakeHeroSelect(3)}</td>
                            <td/>
                            <td title="slot4">{myMakeHeroSelect(4)}</td>
                            <td />
                        </tr>
                        <tr title="row2">
                            <td title="slot1"> {myMakeHeroSelect(1)}</td>
                            <td />
                            <td title="slot6">{myMakeHeroSelect(6)}</td>
                            <td />
                            <td title="slot11">{myMakeHeroSelect(11)}</td>
                        </tr>
                        <tr title="row3">
                            <td />
                            <td title="slot4">{myMakeHeroSelect(4)}</td>
                            <td />
                            <td title="slot9">{myMakeHeroSelect(9)}</td>
                            <td />
                        </tr>
                        <tr title="row4">
                            <td title="slot2">{myMakeHeroSelect(2)}</td>
                            <td />
                            <td title="slot7">{myMakeHeroSelect(7)}</td>
                            <td />
                            <td title="slot12">{myMakeHeroSelect(12)}</td>
                        </tr>
                </tbody>
                </table>
                <FormationDiag formation={this.props.formation} />
                </div>);
        }
    };



    class FormationCalc extends React.Component{
        constructor(){
            super();
            this.getInitialState = this.getInitialState.bind(this);
            this.initializeFormationIds = this.initializeFormationIds.bind(this);
            this.onFormationChange = this.onFormationChange.bind(this);
            this.onDpsChange = this.onDpsChange.bind(this);
            this.storageKey="formationCalc";
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.state = this.getInitialState();
        }
        initializeFormationsForWorld(initial, spots){
            var currentWorld = getWorldById(initial.selectedWorldId);
            if(!(initial.formations[initial.selectedWorldId] != null))
            {
                initial.formations[currentWorld.id] = [];
                for(var i=0;i<currentWorld.spots;i++) {
                    initial.formations[currentWorld.id].push(null);
                }
            }
            // migrate initial.formation to new initial.formations
            if(initial.formation != null && initial.formation.find(f => f != null && f !== 0 && f != "0")){
                initial.formation.map((f,i) =>{

                    if(i < currentWorld.spots)
                        initial.formations[initial.selectedWorldId][i] = f;
                });
                initial.formation = undefined;
            }
        }
        migrateLegacyData(initial){
            if(!(initial.selectedWorldId != null))
                return;
            // migrate old property selectedWorld and delete it
            if(initial.selectedworld != null){
                if(typeof(initial.selectedWorld) == "number" || !isNaN(+initial.selectedWorld))
                    initial.selectedWorldId = +initial.selectedWorld;
                initial.selectedWorld = undefined;
            }
            // migrate old property dpsCruId and delete it
            if(initial.dpsCruId != null){
                initial.dpsCruIds[initial.selectedWorldId] = initial.dpsCruId;
                initial.dpsCruId = undefined;
            }
        }
        getInitialState(){
            var initial = readIt(this.storageKey, {});
            this.migrateLegacyData(initial);

            if(!(initial.selectedWorldId != null) || typeof(initial.selectedWorldId) == "string")
                initial.selectedWorldId = 1;
            if(!(initial.formations != null))
                initial.formations = {};
            if(!(initial.dpsCruIds != null))
                initial.dpsCruIds = {};
            app.currentWorld = getWorldById(initial.selectedWorldId);
            this.initializeFormationsForWorld(initial,app.currentWorld.spots);
            // copy state out to global shared for calc
            // does this work, or has the calc already closed over the actual array it will use?
            app.formationIds = initial.formations[initial.selectedWorldId];
            console.log('getInitialState', app.formationIds, initial.formations[initial.selectedWorldId]);
            if(initial.dpsCruIds[initial.selectedWorldId]){
                app.setDPS(initial.dpsCruIds[initial.selectedWorldId]);
            }
            app.formationCalcInitial = initial;
            return initial;
        }
        initializeFormationIds(worldSpots){
            if(Array.isArray(app.formationIds) && app.formationIds.length == worldSpots){
                return false;
            }
            app.formationIds = [];
            for(var i=0; i < worldSpots; i++)
                app.formationIds[i] = null;
            return true;
        }
        onFormationChange(slot,cruId){
            this.initializeFormationIds(app.currentWorld.spots);
            var stateMods = {};
            stateMods.formations = (copyObject(this.state.formations) || {});
            if(!(stateMods.formations[currentWorld.id] != null))
                stateMods.formations[currentWorld.id] = app.formationIds.slice(0);
            else this.state.formations[currentWorld.id].slice(0);

            stateMods.formations[currentWorld.id][slot] = cruId;
            this.setState(stateMods);
        }
        onDpsChange(cruId){
            var dpsCruIds = copyObject(this.state.dpsCruIds) || {};
            // normalize the cruId data
            cruId = !(cruId != null) || cruId == 0? undefined : cruId;
            dpsCruIds[this.state.selectedWorldId] = cruId;
            var stateMods = {dpsCruIds:dpsCruIds};
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
                descent,
                ghostbeard
            ];
            var data = app.calculateMultipliers();
            window.multiplierData = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCruId = this.state.dpsCruIds[this.state.selectedWorldId];
            var dpsCru = dpsCruId && jsonData.crusaders.find(cru => dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(data.globalGold) == "number")? (data.globalGold + "") : "";
            if(playerGold && typeof(+playerGold) == "number" && +playerGold > 0)
                goldText = goldText + " * " + playerGold + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));

            var formation = null;
            switch(this.state.selectedWorldId){
                case worldsWake.id:
                    formation = (<WorldsWake formation={this.state.formations[worldsWake.id] || app.formationIds} dpsCruId={dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
                break;
                case descent.id:
                    formation = (<Descent formation={this.state.formations[descent.id] || app.formationIds} dpsCruId={dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
                break;
                case ghostbeard.id:
                    formation = (<Ghostbeard formation={this.state.formations[ghostbeard.id] || app.formationIds} dpsCruId={dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
                break;
            }
            return (<div>
                <select
                    value={this.state.selectedWorldId}
                    onChange={e => {
                        console.log('changing world');
                        var worldId = +e.target.value;
                        if(isNaN(worldId))
                            worldId = 1;
                        app.currentWorld = app.getWorldById(worldId);
                        var stateMods = {selectedWorldId: worldId};
                        if(this.initializeFormationIds(app.currentWorld.spots))
                            stateMods.formation = app.formationIds;
                        this.setState(stateMods);
                        console.log(app.currentWorld.name, app.currentWorld.spots, app.formationIds, this.state.formations[currentWorld.id]);
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
    app.FormationCalc = FormationCalc;
})(typeof global !== 'undefined' ? global : window);
