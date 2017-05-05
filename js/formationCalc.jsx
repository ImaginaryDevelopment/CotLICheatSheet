/// <reference path="mathCalc.js" />
(app =>{
    var getCrusader = app.mathCalc.getCrusader;

    var getFormationDiags = (worldId,formation) =>
            formation
                .map((cruId,i) =>
                    ({spot: i, id: cruId,  columnNum: app.mathCalc.getWorldById(worldId).columnNum(i)}))
                .filter(data => data.id != null)
                .map(data =>{
                    var crusader = getCrusader(data.id);
                    if(crusader != null)
                        data.name=crusader.displayName;
                    if(app.formationIds[data.spot] != data.id){
                        console.warn('mathCalcId doesn\'t match state', app.formationIds[data.spot], data.id, data.spot, formation);
                        app.data = data;
                        app.formation = formation;
                        throw Error("uhhh whut?");
                        data.mathCalcId = app.formationIds[data.spot];
                    }
                    if(crusader && crusader.globalDps && crusader.globalDps != 1){
                        if(!isNaN(+crusader.globalDps) && typeof(crusader.globalDps) == "number")
                            data.dpsX = crusader.globalDps.toFixed(0);
                        else
                            data.dpsX = crusader.globalDps;
                    }
                    if(crusader && crusader.globalGold && crusader.globalGold != 1){
                        if(!isNaN(+crusader.globalGold) && typeof(crusader.globalGold) == "number")
                            data.goldX = crusader.globalGold.toFixed(0);
                        else
                            data.goldX = crusader.globalGold;
                    }
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
                onFormationChange(slotNumber,cruId);
                if(crusader != null)
                    crusader.spot = slotNumber;
            };

    var makeWorldRenderer = (props,worldId, slotLayout) =>{
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
                        <div>
                            <TextInputUnc placeHolder="mySaved1" value={props.nextSaveName} onChange={props.onSaveNameChange} disabled={props.enableSave !== true} />
                            <button type="button" disabled={props.enableSave === false} onClick={props.onSaveFormationClick} >Save Formation</button>
                            <select value={props.selectedSave}
                                    onChange={e => props.selectedSaveChange(e.target.value)}>
                                <option key="_">None</option>
                                {
                                    (inspect(props.saveNames,"savenames")).map(sn =>
                                        (<option key={sn} value={sn}>{sn}</option>)
                                    )
                                }
                            </select>
                            <button type="button" disabled={!(props.selectedSave != null) || props.selectedSave =="_"} onClick={props.onLoadFormationClick}>Load</button>
                            <button type="button" onClick={props.onClearClick}>Clear formation</button>

                        </div>
                        <div className="adaptChildren">
                            { getFormationDiags(worldId, props.formation) }
                        </div>
                    </div>);
        };
    makeWorldRenderer.displayName = 'makeWorldRenderer';

    // there's no state in here, why not make it a simple function?
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
            return makeWorldRenderer(this.props, this.props.worldId, this.props.slotLayout);
        }
    };

    var calculateTagTracker = (missionTags,formation) =>{
        if(!(formation != null))
            return null;
        console.log('calculateTagTracker',formation);
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
            this.getFormationIds = this.getFormationIds.bind(this);
            this.onFormationChange = this.onFormationChange.bind(this);
            this.onDpsChange = this.onDpsChange.bind(this);
            this.storageKey="formationCalc";
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.state = this.getInitialState();
        }
        // includes a migration
        initializeFormationsForWorld(initial, spots){
            // don't bother calling getFormationIds, in this case we don't need the current formationIds
            if(!(initial.formations[initial.selectedWorldId] != null))
            {
                initial.formations[initial.selectedWorldId] = [];
                for(var i=0;i<spots;i++) {
                    initial.formations[initial.selectedWorldId].push(null);
                }
            }
            // migrate initial.formation to new initial.formations
            if(initial.formation != null && initial.formation.find(f => f != null && f !== 0 && f != "0")){
                initial.formation.map((f,i) =>{

                    if(i < spots)
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

            var world = app.mathCalc.getWorldById(initial.selectedWorldId);
            this.initializeFormationsForWorld(initial,world.spots);
            // copy state out to global shared for calc
            // does this work, or has the calc already closed over the actual array it will use?
            console.warn('changing app.formationIds', initial.formations[initial.selectedWorldId]);
            app.formationIds = initial.formations[initial.selectedWorldId];
            console.log('getInitialState', app.formationIds, initial.formations[initial.selectedWorldId]);
            if(initial.dpsCruIds[initial.selectedWorldId]){
                app.mathCalc.setDPS(initial.dpsCruIds[initial.selectedWorldId]);
            }
            app.mathCalc.setWorldById(initial.selectedWorldId, initial.formations[initial.selectedWorldId]);
            app.formationCalcInitial = initial;
            return initial;
        }
        /**
         * get the saved formationIds from formations[world.id] or a new one (if there wasn't one or it was the wrong size)
         *
         * @param {Array<string>|undefined} savedFormationIds
         * @param {number} worldSpots
         * @returns {Array<string>} an array of the proper size to hold this world's formations
         *
         * @memberOf FormationCalc
         */
        getFormationIds(savedFormationIds, worldSpots){
            if(!(worldSpots != null)){
                console.error('no worldspot count passed', worldSpots,savedFormationIds);
            }
            var formationIds;
            if(savedFormationIds != null && Array.isArray(savedFormationIds) && savedFormationIds.length == worldSpots){
                // return {hadExisting: true, formationIds:savedFormationIds};
                formationIds = savedFormationIds.slice(0);
                return formationIds;
            }
            formationIds = [];
            for(var i=0; i < worldSpots; i++)
                formationIds[i] = null;
            // return {hadExisting:false, formationIds:formationIds};
            return formationIds;
        }
        onFormationChange(slot,cruId){
            var worldId = this.state.selectedWorldId;
            var stateMods = {
                // prepare the mod with a copy of the current formations object/array
                formations:(copyObject(this.state.formations) || {})};
            if(!(worldId != null) || worldId < 1){
                console.error("bad selectedWorldId", worldId);
                return;
            }
            var world = app.mathCalc.getWorldById(worldId);
            if(!(world != null)){
                console.error("no world returned for id ", worldId);
                return;
            }
            stateMods.formations[worldId] =
                // we use a copy so we aren't directly editing a reference to the old one, in case the copy was shallow, we don't want to mutate
                // returns an array of the right size, using previous worldId =()
                this.getFormationIds(this.state.formations && this.state.formations[worldId],world.spots);
            stateMods.formations[worldId][slot] = cruId;
            app.formationIds[slot] = stateMods.formations[worldId][slot];
            stateMods.enableSave = true;
            this.setState(stateMods);
        }
        saveFormation(saveName, formationIds, dpsChar){
            // save a 'worldSaves object with the different names keyed'
            var key = "worldSaves" + this.state.selectedWorldId;
            // copyObject will pass the default value through if the read returns nothing
            var oldWorldSaves = app.readIt(key, {});
            oldWorldSaves[saveName] = {formationIds:formationIds, dpsChar:dpsChar};
            console.log('saving:', oldWorldSaves[saveName], 'to', key,'.',saveName);
            app.storeIt(key, oldWorldSaves);
            this.setState({enableSave:false, saveNames:Object.keys(oldWorldSaves)});
        }
        loadFormation(saveName){
            var worldId = this.state.selectedWorldId;
            var key = "worldSaves" + worldId;
            var worldSaves = app.readIt(key);
            console.log('loading',worldSaves);
            var data = worldSaves[saveName];
            var formations = copyObject(this.state.formations) || {};
            formations[worldId] = data.formationIds;

            console.log('Loading formation for this world from/to', this.state.formations[worldId], formations[worldId]);
            this.setState({enableSave:false, formations: formations, dpsChar: data.dpsChar});
        }
        clearFormation(){
            var worldId = this.state.selectedWorldId;
            var formations = copyObject(this.state.formations) || {};
            formations[worldId] = this.state.formations[worldId].slice(0).map(_ => null);
            this.setState({enableSave:false, formations: formations, dpsChar: undefined});
        }
        onDpsChange(cruId){
            var dpsCruIds = copyObject(this.state.dpsCruIds) || {};
            // normalize the cruId data
            cruId = !(cruId != null) || cruId == 0? undefined : cruId;
            dpsCruIds[this.state.selectedWorldId] = cruId;
            app.mathCalc.calculateMultipliers(this.state.formations[this.state.selectedWorldId]);
            var stateMods = {dpsCruIds:dpsCruIds, enableSave:true};
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
                park,
                gardeners
            ];
            var world = app.mathCalc.getWorldById(this.state.selectedWorldId);
            var formationIds = this.getFormationIds(this.state.formations[this.state.selectedWorldId], world.spots);
            var data = app.mathCalc.calculateMultipliers(formationIds);
            window.multiplierData = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCruId = this.state.dpsCruIds[this.state.selectedWorldId];
            var dpsCru = dpsCruId && jsonData.crusaders.find(cru => dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(cruFormationGoldMult) == "number")? (cruFormationGoldMult.toFixed(2) + "") : "";
            if(playerGold && !isNaN(+playerGold) && typeof(+playerGold) == "number" && +playerGold > 0){
                goldText = goldText + " * " + (+playerGold).toFixed(2) + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));
            }

            var formationComponent = null;
            var formationIds = null;
            if(world!= null && world.layout != null){
                formationIds = this.state.formations[world.id] || app.formationIds;
                formationComponent =
                    (<WorldComponent
                            slotLayout={world.layout}
                            worldId={this.state.selectedWorldId}
                            formation={formationIds}
                            dpsCruId={dpsCruId}
                            onFormationChange={this.onFormationChange}
                            onDpsChange={this.onDpsChange}
                            onClearClick={this.clearFormation.bind(this)}
                            // for saving
                            nextSaveName={inspect(this.state.nextSaveName, "nextSaveName")}
                            enableSave={this.state.enableSave !== false}
                            onSaveFormationClick={() => this.saveFormation(this.state.nextSaveName, formationIds, dpsCruId)}
                            onSaveNameChange={d => this.setState({nextSaveName:d})}
                            // for loading
                            selectedSave={this.state.selectedSave}
                            selectedSaveChange={e => this.setState({selectedSave:e})}
                            saveNames={this.state.saveNames || []}
                            onLoadFormationClick={() => this.loadFormation(this.state.selectedSave)}
                            />);
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
            var kaine = getCrusader("06");
            var kaineSetter = x => {
                var value = !isNaN(+x)? +x : 0;
                kaine.XP = value;
                this.setState({kaineXP: value});
            };
            var kaineXpComponent =
                kaine && formationIds.includes(kaine.id)
                ? ( <div title="Kaine XP"><div>Kaine XP:</div><TextInputUnc onChange={kaineSetter} type="number" value={this.state.kaineXP} /></div>)
                : null;

            return (<div>
                <FormationTags missionTags={jsonData.missionTags} baseUrl={baseUrl} tagTracker={tagTracker}/>
                <div className="tags">
                    {TagCountsComponent(jsonData.missionTags.map(tag => tag.id), jsonData.crusaders.filter(cru => formationIds.includes(cru.id)))}
                </div>
                <div>
                {
                    // world selector
                }
                <select
                    value={this.state.selectedWorldId}
                    onChange={e => {
                        console.log('changing world');
                        var worldId = +e.target.value;
                        if(isNaN(worldId))
                            worldId = 1;
                        var world = app.mathCalc.getWorldById(worldId);
                        if(!world || !(world.spots != null)){
                            console.error("world not setup correctly", world);
                            return;
                        }
                        var formationIds = this.getFormationIds(this.state.formations[worldId], world.spots);
                        // ok to pass a direct reference to the arrya, the method called doesn't alter formationIds
                        app.mathCalc.setWorldById(worldId,formationIds);
                        var stateMods = {selectedWorldId: worldId};
                            stateMods.formation = app.formationIds;
                        this.setState(stateMods);
                    }} >
                    {
                        worlds.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))
                    }
                </select>
                </div>
                <div title="Your gold multiplier with no one in formation"><div>BaseGoldMult:</div><TextInputUnc onChange={g => this.setState({gold:g})} type="number" value={playerGold} /></div>
                {kaineXpComponent}
                <p>Dps Multiplier: {data && data.globalDps}{dpsCru && dpsCru.zapped === true ? " zapped" : null}</p>
                <p>Gold Multiplier: {goldText}</p>
                {formationComponent}
                </div>
                )
        }
    }
    app.FormationCalc = FormationCalc;
})(typeof global !== 'undefined' ? global : window);
