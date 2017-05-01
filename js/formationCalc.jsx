/// <reference path="mathCalc.js" />
(app =>{
    var getCrusader = app.mathCalc.getCrusader;

    var getFormationDiags = formation =>
            formation
                .map((cruId,i) =>
                    ({spot: i, id: cruId,  columnNum: currentWorld.columnNum(i)}))
                .filter(data => data.id != null)
                .map(data =>{
                    var crusader = getCrusader(data.id);
                    if(app.formationIds[data.spot] != data.id){
                        console.warn('mathCalcId doesn\'t match state', app.formationIds[data.spot], data.id, data.spot, formation);

                        data.mathCalcId= app.formationIds[data.spot];
                    }
                    if(crusader && crusader.globalDps && crusader.globalDps != 1)
                        data.dpsX = crusader.globalDps;
                    if(crusader && crusader.globalGold && crusader.globalGold != 1)
                        data.goldX = crusader.globalGold;
                    console.log(crusader);
                    return data;
                })
                .map(fd => (<div key={fd.id}><pre>{JSON.stringify(fd, null, ' ')}</pre></div>) || null
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
                        app.mathCalc.setDPS(cruId);
                        app.mathCalc.calculateMultipliers();
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

    var makeWorldRenderer = (props,slotLayout) =>{
            if(!(props.onFormationChange != null) || typeof(props.onFormationChange) != "function")
                throw Error("onFormationChange is required");
            var myMakeHeroSelect = slot => makeHeroSelect(props.formation, slot, props.onFormationChange)
            var myMakeTdSlot = (slot,key) => (<td key={key} title={"slot" + slot}>{myMakeHeroSelect(slot)}</td>);
            var myMakeTrSlots = (row,slots) =>
                (<tr key={row} title={"row"+row}>
                    {
                        slots.map((slot,i) =>{
                            if(slot!=null){
                                return myMakeTdSlot(slot,i);
                            } else {
                                return (<td key={i}/>);
                            }
                        })
                    }
                </tr>);
            return (<div>
                        <div>Main dps: {dpsSelector(props.formation, props.onDpsChange, props.dpsCruId)}</div>
                        <table>
                            <thead></thead>
                            <tbody>
                                { slotLayout.map(
                                        (slots,row) =>
                                    (
                                        myMakeTrSlots(row, slots)
                                    )
                                )}
                        </tbody>
                        </table>
                        <div className="adaptChildren">
                            { getFormationDiags(props.formation) }
                        </div>
                    </div>);
        };
    makeWorldRenderer.displayName = 'makeWorldRenderer';

    class WorldComponent extends React.Component {

        constructor(props){
            super(props);
            if(Array.isArray(props.formation)){
                props.formation.map((cruId,i) =>{
                    // if there is no cruId in this formation spot, or we are past the number of formation spots in this world
                    if(!(cruId != null) || i >= props.spots)
                        return cruId;
                    var crusader = getCrusader(cruId);
                    if(crusader != null)
                        crusader.spot = i;
                });
            }
        }
        render(){
            var x = null;
            return makeWorldRenderer(this.props, this.props.slotLayout);
        }
    };

    var calculateTagTracker = (missionTags,formation) =>{
        if(!(formation != null))
            return null;
        var tagTracker = {};

        var tags = missionTags.map(mt =>{
            tagTracker[mt.id]=0;
            return mt.id;
        });

        formation
            .filter(cruId=> cruId != null && cruId != 0)
            .map(getCrusader)
            .filter(cru => cru != null && (cru.tags != null) && Array.isArray(cru.tags))
            .map(cru => {
                cru.tags.map(tag =>{
                    if(tagTracker[tag] != null)
                        tagTracker[tag]= tagTracker[tag] + 1;
                    else
                        console.warn('Tag on crusader, but not in mission tag list:' + tag);

                    // just in case there is a tag on a crusader that doesn't appear in the missionTags list
                });
            });
        return tagTracker;
    };

    var FormationTags = props => {
        // add counts for each of the crusaders in formation's tags
        var tagComponents = [];
        props.missionTags.map(tag => {

            var tagCssClass = props.tagTracker[tag.id] > 0 ? "img_tag":"img_tag_off";
            var title = tag.displayName;
            var imgTag = (<img key={tag.id} src={props.baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
            tagComponents.push(imgTag);
        });
        return (<div key="tags" className="tags" data-key="tags">{tagComponents}</div>);
    };
    FormationTags.displayName='FormationTags';

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
            var currentWorld = app.mathCalc.getWorldById(initial.selectedWorldId);
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
            app.currentWorld = app.mathCalc.getWorldById(initial.selectedWorldId);
            this.initializeFormationsForWorld(initial,app.currentWorld.spots);
            // copy state out to global shared for calc
            // does this work, or has the calc already closed over the actual array it will use?
            app.formationIds = initial.formations[initial.selectedWorldId];
            console.log('getInitialState', app.formationIds, initial.formations[initial.selectedWorldId]);
            if(initial.dpsCruIds[initial.selectedWorldId]){
                app.mathCalc.setDPS(initial.dpsCruIds[initial.selectedWorldId]);
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
                ghostbeard,
                grimm,
                mischief,
                player,
                itt,
                park
            ];
            var data = app.mathCalc.calculateMultipliers();
            window.multiplierData = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCruId = this.state.dpsCruIds[this.state.selectedWorldId];
            var dpsCru = dpsCruId && jsonData.crusaders.find(cru => dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(data.globalGold) == "number")? (data.globalGold + "") : "";
            if(playerGold && typeof(+playerGold) == "number" && +playerGold > 0)
                goldText = goldText + " * " + playerGold + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));

            var formationComponent = null;
            var formationIds = null;
            var world = app.mathCalc.getWorldById(this.state.selectedWorldId);
            if(world!= null && world.layout != null){
                formationIds = this.state.formations[world.id] || app.formationIds;
                formationComponent = (<WorldComponent slotLayout={world.layout} formation={formationIds} dpsCruId={dpsCruId} onFormationChange={this.onFormationChange} onDpsChange={this.onDpsChange} />);
            } else{
                switch(this.state.selectedWorldId){
                    default:
                    console.error("not implemented: formationCalc does not have worldId " + this.state.selectedWorldId + " component");
                    break;
                }
            }
            // not in the mood to change that the component is supplying the protocol, so that we can use file:// here to have the tags use file system when we are on the filesystem
            var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : getIsLocalFileSystem()?  '': '';
            var tagTracker = calculateTagTracker(jsonData.missionTags, formationIds);

            return (<div>
                <FormationTags missionTags={jsonData.missionTags} baseUrl={baseUrl} tagTracker={tagTracker}/>
                <div className="tags">
                    {TagCountsComponent(jsonData.missionTags.map(tag => tag.id), jsonData.crusaders.filter(cru => formationIds.includes(cru.id)))}
                </div>
                <div>
                <select
                    value={this.state.selectedWorldId}
                    onChange={e => {
                        console.log('changing world');
                        var worldId = +e.target.value;
                        if(isNaN(worldId))
                            worldId = 1;
                        app.currentWorld = app.mathCalc.getWorldById(worldId);
                        var stateMods = {selectedWorldId: worldId};
                        if(this.initializeFormationIds(app.currentWorld.spots))
                            stateMods.formation = app.formationIds;
                        this.setState(stateMods);
                    }} >
                    {
                        worlds.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))
                    }
                </select>
                </div>
                <div title="Your gold multiplier with no one in formation"><div>BaseGoldMult:</div><TextInputUnc onChange={g => this.setState({gold:g})} type="number" value={playerGold} /></div>
                <p>Dps Multiplier: {data && data.globalDps}{dpsCru && dpsCru.zapped === true ? " zapped" : null}</p>
                <p>Gold Multiplier: {goldText}</p>
                {formationComponent}
                </div>
                )
        }
    }
    app.FormationCalc = FormationCalc;
})(typeof global !== 'undefined' ? global : window);
