/* global Clipboard React */
// data is in window.jsonData
// reference heroId data at http://pastebin.com/Bf5UgsBC
// reference lootId data at http://pastebin.com/vJNceSJZ
(function(app,exposeYourself:boolean){

  var SavedFormation = props => {
    var {clId, saves} = props;
    var m = (/(\d+)$/).exec(clId);
    var cId = m!= null && m.length && m.length > 0 && m[1];
    var world = app.mathCalc.getWorldById(cId);
    var name= world && world.name || clId;
    console.log(saves);
    var mapCru = cru => (<li key={cru.id}>{cru.displayName}</li>);
    var f = sf => (<ul>{sf.map((x,i) => {
      return x < 1 ? (<li key={i} title={ x === -1 ? "empty" : JSON.stringify(x)}>_____</li>) : mapCru(props.heroMap[x]);
      })}
    </ul>);
    var displayMap = sf => (<span>{sf.id} {f(sf.f)}</span>);
    var sorter = (sf1,sf2) => sf1.id > sf2.id ? 1 : -1;
    // put sorter in later
    return ( <li key={clId} data-key={clId}>{name}
                <app.UnorderedList sorter={sorter} items={saves} keyMaker={sf => sf.id} displayMap={displayMap} />
              </li>);
  };

  // data pull
  var HeroGameData = props => {
      //legacy data/usage would not have these in state (but also legacy data shouldn't be stored anywhere in prod)
      // if(!props.mappedHeroes)
      //   return null;
      // if(! props.mappedLoot)
      //   return null;
      var gear = props.mappedLoot && props.mappedLoot.gear || [];

      var heroLIs = props.mappedHeroes? props.mappedHeroes.map(h =>
        (<li data-key={h.HeroId} key={h.HeroId}>{JSON.stringify(h)}</li>)
      ): [];
      var gearLIs = gear.map(l =>
        (<li data-key={l.lootId} key={l.lootId}>{JSON.stringify(l)}</li>)
      );
      var loot = props.mappedLoot && props.mappedLoot.items || [];
      var lootLIs = loot.map(l =>{
        return (<li data-key={l.lootId} key={l.lootId}>{JSON.stringify(l)}</li>);
      });
      var talents = props.mappedTalents || [];
      var talentLIs = talents.map(t =>
        (<li data-key={t.talentId} key={t.talentId}>{JSON.stringify(t)}</li>)
      );
      var formations = props.mappedFormations || {};
      var formationLIs = formations != null?
        (<ul>{Object.keys(formations).map(campaignLongId => (<SavedFormation key={campaignLongId} heroMap={props.heroMap} clId={campaignLongId} saves={formations[campaignLongId]} />))}</ul>) : null;
      var rawFormationLIs = Object.keys(formations).map(campaignLongId =>{
        return ( <li key={campaignLongId} data-key={campaignLongId}>{campaignLongId}{JSON.stringify(formations[campaignLongId])}</li>);
      });

      // consider mapping the parsed raw section collapsible at least at the highest level
      if(!Array.isArray(props.mappedHeroes))
        console.warn("mapped Heroes is messed up or not present");


      return (<div>
          <button onClick={() => props.onImportGameDataClick(props.mappedHeroes,props.mappedLoot, props.mappedTalents,props.mappedFormations)}>import</button>
          <app.Tabs>
            <app.Pane label="Heroes and EP">
              <div><div>{ heroLIs.length + " items"}</div>
                <ul>
                  {heroLIs}
                </ul>
              </div>
            </app.Pane>
            <app.Pane label="Gear">
              <div><div>{gearLIs.length + " gear items"}</div>
              <ul>
                {gearLIs}
                </ul>
                {app.createClipperButton(JSON.stringify(gear))}
              </div>
            </app.Pane>
            <app.Pane label="Talents">
              <div>
                <ul>
                  {talentLIs}
                </ul>
              </div>
            </app.Pane>
            <app.Pane label="Other Loot">
              <div>
                <ul>
                  {lootLIs}
                </ul>
              </div>
            </app.Pane>
            <app.Pane label="Parsed Raw">
                <pre>{JSON.stringify(props.data,null,2)}</pre>
            </app.Pane>
            <app.Pane label="Formations">
              <div>
                <ul>
                  {formationLIs}
                </ul>
                Raw:
                <ul>
                  {rawFormationLIs}
                </ul>
              </div>
            </app.Pane>
          </app.Tabs>
      </div>);
  };
  (HeroGameData as any).displayName = 'HeroGameData';

  var LegendaryReduction = props =>{
    var ldr = props.legendaryReductionDate;
    if(!(ldr != null))
      return null;
      try{
        if(!(ldr instanceof Date))
          ldr = new Date(ldr);
        else // clone date object
          ldr = new Date(ldr.getTime());

        var now = new Date();

        while(ldr.getTime() < now.getTime()){
          ldr.setDate(ldr.getDate()+7);
        }
        var day = ldr.getDay();
        var dayText;
        switch(day){
          case 0:
          dayText = "Sunday";
          break;
          case 1:
          dayText="Monday";
          break;
          case 2:
          dayText="Tuesday";
          break;
          case 3:
          dayText="Wednesday";
          break;
          case 4:
          dayText="Thursday";
          break;
          case 5:
          dayText="Friday";
          break;
          case 6:
          dayText="Saturday";
          break;
          default:
          console.error("unexpected day : " + day);
        }

        return (<div className="onGreen">Legendary Cost Reduction on {dayText || day} {ldr.toLocaleString()}</div>);
      } catch(ex){
        console.error(ex);
        return null;
      }
  }

  var Exporter = props =>
  (
    <div>
    <app.Tabs>
      <app.Pane label="Network-Data Importer">
        <div>
          <p>This is for importing game data from the Crusader Automata (chrome extension) or directly from game network traffic.</p>
          <app.TextAreaInputUnc onChange={props.onNetworkDataTextInputChange} value={props.networkDataRaw} placeHolder='{"success":true,"details":{"abilities":{' className={'fullwidth'} />
          <button onClick={props.onLoadNetworkDataClick}>Parse game data</button>
          <button onClick={props.onClearGameDataParseClick}>Clear Parsed Game Data</button>

          {app.inspect(props.networkDataJson,'exporter networkDataJson')? (
            <HeroGameData heroMap={props.heroMap}
                          crusaders={props.crusaders}
                          data={props.networkDataJson}
                          crusaderReferenceData={props.crusaderReferenceData}
                          mappedHeroes={props.mappedHeroes}
                          mappedLoot={props.mappedLoot}
                          mappedTalents={props.mappedTalents}
                          mappedFormations={props.mappedFormations}
                          onImportGameDataClick={props.onImportGameDataClick} />)
              : null}
      </div>
        </app.Pane>
        <app.Pane label="Import/Export">
        <div>
          <p>This is for importing and exporting the CotLICheatSheet data to/from other players. Also you can use it to make a backup of your CotLICheatSheet data.</p>
        <button onClick={ () => props.onImportAppStateFromUrlClick()}>Import AppStateFrom Url</button>
        <button onClick={ props.onGenerateUrlClick}>Generate AppState Url</button>
        <app.TextAreaInputUnc className={'fullwidth'} onChange={props.onImportTextChange} placeHolder='{"slotSort":"up","mode":"mine","isEpMode":true,"enchantmentPoints":'/>
        <button onClick={props.onImportSiteStateClick} >{props.importText}</button>
        {app.getIsUrlLoaded() ? null : <button onClick={props.onUpdateClick}>Update Export Text</button> }
        <div>Prettify output?<app.Checkbox checked={props.exportPretty} onChange={props.onExportPrettyClick} /></div>
        { app.inspect(props.exportPretty,"exportPretty") === true ?
          (<pre title="export text" id="clipperText" style={props.stateStyle}>{JSON.stringify(props.json,null, '\t')}</pre>)
          : (<div title="export text" id="clipperText" style={props.stateStyle}>{JSON.stringify(props.json)}</div>)
        }


        <div>
        </div>
        {props.clipper}
        </div>
      </app.Pane>
      </app.Tabs>
      </div>
  );
  var provideSavedDefaults = saved => {
      if(typeof(saved.mode) !== 'string' || !(saved.mode != null))
        saved.mode="";
      if(typeof(saved.isEpMode) !== 'boolean' || !(saved.isEpMode != null))
        saved.isEpMode = false;
      if(!(saved.enchantmentPoints != null))
        saved.enchantmentPoints = {};
      if(!(saved.ownedCrusaderIds != null))
        saved.ownedCrusaderIds = [];
      if(!(saved.filterTags != null)){
        saved.filterTags = {};
      }
      if(!(saved.formationIds != null))
        saved.formationIds = {};
      if(!(saved.filterOwned != null))
        saved.filterOwned = 0;
  };

  interface ReferenceData{
    crusaders: any[]
    talents: any[]
    missionTags: any[]
  }
  interface CruAppProps{
    referenceData:ReferenceData
  }
  //  var stateMods = {networkDataJson:json, mappedLoot:mappedLoot, mappedHeroes:mappedHeroes, mappedTalents:mappedTalents,
  //       mappedFormations:mappedFormations,
  //       saved:this.mergeSaveState({legendaryReductionDate: legendaryReductionDate})};
  interface CruAppState extends CruAppNetworkData{
    lastRead?:object
    error?:string
    url?:string
    networkDataRaw?:string
    textState?:string
    urlBase?:string
    exportPretty?:boolean
    sortTalents?:boolean
  }

  class CruApp extends React.Component<CruAppProps,CruAppState> {
    constructor(props){
      // duh-duh-duh-duh SUPER PROPS!
      super(props);
      Object.getOwnPropertyNames(CruApp.prototype).filter(x => x != "constructor").map(x => {
        if(typeof(this[x]) === "function")
          this[x] = this[x].bind(this);
      });
      this.state = this.getInitialState();
    }
    getInitialState(): CruAppState{
      if (app.Clipboard){
        app.clipboard = new app.Clipboard('.btn');
      }
      var state:CruAppState = ({} as CruAppState);
      // auto import is safe now, the storage mechanism will not allow saves with a custom url
      if(app.getIsUrlLoaded()){
        try
        {
          var urlData = app.getParameterByName("appGameState");
          state.saved = this.importAppState(urlData);
        }
        catch (ex){
          return state;
        }
      } else {
        var read = app.cruTagGrid.readOrDefault(undefined);
        state = {lastRead:read} as CruAppState;
        state.saved = read ? read : {};
        if(app.getIsLocalFileSystem()){
          var networkDataJson = app.readIt("gameDataJson",undefined);
          state.networkDataJson=networkDataJson;
        }
      }
      // provide defaults
      provideSavedDefaults(state.saved);
      app.scrubSavedData(state.saved);

      // this is convenient for dev, but could easily cause the site to STAY broken for a single user if bad data gets in.
      app.saved = state.saved;
      return state;
    }
    componentDidUpdate(prevProps, prevState){
      if(prevState.saved != this.state.saved){
        app.cruTagGrid.store(this.state.saved);
        app.saved = this.state.saved;
      }
    }
    // network-data importer
    findNetworkData(){
      return app.NetworkData.findNetworkData(this.state.networkDataRaw,this.props.referenceData, this.setState, this.mergeSaveState);
    }
    onClearGameDataParseClick(){
      console.log('onClearGameDataParseClick');
      this.setState({networkDataJson:undefined});
    }
    // network data merge method
    onImportGameDataClick(heroes,loot,talents,formationSaves){
      // heroes looks like this:
      // return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
      var cruTagGridData = app.cruTagGrid.readOrDefault(undefined);
      var data = app.copyObject(cruTagGridData);
      if(heroes != null){
        try
        {
          if(!(data != null))
            throw Error("onImportGameDataClick: data was not present");
          if(!(this.props != null) || !(this.props.referenceData != null))
            throw Error("onImportGameDataClick: props or referenceData was not present");
          var ownedCrusaderIds = heroes.filter(h => h.Owned).map(h => this.props.referenceData.crusaders.filter(c => c.heroId == h.HeroId)[0].id);
          data.ownedCrusaderIds = ownedCrusaderIds;
          var ep = {}
          heroes.filter(h => h.Owned).map(h => {
            var crusader = this.props.referenceData.crusaders.filter(c => c.heroId == h.HeroId)[0];
            ep[crusader.id] = h.Ep;
          });
          data.enchantmentPoints = ep;
          console.log('imported hero game data');
        }
        catch (ex){
          console.error('could not import hero game data', ex);
        }
      } else{
        console.warn("heroes was not populated before importGameDataClick");
      }
      // loot looks like this:
      // {heroBenchSlot : x.crusader.slot,heroName: x.crusader.displayName, heroSlotId : x.crusader.id, slot: x.lootItem.slot, lootId : x.lootItem.lootId, rarity: x.lootItem.rarity,countOrLegendaryLevel:x.lootItem.count})
      // merged should look like this :
      // crusaderGear:{"01":{"slot0":4,"slot1":4,"slot2":4},
      if(loot && loot.gear){
        app.mergeImportLoot(data,loot)
        console.log('imported loot game data');
      }
      // console.log('importing talents?', talents);
      if(talents){
        console.log('onImportGameDataClick talents', talents);
        app.mergeImportTalents(data,talents);
      }
      if(formationSaves){
        console.group("onImportGameDataClick: formationSaves import");
        try{
          console.log('importing formationSaves');
          var mergedFormations = app.Formation.mergeImportFormations(formationSaves, this.props.referenceData.crusaders);
          console.log('onImportGameDataClick.mergedFormations', mergedFormations);
        } catch(ex){
          console.error(ex);
        }
        console.groupEnd();
      }
      data.mainSelectedTab = 0;
      app.cruTagGrid.store(data);

      this.setState({saved:data});

    }
    changeSaveState(newData){
      if(newData.usesExtension === true){
        app.gaEvent("extension", "landing");
        delete newData.usesExtension;
      }

      var merged = this.mergeSaveState(newData);
      console.log('changeSaveState',merged);
      this.setState({saved: merged});
      app.cruTagGrid.store(merged);
      app.saved = merged;
    }
    onImportSiteStateClick(){
      console.log('onImportSiteStateClick',arguments);
      // this does an overwrite, not a merge, perhaps allow a merge button?
      if(this.state.textState){
        // not 2, because if the index is 2 it could be {"ownedCrusaderIds"} which isn't a partial load
        if(this.state.textState.indexOf('ownedCrusaderIds') == 0 || this.state.textState.indexOf('ownedCrusaderIds') == 1){
          // special load from the .linq script, not direct game data, or page state
          var data = JSON.parse("{" + this.state.textState + "}");
          this.changeSaveState({ownedCrusaderIds:data.ownedCrusaderIds});
        } else {
          var data = JSON.parse(this.state.textState);
          app.cruTagGrid.store(data);
          app.scrubSavedData(data);
          this.setState({saved:data});
        }
      }
      // wipe out saved data
      else{
        app.cruTagGrid.store(undefined);
        this.setState({saved:{}});
        // this should be able to be removed once we find out why it is putting things in a bad state
        window.location.reload(false);
      }
    }
    importAppState(data,reload?:boolean):(CruAppSaveState|{}) {
      if(!data && app.getIsLocalFileSystem())
        throw "importAppState called without any data";
      if(!data)
        return {};
      var parsed = JSON.parse(data);
      // this potentially can add lots of unused properties into the state that will be stored into html5 local storage and never deleted.
      app.cruTagGrid.store(parsed);
      if(reload === true && app.location)
        app.location.reload(false);
      return parsed;
    }
    onGenerateUrlClick(){
      var data = app.cruTagGrid.readOrDefault();
      var stringified = JSON.stringify(data);
      var baseUrl = app.location.origin + app.location.pathname;
      var url = baseUrl + app.exportToUrl("appGameState", stringified);
      this.setState({url:url,urlBase:baseUrl});
    }
    mergeSaveState(newData){
      return app.copyObject(this.state.saved,newData);
    }
    render(){
      var w = app,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;
      var props = this.props;
      var maxWidth = x - 40;
      var stateStyle = {
        maxWidth:x,
        overflowWrap:"break-word",
        color:"white",
        background:"black"
      };
      var importText = this.state.textState ? 'Import Data from Textbox' : 'Clear All Saved Data';
      var clipper = app.createInputClipperButton("clipperText");
      // console.log('clipper', clipper);

      var heroMap = {};

      this.props.referenceData.crusaders.map(c =>{
        heroMap[c.heroId] = c;
      });
      app.networkDataJson = this.state.networkDataJson;
      app.crusaderGear = this.state.saved != null && this.state.saved.crusaderGear;
      var trackEvent = (title,onChange) => {
        return function(){
          app.gaEvent('event',title);
          onChange(arguments);
        };
      }
      var importArea = app.getIsUrlLoaded() ? null : (<Exporter
                    maxWidth={maxWidth}
                    onImportTextChange={val => this.setState({textState:val})}
                    exportPretty={this.state.exportPretty || false}
                    onExportPrettyClick={e => this.setState({exportPretty:this.state.exportPretty === true ? false : true})}
                    // networkGame section?
                    onNetworkDataTextInputChange={val => { console.log("setting networkDataRaw"); this.setState({networkDataRaw:val});}}
                    onLoadNetworkDataClick={this.findNetworkData}
                    networkDataRaw={this.state.networkDataRaw}
                    networkDataJson={this.state.networkDataJson}
                    heroMap={heroMap}
                    crusaders={props.referenceData.crusaders}
                    onImportGameDataClick={this.onImportGameDataClick}
                    onClearGameDataParseClick={this.onClearGameDataParseClick}
                    mappedLoot={this.state.mappedLoot}
                    mappedHeroes={this.state.mappedHeroes}
                    mappedTalents={this.state.mappedTalents}
                    mappedFormations={this.state.mappedFormations}
                    // network game section end?
                    onImportSiteStateClick={this.onImportSiteStateClick}
                    onGenerateUrlClick={trackEvent('generateUrl',this.onGenerateUrlClick)}
                    onImportAppStateFromUrlClick={() => {
                      app.gaEvent('import','gameState');
                      this.importAppState(app.importFromUrl("appGameState"),true);
                    }}
                    onUpdateClick={() => !app.getIsUrlLoaded() ?  this.setState({lastRead:app.cruTagGrid.readOrDefault(undefined)}): null}
                    clipper={clipper}
                    stateStyle={stateStyle}
                    json={this.state.lastRead}
                    importText={importText}
                    />);
                    var ldr = this.state.saved && this.state.saved.legendaryReductionDate;
      var tabName = val => val == 0? 'crusaders': val == 1 ? 'talents': val == 2 ? 'formation' : val == 3 ?'importExport':'unknown';
      return (<div>
          <div>{JSON.stringify(this.state.error)}</div>

          <div className="onGreen">Install the extension to auto-load your data from <a href="https://chrome.google.com/webstore/detail/crusaders-automaton/dhlljphpeodbcliiafbedkbkiifdgdjk">Crusader Automaton</a></div>
        <app.Tabs selected={this.state.saved && this.state.saved.mainSelectedTab} onTabChange={val => {
            app.gaEvent('navigation','click',tabName(val));
            this.changeSaveState({mainSelectedTab:val});
            }}>
          <app.Pane label="Crusaders">
            <div>
              <LegendaryReduction legendaryReductionDate={ldr} />
              <app.CruTagGrid model={props.referenceData}
                          slotSort={this.state.saved.slotSort}
                          epSort={this.state.saved.epSort}
                          nameSort={this.state.saved.nameSort}
                          mode={this.state.saved.mode}
                          isEpMode={this.state.saved.isEpMode || false}
                          isGearMode={this.state.saved.isGearMode || false}
                          crusaderGear={this.state.saved && this.state.saved.crusaderGear}
                          sharingIsCaring={this.state.saved.sharingIsCaring || 0}
                          enchantmentPoints={this.state.saved.enchantmentPoints || 0}
                          ownedCrusaderIds={this.state.saved.ownedCrusaderIds || []}
                          isBuildingFormation={this.state.saved.isBuildingFormation}
                          formationIds={this.state.saved.formationIds || []}
                          filterTags={this.state.saved.filterTags || {}}
                          filterOwned={this.state.saved.filterOwned || 0}
                          updateSave={this.changeSaveState} />
            </div>
          </app.Pane>
          <app.Pane label="Talents">
            <app.TalentCalc
              changeSaveState={this.changeSaveState}
              saved={this.state.saved}
              referenceData={this.props.referenceData}
              sortTalents={this.state.sortTalents || false}
              onSortTalentsChange={() => {var nextState = {sortTalents: this.state.sortTalents === true ? false : true}; console.log('nextState', nextState); return this.setState(nextState);}}
              />
          </app.Pane>
          <app.Pane label="FormationCalc">
            <app.FormationCalc />
          </app.Pane>
          <app.Pane label="Extension and raw Import/Export">
            <div>
              {this.state.url? <div><a href={this.state.url}>{this.state.urlBase}</a></div> : null}
              {importArea}
            </div>
          </app.Pane>
          </app.Tabs>
          <div className="onGreen">
          </div>
        </div>);
    }
  }

  ReactDOM.render(
        <CruApp referenceData={app.jsonData as ReferenceData} />,
          document.getElementById('crusaders_holder')
  );

  var exportCrusaderData = (refData,playerFields,refFields) =>{
    var data = app.cruTagGrid.readOrDefault();
    if(!(data!=null))
      throw Error("cruTagGrid data not found");
    if(!(refData != null))
      throw Error("jsonData not found");
    var crusaders = refData.crusaders;
    return crusaders.map(cru =>{
      var r:any = {};
      refFields.map(refFieldName =>{
        r[refFieldName] = cru[refFieldName];
      });
      playerFields.map(pFieldName =>{
        switch(pFieldName){
          case "enchantmentPoints":
            r.ep = data.enchantmentPoints[cru.heroId];
          break;
          case "crusaderGear":
            var gear = data.crusaderGear[cru.id];
            if(!(gear != null))
              return;
            r.gear = {};
            Object.keys(gear).map(slotKey =>
              r.gear[slotKey] = gear[slotKey]);
          break;
          default:
            throw Error("player data field '" + pFieldName + "' not mapped.");
        }
      });
      return r;
    });
  };
  app.exportCrusaderData = exportCrusaderData;
})(findJsParent(), false);