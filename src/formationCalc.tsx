/// <reference path="mathCalc.ts" />
// eslint globals (:false for read-only, or in our case it appears to be implicit, config defined for all globals)
/* global React jsonData readIt inspect global TagCountsComponent copyObject getIsLocalFileSystem*/
(app =>{
    var getCrusader = app.mathCalc.getCrusader;

    var getFormationDiags = (worldId,formation) =>
            formation
                .map((cruId,i) =>{
                    var world = app.mathCalc.getWorldById(worldId);
                    if(world != null)
                        return ({spot: i, id: cruId,  columnNum: world.getColumnNum(i)});
                    else return {id:undefined};
                })
                .filter(data => data.id != null)
                .map(data =>{
                    var crusader = getCrusader(data.id);
                    if(crusader != null)
                        data.name=crusader.displayName;
                    if(app.formationIds[data.spot] != data.id){
                        console.warn('mathCalcId doesn\'t match state', app.formationIds[data.spot], data.id, data.spot, formation);
                        app.data = data;
                        app.formation = formation;
                        if(app.throw === true)
                            throw Error("uhhh whut?");
                        // data.mathCalcId = app.formationIds[data.spot];
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
        var availableCrusaders = app.jsonData.crusaders.filter(cru =>
            // crusaders in slots that aren't in formation
            formation.filter(f => f != null && f != "0").find(f => getCrusader(f).slot == cru.slot) == null
            || (selectedCru && (selectedCru.id == cru.id || /* account for allow all crusaders in the same bench slot to show */ selectedCru.slot == cru.slot))
        );
        return (<div>{slotNumber}
            <app.HeroSelect dontSort={true}
                        crusaders={availableCrusaders}
                        onHeroChange={ changeFormation(slotNumber, onFormationChange)}
                        selectedHeroId={selectedCru && selectedCru.id}
                        />
                        {
                            selectedCru!= null ?
                                <app.GearBox cru={selectedCru} cruGearQ={cruGearQ} />
                                : null
                        }
        </div>);
    };
            var dpsSelector = (formation, onDpsChange, dpsCruId) => (
                <app.HeroSelect crusaders={app.jsonData.crusaders.filter(cru => formation.filter(f => f != null).findIndex( fId => fId == cru.id) >= 0)}
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

    var makeWorldRenderer = (props:WorldComponentProps,worldId, slotLayout) =>{
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
                            <app.TextInputUnc placeHolder="mySaved1" value={props.nextSaveName} onChange={props.onSaveNameChange} disabled={props.enableSave !== true} />
                            <button type="button" disabled={props.enableSave === false} onClick={props.onSaveFormationClick} >Save Formation</button>
                            <select value={props.selectedSave}
                                    onChange={e => props.selectedSaveChange(e.target.value)}>
                                <option key="_">None</option>
                                {
                                    (app.inspect(props.saveNames,"saveNames")).map(sn =>
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
    makeWorldRenderer['displayName'] = 'makeWorldRenderer';

    interface WorldComponentProps{
        worldId:number
        slotLayout:(number|null)[][]
        formation?:any[]
        spots:number
        onDpsChange:any
        nextSaveName:string
        enableSave:boolean
        saveNames:any[]
        selectedSave:string
        selectedSaveChange(value:string):void
        dpsCruId: string | null

        onClearClick():void

        onLoadFormationClick:any
        onFormationChange:any
        onSaveNameChange:any
        onSaveFormationClick:any
    }
    // there's no state in here, why not make it a simple function?
    class WorldComponent extends React.Component<WorldComponentProps,{}>{

        constructor(props:WorldComponentProps){
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
            return makeWorldRenderer(this.props, this.props.worldId, this.props.slotLayout);
        }
    }

    var calculateTagTracker = (missionTags,formation) =>{
        if(!(formation != null))
            return null;
        console.log('calculateTagTracker',formation);
        var tagTracker = {};

        missionTags.map(mt =>{
            tagTracker[mt.id]=0;
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
    interface TagObj{
        id:any
        displayName:string
    }

    interface FormationTagsProps{
        missionTags: TagObj[]

    }
    var FormationTags = props => {
        // add counts for each of the crusaders in formation's tags
        var tagComponents :JSX.Element[] = [];
        props.missionTags.map(tag => {

            var tagCssClass = props.tagTracker[tag.id] > 0 ? "img_tag":"img_tag_off";
            var title = tag.displayName;
            var imgTag = (<img key={tag.id} src={props.baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
            tagComponents.push(imgTag);
        });
        return (<div key="tags" className="tags" data-key="tags">{tagComponents}</div>);
    };
    FormationTags['displayName']='FormationTags';

    interface FormationCalcState{
        selectedWorldId?:number
        formations:{[worldId:number]:(number|null)[]}
        enableSave:boolean
        kaineXP?:number
        saveNames:string[]
        dpsChar:string | undefined
        dpsCruIds:{[worldId:number]:string|null}
        disableLegendaries:boolean
        gold:number
        nextSaveName:string
        selectedSave:string
        formation
    }
    class FormationCalc extends React.Component<{},FormationCalcState>{
        storageKey:string;
        constructor(){
            super();
            this.getInitialState = this.getInitialState.bind(this);
            this.getFormationIds = this.getFormationIds.bind(this);
            this.onFormationChange = this.onFormationChange.bind(this);
            this.onDpsChange = this.onDpsChange.bind(this);
            this.getSaveNames = this.getSaveNames.bind(this);
            this.getWorldSaves = this.getWorldSaves.bind(this);
            this.storageKey="formationCalc";
            this.componentDidUpdate = this.componentDidUpdate.bind(this);
            this.state = this.getInitialState();
        }
        // includes a migration
        initializeFormationsForWorld(initial, spots){
            console.info('initializeFormationsForWorld');
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
            var initial = app.readIt(this.storageKey, {});
            this.migrateLegacyData(initial);
            var defaultWorldId = 1;

            if(!(initial.selectedWorldId != null) || typeof(initial.selectedWorldId) == "string")
                initial.selectedWorldId = defaultWorldId;
            if(!(initial.formations != null))
                initial.formations = {};
            if(!(initial.dpsCruIds != null))
                initial.dpsCruIds = {};

            var world = app.mathCalc.getWorldById(initial.selectedWorldId);
            if(!(world != null)){
                initial.selectedWorldId = defaultWorldId;
                world = app.mathCalc.getWorldById(initial.selectedWorldId);
                if(!(world != null))
                    throw Error("could not load a world");
            }
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
            if(initial.disableLegendaries === true){
                app.disableLegendaries = true;
            }
            initial.saveNames = app.Formation.getSaveNames(initial.selectedWorldId) || [];
            console.log('getInitialState', initial);
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
            var formations =
                // prepare the mod with a copy of the current formations object/array
                (app.copyObject(this.state.formations) || {});
            if(!(worldId != null) || worldId < 1){
                console.error("bad selectedWorldId", worldId);
                return;
            }
            var world = app.mathCalc.getWorldById(worldId);
            if(!(world != null)){
                console.error("no world returned for id ", worldId);
                return;
            }
            formations[worldId] =
                // we use a copy so we aren't directly editing a reference to the old one, in case the copy was shallow, we don't want to mutate
                // returns an array of the right size, using previous worldId =()
                this.getFormationIds(this.state.formations && this.state.formations[worldId],world.spots);
            formations[worldId][slot] = cruId;
            app.formationIds[slot] = formations[worldId][slot];
            var stateMods = {enableSave:true,formations:formations};
            this.setState(stateMods);
        }
        getWorldSaves(){
            var worldSaves = app.Formation.getWorldSaves(this.state.selectedWorldId);
            return worldSaves;
        }
        getSaveNames(){
            var saveNames = app.Formation.getSaveNames(this.state.selectedWorldId);
            console.log('getSaveNames', this.state.selectedWorldId, saveNames);
            return saveNames;
        }
        saveFormation(saveName, formationIds, dpsChar){
            app.Formation.saveFormation(this.state.selectedWorldId, saveName, formationIds, dpsChar, this.state.kaineXP);
            var saveNames = this.getSaveNames();
            this.setState({enableSave:false, saveNames:saveNames});
        }
        loadFormation(saveName){
            var worldId = this.state.selectedWorldId;
            if(worldId!=null){
                var data = app.Formation.getFormation(worldId, saveName);
                var formations = app.copyObject(this.state.formations) || {};
                formations[worldId] = data.formationIds;
                console.log('Loading formation for this world from/to', this.state.formations[worldId], formations[worldId]);
                this.setState({enableSave:false, formations: formations, dpsChar: data.dpsChar});
            }
        }
        clearFormation(){
            var worldId = this.state.selectedWorldId;
            var formations = app.copyObject(this.state.formations) || {};
            if(worldId != null)
                formations[worldId] = this.state.formations[worldId].slice(0).map(_ => null);
            this.setState({enableSave:false, formations: formations, dpsChar: undefined});
        }
        onDpsChange(cruId:string|number|null|undefined){
            var dpsCruIds = app.copyObject(this.state.dpsCruIds) || {};
            // normalize the cruId data
            cruId = !(cruId != null) || cruId == 0? undefined : cruId;
            if(this.state.selectedWorldId != null){
                dpsCruIds[this.state.selectedWorldId] = cruId;
                app.mathCalc.calculateMultipliers(this.state.formations[this.state.selectedWorldId]);
            }
            var stateMods = {dpsCruIds:dpsCruIds, enableSave:true};
            this.setState(stateMods);
        }
        componentDidUpdate(prevProps, prevState){
            if(prevState!= this.state){
                app.storeIt(this.storageKey, this.state);
                window['formationCalcState'] = this.state;
            }
        }
        render(){
            app.disableLegendaries = this.state.disableLegendaries === true;
            var worlds = [
                app.worldsWake,
                app.descent,
                app.ghostbeard,
                app.grimm,
                app.mischief,
                app.player,
                app.itt,
                app.park,
                app.gardeners
            ];
            var world = app.mathCalc.getWorldById(this.state.selectedWorldId);
            var formationIds = this.getFormationIds(this.state.formations[this.state.selectedWorldId || NaN], world.spots);
            var data = app.mathCalc.calculateMultipliers(formationIds);
            app['multiplierData'] = data;
            var cruFormationGoldMult = data && data.globalGold;
            var dpsCruId = this.state.dpsCruIds[this.state.selectedWorldId || NaN];
            var dpsCru = dpsCruId && app.jsonData.crusaders.find(cru => dpsCruId == cru.id);
            var playerGold = this.state.gold;
            var goldText = (data && typeof(cruFormationGoldMult) == "number")? (cruFormationGoldMult.toFixed(2) + "") : "";
            if(playerGold && !isNaN(+playerGold) && typeof(+playerGold) == "number" && +playerGold > 0){
                goldText = goldText + " * " + (+playerGold).toFixed(2) + " = " + ((playerGold * cruFormationGoldMult).toFixed(2));
            }

            var formationComponent:JSX.Element | null = null;
            if(world!= null && world.layout != null){
                formationIds = this.state.formations[world.id] || app.formationIds;
                formationComponent =
                    (<WorldComponent
                            slotLayout={world.layout}
                            spots={world.spots}
                            worldId={this.state.selectedWorldId as number}
                            formation={formationIds}
                            dpsCruId={dpsCruId}
                            onFormationChange={this.onFormationChange}
                            onDpsChange={this.onDpsChange}
                            onClearClick={this.clearFormation.bind(this)}
                            // for saving
                            nextSaveName={app.inspect(this.state.nextSaveName, "nextSaveName")}
                            enableSave={this.state.enableSave !== false}
                            onSaveFormationClick={() => this.saveFormation(this.state.nextSaveName, formationIds, dpsCruId)}
                            onSaveNameChange={d => this.setState({nextSaveName:d})}
                            // for loading
                            selectedSave={this.state.selectedSave}
                            selectedSaveChange={e => this.setState({selectedSave:e})}
                            saveNames={app.inspect(this.state.saveNames || [], "saveNames")}
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
            var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : app.getIsLocalFileSystem()?  '': '';
            var tagTracker = calculateTagTracker(app.jsonData.missionTags, formationIds);
            var kaine = getCrusader("06");
            var kaineSetter = x => {
                var value = !isNaN(+x)? +x : 0;
                kaine.XP = value;
                this.setState({kaineXP: value});
            };
            var lootId = app.mathCalc.getItemId(kaine.id, 1, true);
            // console.log('formcalc', kaine.loot);
            var rarity = Loot.getRarityByItemId(lootId,kaine.loot);
            // this should also be conditional on having the legendary that needs it
            var kaineXpComponent =
                kaine && formationIds.includes(kaine.id) && rarity > 3
                ? ( <div title="Kaine XP"><div>Kaine XP(for one of his legendaries):</div><app.TextInputUnc onChange={kaineSetter} type="number" value={this.state.kaineXP} /></div>)
                : null;
            var  dpsMult= data && data.globalDps? data.globalDps.toFixed ? app.numberWithCommas(data.globalDps.toFixed(2),) : data.globalDps: null

            return (<div>
                <FormationTags missionTags={app.jsonData.missionTags} baseUrl={baseUrl} tagTracker={tagTracker}/>
                <div className="tags">
                    {app.TagCountsComponent(app.jsonData.missionTags.map(tag => tag.id), app.jsonData.crusaders.filter(cru => formationIds.includes(cru.id)))}
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
                        var stateMods:Partial<FormationCalcState> = {selectedWorldId: worldId};
                        stateMods.formation = app.formationIds;
                        stateMods.saveNames= this.getSaveNames();
                        this.setState(stateMods as any);
                    }} >
                    {
                        worlds.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))
                    }
                </select>
                </div>
                <div title="Your gold multiplier with no one in formation">
                    <div className="adaptChildren">
                        <div className="adaptChildren">
                            <label>BaseGoldMult:</label>
                            <app.TextInputUnc className="small" onChange={g => this.setState({gold:g})} type="number" value={playerGold} /></div></div>
                        <div>
                            <label className="adaptChildren">Disable Legendaries:</label><app.Checkbox checked={this.state.disableLegendaries === true} onChange={() => this.setState({disableLegendaries:this.state.disableLegendaries === true? false : true})} />
                        </div>
                    </div>
                {kaineXpComponent}
                <p title="multiplier only, not actual dps number, also we do not account for achievements">Dps Multiplier: {dpsCruId != null ? null : <span className="warning">no main dps is selected!</span>} {dpsMult}{dpsCru && dpsCru.zapped === true ? " zapped" : null}</p>
                <p>Gold Multiplier: {goldText}</p>
                {formationComponent}
                </div>
                )
        }
    }
    app.FormationCalc = FormationCalc;
})(typeof global !== 'undefined' ? global : window);
