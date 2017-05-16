// data is in window.jsonData
// reference heroId data at http://pastebin.com/Bf5UgsBC
// reference lootId data at http://pastebin.com/vJNceSJZ


var getCrusaderDps = function(crusader){
  if (!crusader || !crusader.upgrades){
    return "no data";
  }
  var alldps = crusader.upgrades.alldps ? crusader.upgrades.alldps.reduce(add) : 0;
  return crusader.upgrades.selfdps ? crusader.upgrades.selfdps.reduce(add) + +alldps : null;
};
var Filter = props =>
{
    var filterClasses =
      props.on == 1 ? "fa fa-fw fa-filter active"
      : props.on == 0 || !(props.on != null) ? "fa fa-fw fa-filter" :
      "fa fa-fw fa-filter activeNegative";
    return (<i className={filterClasses} onClick={props.filterClick}></i>);
};


var TagsTd = props => {
      var cru = props.crusader;
      var tags = [];
      props.missionTags.map(function(tag){
          var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag":"img_tag_off";
          var title = tag.displayName;
          switch (tag.id){
            case "dps":
              title += ':' + props.dps;
            break;
            case "event":
              if(cru.event){
                title += ":" + cru.event;
              }
            break;
          }
          tag.id === "dps" ? tag.displayName  : tag.displayName;
          var imgTag = (<img key={tag.id} src={props.baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
          if(tag.id === "event" && cru.eventLink){
            tags.push(<a key={tag.id} className="tooltip" href={cru.eventLink}>{imgTag}</a>);
          } else {
            tags.push(imgTag);
          }
      });
      return (<td key="tags" className="tags" data-key="tags">{tags}</td>);
};
TagsTd.displayName = 'TagsTd';

var CruTagRowFormationEpBox = props =>
      props.isEpMode && props.isOwned ? (
        <div className="ep"><TextInputUnc type="number" min="0" readonly={getIsUrlLoaded()} onChange={props.onEpChange} className={["medium"]} value={props.enchantmentPoints} />
          {props.effectiveEp && !Number.isNaN(props.effectiveEp) ? (<div className="sharedEp">Shared:{props.effectiveEp}</div>) : null}
        </div>)
        : null;
CruTagRowFormationEpBox.displayName = 'CruTagRowFormationEpBox';

var CruTagRowFormation = props =>(
  props.mode ==="mine" && props.isFormationMode ?
        (
          <td key="formation">
            <Checkbox checked={props.formationIds[props.cru.slot] == props.cru.id ? true : false} onChange={props.onFormationChange} />
            {props.epBox}
          </td>)
        : null);
CruTagRowFormation.displayName = 'CruTagRowFormation';

var CruTagRowOwned = props =>{
  if(props.mode !== "mine" || props.isFormationMode)
    return null;
  var isAlwaysOwnedSlot = props.cru.slot == props.cru.id && props.cru.slot < 21
  var renderBox = isAlwaysOwnedSlot || (!getIsUrlLoaded() || props.owned);
  if(isAlwaysOwnedSlot || (getIsUrlLoaded() && props.owned)) {
    return (<td key="owned"><Checkbox checked={true} readonly={true} disabled={true} />{props.epBox}</td>);
  }
  if(!getIsUrlLoaded() || props.owned){
    return (<td key="owned"><Checkbox checked={props.owned} readonly={getIsUrlLoaded()} disabled={getIsUrlLoaded()} onChange={props.onOwnedChange} />{props.epBox}</td>);
  }
  return (<td></td>);
};

var CruTagRowTagsOrGear = props =>{
      var tagsTd;
      // enable tags if mine mode is off, or gear mode is off
      if(props.mode !== "mine" || !props.isGearMode ){
        return (<TagsTd dps={props.dps} missionTags={props.missionTags} crusader={props.cru} baseUrl={props.baseUrl} />) ;
      }
      return props.gearTd;
};

var GearSelect = (props,debug) => {
  // v1/1.5 loot should be transformed on url or localstorage load

  if(debug === true)
    console.group("GearSelect");
  try{

    var cruGear = props.cruGear;
    var slot = props.slot;
    var gearInfo = Loot.getGearInfo(cruGear);
    var itemIdentification = gearInfo && gearInfo[slot] || 0;
    var gearRef = props.gearReference && props.gearReference[3];
    var gearInfo = itemIdentification && gearRef && Loot.getLootFromId(itemIdentification, props.gearReference[3]);
    var rarity = Loot.getRarityByItemId(itemIdentification, gearRef);

    var slotGear = gearRef
      .filter(g => g.slot==slot)
      .sort((a,b) => a.rarity < b.rarity ? -1 : b.rarity < a.rarity ? 1 : a.golden && !b.golden ? 1 : b.golden && !a.golden ? -1 : 0);
    // this appears to run whenever there isn't gear declared for this crusader
    var getOptionsV1 = () =>
      props.gearPossibilities.map((g,i)=> (<option key={g} value={i}>{g}</option>));

    var $options = !slotGear? getOptionsV1() : slotGear.map(g => (<option key={g.lootId} value={g.lootId} title={g.name}>{(g.golden? 'golden ' : '') + props.gearPossibilities[g.rarity]}</option>))
    if(slotGear)
      $options.unshift(<option key={0}>None</option>);

    var selectValueV = !(cruGear["s" + slot] != null)? 2 : !(cruGear["slot"+slot] != null) ? 1 : 0;
    var selectV = (slotGear != null) ? 2 : 1;
    var legendaryValue = rarity >= 5 && Loot.getLLevel(itemIdentification, props.gearReference && props.gearReference[3]);
    var $ll = rarity >=5 ? (<TextInputUnc type="number" className="medium" min="1" max="10" value={legendaryValue} onChange={e => props.onLlChange(props.cruId,slot,e)} />): null;
    // console.log("slotGear",slotGear,"gearReference", props.gearReference);
    if(!(props.gearReference != null))
      throw Error("bad gearReference");

    var value = gearInfo && gearInfo.lootId
      ||
      (itemIdentification && Loot.getRarityByItemId(itemIdentification, props.gearReference && props.gearReference[3]));

    return (<div data-component="gearSelect">
      <select key={"gear" + slot}
              title={JSON.stringify(gearInfo) + '\r\n'}
              data-valueV={selectValueV}
              data-v={selectV}
              data-value={value}
              value={value}
              onChange={e => props.onGearChange(props.cruId, slot, e.target.value, selectV)}
              name={"slot" + slot}>{$options}</select>{$ll}{gearInfo && gearInfo.name ? gearInfo.name : null}</div>);
  } finally{
    if(debug === true)
      console.groupEnd();
  }
};

var CruTagRowSlotGear = props =>{
      var $slotGear;
      // extract the 3 slots with qualities
      var cruGearQ =  Loot.getGearInfo(props.cruGear);

      if(cruGearQ[0] > 0 || cruGearQ[1] > 0 || cruGearQ[2] > 0 || typeof(cruGearQ[0])=="string" || typeof(cruGearQ[1]) == "string" || typeof(cruGearQ[2])=="string"){
        var makeBox = slot => {
          var itemRarityCompound =  cruGearQ[slot];
          var rarity = Loot.getRarityByItemId(itemRarityCompound,props.cru.loot);
          var golden = Loot.getIsGolden(itemRarityCompound, props.cru.loot) ? " golden" : "";
          var classes = "rarity rarity" + rarity + golden;
          return (<div className={classes} />);
        };
        return (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
      }
      return null;
};
CruTagRowSlotGear.displayName = "CruTagRowSlotGear";

var CruTagRowGear = props =>{
  var gearTd = null;
  if(props.mode !=="mine" || !props.isGearMode)
    return null;
  // gearReference currently looks like [undefined,undefined,undefined,cruGearArray] or cruGearArray
  var makeSelect = slot => (<GearSelect cruGear={props.cruGear} slot={slot} gearReference={props.gearReference} cruId={props.cruId} gearPossibilities={props.gearTypes} onGearChange={props.onGearChange} onLlChange={props.onLlChange} />);
  return (<td key="gear" data-key="gear" data-component="CruTagRowGear">
              {makeSelect(0)}
              {makeSelect(1)}
              {makeSelect(2)}
              </td>);

};
CruTagRowGear.displayName = "CruTagRowGear";

var CruTagRow = props => {
      var cru = props.crusader;
      var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
      var $image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null;
      var isOwned = props.owned || cru.slot == cru.id && cru.slot < 21;
      var $epBox = (<CruTagRowFormationEpBox isEpMode={props.isEpMode} isOwned={isOwned} onEpChange={props.onEpChange} enchantmentPoints={props.enchantmentPoints} effectiveEp={props.effectiveEp} />);
      var $formation = (<CruTagRowFormation mode={props.mode} isFormationMode={props.isFormationMode} cru={cru} formationIds={props.formationIds} onFormationChange={props.onFormationChange}
        epBox={$epBox}
        />);
      var $owned = (<CruTagRowOwned mode={props.mode} isFormationMode={props.isFormationMode} cru={cru} owned={isOwned} epBox={$epBox} onOwnedChange={props.onOwnedChange} />);
      var link = cru.link && cru.link.indexOf('/') < 0 ? (props.wikibase + cru.link)
        : cru.link ?
          cru.link
        : props.wikibase + cru.displayName.replace(" ","_");

      var cruGear = props.gear ? props.gear : {};

      var $slotGear = (<CruTagRowSlotGear cru={cru} cruGear={cruGear} />);
      // the select boxes and legendary level inputs
      var $gearTd = (<CruTagRowGear mode={props.mode} isGearMode={props.isGearMode} cruGear={cruGear} gearReference={props.gearReference}
                                    cruId={cru.id}
                                    gearTypes={props.gearTypes}
                                    onGearChange={props.onGearChange}
                                    onLlChange={props.onLlChange} />);

      var $tagsOrGearColumn = (<CruTagRowTagsOrGear mode={props.mode} isGearMode={props.isGearMode} dps={props.dps} missionTags={props.missionTags} cru={cru} baseUrl={baseUrl} gearTd={$gearTd} />);
      var $tagCountColumn = props.mode !== "mine" || !props.isGearMode ? (<td key="tagcount" data-key="tagcount">{cru.tags.length}</td>) : null;
      var trClasses = cru.tags.indexOf('dps') >= 0 ? 'dps' : '';
      return (<tr className={trClasses}>
          {$formation}
          {$owned}
          <td key="slot" data-key="slot id" className={cru.tier > 1? "tier2" : null} title={JSON.stringify({Place:cru.id,HeroId:cru.heroId,tier2: cru.tier ===2})}>{cru.slot}{$slotGear}</td>
          <td key="image" data-key="image">{$image}</td>
          <td key="display" data-key="display"><a href={link}>{cru.displayName}</a></td>
          {$tagsOrGearColumn}
          {$tagCountColumn}
      </tr>);
};

var CruGridBody = props =>{

  var rows = props.sortedCrusaders
      .map(function(crusader){
      var owned = props.ownedCrusaderIds && props.ownedCrusaderIds.indexOf && props.ownedCrusaderIds.indexOf(crusader.id) != -1;
      var gear = props.crusaderGear ? props.crusaderGear[crusader.id]: {};
      var dps = getCrusaderDps(crusader);
      var otherSlotCrusaders = props.sortedCrusaders.filter(c => c.slot == crusader.slot).map(c => c.id);
      // this is wrong when crusaders are filtered
      var otherEp = otherSlotCrusaders.map(cId => +props.enchantmentPoints[cId]).reduce((acc,val) => acc + (val || 0),0);
      var effectiveEP = calcEffectiveEP(props.sharingIsCaring, +props.enchantmentPoints[crusader.id], otherEp);
      if(!crusader.loot || crusader.id == 1){
        console.warn('no loot found for crusader', crusader, props.crusaderGear);
      }
      var gearRef = crusader.loot && [null, null, null,crusader.loot];

      return (<CruTagRow key={crusader.displayName}
        formationIds={props.formationIds}
        isEpMode={props.isEpMode}
        isGearMode={props.isGearMode}
        gearTypes={props.referenceData.gearTypes}
        gearReference={gearRef}
        gear={gear}
        onGearChange={props.onGearChange}
        onLlChange={props.onLlChange}
        enchantmentPoints={props.enchantmentPoints[crusader.id]}
        effectiveEp={effectiveEP}
        onEpChange={ val => props.onEpChange(crusader.id, val)}
        isFormationMode={props.isBuildingFormation}
        wikibase={props.referenceData.wikibase}
        crusader={crusader}
        dps={dps}
        owned={owned}
        missionTags={props.referenceData.missionTags}
        mode={props.mode}
        onOwnedChange={val => props.onOwnedChange(crusader,val)}
        onFormationChange={val => props.onFormationChange(crusader,val)} />);
  });
  return (
   <tbody>
    {rows}
    </tbody>);
};

var sortStates = [
  {value:"up", classes: "fa fa-fw fa-sort-up", next:"desc"},
  {value:"desc", classes: "fa fa-fw fa-sort-desc", next:undefined},
  {value:undefined, classes: "fa fa-fw fa-sort", next:"up"}
]
var getSortClasses = value => sortStates.find(val => val.value === value).classes;
var getNextSortValue = value => sortStates.find(val => val.value === value).next;
var getSortUpdate = (name, value) => {
  var update = {};
  update[name] = getNextSortValue(value);
  return update;

};

// get most of the state out of here, so more display stuff can be attached, leave things that don't need to be stored in state
class CruTagGrid extends React.Component {
  constructor(props){
    super(props);
    Object.getOwnPropertyNames(CruTagGrid.prototype).filter(x => x != "constructor").map(x => {
      if(typeof(this[x]) === "function")
        this[x] = this[x].bind(this);
    });
    window.importMe = () => this.props.updateSave({mainSelectedTab:3});
    this.state = {};
  }
  onSlotSortClick(){
      this.props.updateSave(getSortUpdate('slotSort', this.props.slotSort));
  }
  onEpSortClick(){
      this.props.updateSave(getSortUpdate('epSort', this.props.epSort));
  }
  onNameSortClick(){
      this.props.updateSave(getSortUpdate('nameSort', this.props.nameSort));
  }
  filterOwnedClick(){
    //(i + 2) % 3 - 1)
    var filterOwned = (this.props.filterOwned + 2) % 3 - 1;
    this.props.updateSave({filterOwned: filterOwned});
  }
  onModeChangeClicked(){
    console.info('onModeChangeClicked');
    this.props.updateSave({mode:this.props.mode === "" ? "mine": ""});
  }
  onEpClick(){
    this.props.updateSave({isEpMode: this.props.isEpMode? false : true})
  }
  onFormationClick(){
    var saveMods = {isBuildingFormation: this.props.isBuildingFormation != null ? null : "formation"};
    console.info('formationClick', saveMods);
    this.props.updateSave(saveMods);
  }
  onGearClick(){
    var stateMods = {isGearMode: this.props.isGearMode ? false: true};
    console.info('gearClick', stateMods);
    this.props.updateSave(stateMods);
  }
  onEpChange(crusaderId, epValue){
    console.info('onEpChange',arguments);
    var oldEp = this.props.enchantmentPoints;
    var newEp = {};
    for(var attr in oldEp){
      if (oldEp.hasOwnProperty(attr)) {
        newEp[attr] = oldEp[attr];
      }
    }
    newEp[crusaderId] = epValue;
    var stateMods = {enchantmentPoints:newEp};
    this.props.updateSave(stateMods);
  }
  onFormationChange(crusader){
    console.info('formation change');
    var oldState = this.props.formationIds;
    var newState = oldState.constructor();
    for(var attr in oldState){
      if (oldState.hasOwnProperty(attr)) {
        newState[attr] = oldState[attr];
      }
    }
    if(oldState[crusader.slot] != null){
      if (oldState[crusader.slot] == crusader.id){
        newState[crusader.slot] = null;
      } else {
        newState[crusader.slot] = crusader.id;
      }
    } else {
      newState[crusader.slot] = crusader.id;
    }
    this.props.updateSave({formationIds:newState});
  }
  onOwnedChange(crusader){
    console.info('onOwnedChange');
    var owned = this.props.ownedCrusaderIds.slice(0);
    var i = owned.indexOf(crusader.id);
    if(i == -1){
      owned.push(crusader.id);
    } else {
      owned.splice(i,1);
    }
    this.props.updateSave({ownedCrusaderIds:owned});
  }
  onLlChange(cruId,slot,legendaryLevel){
    console.info('onLlChange',arguments);
    var stateMods ={};
    if(!this.props.crusaderGear){
      stateMods.crusaderGear={};
    } else {
      var merged = copyObject(this.props.crusaderGear);
      stateMods.crusaderGear = merged;
    }
    var cruGear;
    if(!stateMods.crusaderGear[cruId]){
      cruGear={};
    } else {
      cruGear = copyObject(stateMods.crusaderGear[cruId])
    }
    stateMods.crusaderGear[cruId] = cruGear;
    //if the prop is slot not s then the loot isn't loaded for that crusader, and we're going to use LootV1 itemCompounds
    var prevId = cruGear["s" + slot] || cruGear["slot" + slot];
    // is the slot vs s property distinction for when the crusader's loot isn't in data.js yet? so we know it is a rarity selection not a lootId
    var newId = Loot.changeLLevel(prevId,legendaryLevel);
    if(prevId === newId){
      return;
    }
    if(newId && typeof(newId) == "string" && newId.indexOf("undefined") >=0)
      throw ("invalid newId returned" + newId);
    stateMods.crusaderGear[cruId]["s" + slot] = newId;
    this.props.updateSave(stateMods);
  }
  onGearChange(cruId,slot,gearTypeIndex, selectV){
    var stateMods = {};
    if(!this.props.crusaderGear){
      stateMods.crusaderGear = {};
    } else {
      var merged = copyObject(this.props.crusaderGear);
      stateMods.crusaderGear = merged;
    }
    var cruGear;
    if(!stateMods.crusaderGear[cruId]){
      cruGear = {};
    }
    else {
      cruGear = copyObject(stateMods.crusaderGear[cruId]);
    }
    stateMods.crusaderGear[cruId] = cruGear;
    if(selectV == 1){
      stateMods.crusaderGear[cruId]["slot" + slot] = +gearTypeIndex;
    } else {
      if(stateMods.crusaderGear[cruId]["slot" + slot])
        stateMods.crusaderGear[cruId]["slot" + slot] = undefined;
      stateMods.crusaderGear[cruId]["s" + slot] = +gearTypeIndex;
    }
    this.props.updateSave(stateMods);
  }
  onFilterTag(tagId){
    var self = this;
    console.log('onFilterTag', tagId, self.props.filterTags);
    var tagFilter = {};
    var filterTags = self.props.filterTags || {};
    Object.keys(filterTags).map(function(tagId){
      tagFilter[tagId] = filterTags[tagId] ? true : false;
    });
    tagFilter[tagId] = tagFilter[tagId] ? false : true;
    this.props.updateSave({filterTags:tagFilter});
  }

  render(){

    window.crusaderGear = this.props.crusaderGear;
    var self = this;
    var totalCrusaders = this.props.model.crusaders.length;
    var isBuildingFormation = this.props.isBuildingFormation === "formation";
    var isMineMode = this.props.mode === "mine";
    // this may not be reliable, if any dirty data gets in the state from versioning changes
    var totalOwned = this.props.ownedCrusaderIds ? this.props.ownedCrusaderIds.length : '';
    // var filterSortCrusaders = (ownedCrusaderIds, filterOwned, filterTags, isBuildingFormation, formationIds, isDesc,crusaders) => {
      console.log(this.props.slotSort, this.props.epSort, this.props.nameSort,JSON.stringify(this.props.enchantmentPoints));
    var sortedCrusaders =
      filterSortCrusaders(
        this.props.ownedCrusaderIds || [],
        this.props.filterOwned,
        this.props.filterTags || [],
        isBuildingFormation,
        this.props.formationIds || [],
        this.props.slotSort,
        this.props.model.crusaders,
        this.props.epSort,
        this.props.enchantmentPoints,
        this.props.nameSort,
        this.state.epFilter);

    var tagCounts = [];
    this.props.model.missionTags.map(function(tag){
        var count = self.props.model.crusaders.map(function (crusader){
            return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
        }).reduce(function(a,b){ return a + b;});
        var classes = "img_tag";
        if(self.props.filterTags && self.props.filterTags[tag.id]){
          classes += " active";
        }
        tagCounts.push(<span key={tag.id} className={classes} title={tag.id} onClick={self.onFilterTag.bind(self,tag.id)}>{count}</span>);
    });

    var countDisplay = totalCrusaders === sortedCrusaders.length ? totalCrusaders : (sortedCrusaders.length + " of " + totalCrusaders);
    var formationRow;
    if(isMineMode){
      var epFilterComponent = (
        <select value={this.state.epFilter} onChange={e => this.setState({epFilter:inspect(e.target.value,"epFilter.val")})}>
          <option>None</option>
          <option value="<200">&lt;200</option>
          <option value=">200">&gt;200</option>
          <option value="<400">&lt;400</option>
          <option value=">400">&gt;400</option>
          </select>
      );
      formationRow=(
        <tr>
          <th>SharingIsCaring <TextInputUnc className={["medium"]} value={this.props.sharingIsCaring} type="number" onChange={val => this.props.updateSave({sharingIsCaring: +val})} /></th>
          <th><Checkbox checked={this.props.isEpMode} onChange={this.onEpClick} />Track EP</th>
          <th colSpan="2"><Checkbox checked={isBuildingFormation} onChange={this.onFormationClick} /> Build Formation</th>
          <th><Checkbox checked={this.props.isGearMode} onChange={this.onGearClick} />Track gear</th>
          <th></th>
        </tr>
      );
    }
    var tagsTh = !isMineMode || !this.props.isGearMode ? (<th className="tags">Tags<button onClick={() => this.props.updateSave({filterTags:undefined})}>Clear tag filters</button></th>) : null;
    var tagsTh2 = !isMineMode || !this.props.isGearMode ? (<th className="tags clickable">{tagCounts}</th>) : null;
    var countsTh = !isMineMode || !this.props.isGearMode? (<th>Counts</th>) : null;
    var sharingTh = isMineMode && this.props.isEpMode ?
    (<th colSpan="2"></th>): null;
    return (<table id="tab">
    <thead>
      <tr>
        { isMineMode && !isBuildingFormation ? <th>Owned <Filter on={this.props.filterOwned} filterClick={this.filterOwnedClick} /></th>
          : isMineMode && isBuildingFormation ? <th></th> : null}
        <th></th>
        <th colSpan="2">Crusader</th>
        {tagsTh}
        <th></th>
      </tr>
      <tr>
        {isMineMode ? <th title="owned">{totalOwned}</th> : null}
        <th>(count:{countDisplay})</th><th colSpan="2"><Checkbox checked={isMineMode} onChange={this.onModeChangeClicked} />Mine</th>
        {tagsTh2}
        {countsTh}
      </tr>
      { formationRow }
      <tr>
        { isMineMode? (<th>EP<i className={getSortClasses(this.props.epSort)} onClick={this.onEpSortClick}></i>{epFilterComponent}</th>) : null}
        <th >Slot<i className={getSortClasses(this.props.slotSort)} onClick={this.onSlotSortClick}></i></th>
        <th colSpan="2">Name<i className={getSortClasses(this.props.nameSort)} onClick={this.onNameSortClick}></i></th>
        <th />
        <th />
      </tr>

      </thead>
      <CruGridBody
          sortedCrusaders={sortedCrusaders}
          ownedCrusaderIds={this.props.ownedCrusaderIds}
          crusaderGear={this.props.crusaderGear}
          enchantmentPoints={this.props.enchantmentPoints}
          sharingIsCaring={this.props.sharingIsCaring}
          formationIds={this.props.formationIds}
          isEpMode={this.props.isEpMode}
          isGearMode={this.props.isGearMode}
          referenceData={this.props.model}
          onGearChange={this.onGearChange}
          onLlChange={this.onLlChange}
          isBuildingFormation={isBuildingFormation}
          mode={this.props.mode}
          onOwnedChange={this.onOwnedChange}
          onFormationChange={this.onFormationChange}
          onEpChange={this.onEpChange}

          />
      {/*{this.props.children}*/}
    </table>)
  }
}

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
    console.log('HeroGameData.mappedformations', formations);
    var formationLIs = Object.keys(formations).map(campaignLongId =>{
      return ( <li key={campaignLongId} data-key={campaignLongId}>{campaignLongId}{JSON.stringify(formations[campaignLongId])}</li>);
    });

    // consider maping the parsed raw section collapsible at least at the highest level

    return (<div>
        <button onClick={() => props.onImportGameDataClick(props.mappedHeroes,props.mappedLoot, props.mappedTalents,props.mappedFormations)}>import</button>
        <Tabs>
          <Pane label="Heroes and EP">
            <div><div>{ heroLIs.length + " items"}</div>
              <ul>
                {heroLIs}
              </ul>
            </div>
          </Pane>
          <Pane label="Gear">
            <div><div>{gearLIs.length + " gear items"}</div>
            <ul>
              {gearLIs}
              </ul>
              {createClipperButton(JSON.stringify(gear))}
            </div>
          </Pane>
          <Pane label="Talents">
            <div>
              <ul>
                {talentLIs}
              </ul>
            </div>
          </Pane>
          <Pane label="Other Loot">
            <div>
              <ul>
                {lootLIs}
              </ul>
            </div>
          </Pane>
          <Pane label="Parsed Raw">
              <pre>{JSON.stringify(props.data,null,2)}</pre>
          </Pane>
          <Pane label="Formations">
            <div>
              <ul>
                {formationLIs}
              </ul>
            </div>
          </Pane>
        </Tabs>
    </div>);
};
HeroGameData.displayName = 'HeroGameData';

var LegendaryReduction = props =>
props.legendaryReductionDate ?
  (<div className="onGreen">Legendary Cost Reduction at {props.legendaryReductionDate.toLocaleString()}</div>)
  : null

var Exporter = props =>
(
  <div>
  <Tabs>
    <Pane label="Network-Data Importer">
      <div>
        <p>This is for importing game data from the Crusader Automata (chrome extension) or directly from game network traffic.</p>
        <TextAreaInputUnc onChange={props.onNetworkDataTextInputChange} value={props.networkDataRaw} placeHolder='{"success":true,"details":{"abilities":{' className={'fullwidth'} />
        <button onClick={props.onLoadNetworkDataClick}>Parse game data</button>
        <button onClick={props.onClearGameDataParseClick}>Clear Parsed Game Data</button>

        {inspect(props.networkDataJson,'exporter networkDataJson')? (
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
      </Pane>
      <Pane label="Import/Export">
      <div>
        <p>This is for importing and exporting the CotLICheatSheet data to/from other players. Also you can use it to make a backup of your CotLICheatSheet data.</p>
      <button onClick={ () => props.onImportAppStateFromUrlClick()}>Import AppStateFrom Url</button>
      <button onClick={ props.onGenerateUrlClick}>Generate AppState Url</button>
      <TextAreaInputUnc className={'fullwidth'} onChange={props.onImportTextChange} placeHolder='{"slotSort":"up","mode":"mine","isEpMode":true,"enchantmentPoints":'/>
      <button onClick={props.onImportSiteStateClick} >{props.importText}</button>
      {getIsUrlLoaded() ? null : <button onClick={props.onUpdateClick}>Update Export Text</button> }
      <div>Prettify output?<Checkbox checked={props.exportPretty} onChange={props.onExportPrettyClick} /></div>
      { inspect(props.exportPretty,"exportPretty") === true ?
        (<pre title="export text" id="clipperText" style={props.stateStyle}>{JSON.stringify(props.json,null, '\t')}</pre>)
        : (<div title="export text" id="clipperText" style={props.stateStyle}>{JSON.stringify(props.json)}</div>)
      }


      <div>
      </div>
      {props.clipper}
      </div>
    </Pane>
    </Tabs>
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

class CruApp extends React.Component {
  constructor(props){
    // duh-duh-duh-duh SUPER PROPS!
    super(props);
    Object.getOwnPropertyNames(CruApp.prototype).filter(x => x != "constructor").map(x => {
      if(typeof(this[x]) === "function")
        this[x] = this[x].bind(this);
    });
    this.state = this.getInitialState();
  }
  getInitialState(){
    if (Clipboard){
      window.clipboard = new Clipboard('.btn');
    }
    var state = {};
    // auto import is safe now, the storage mechanism will not allow saves with a custom url
    if(getIsUrlLoaded()){
      try
      {
        var urlData = getParameterByName("appGameState");
        state.saved = this.importAppState(urlData);
      }
      catch (ex){
        return state;
      }
    } else {
      var read = cruTagGrid.readOrDefault(undefined);
      var state = {lastRead:read};
      state.saved = read ? read : {};
      if(getIsLocalFileSystem()){
        var networkDataJson = readIt("gameDataJson",undefined);
        state.networkDataJson=networkDataJson;
      }
    }
    // provide defaults
    provideSavedDefaults(state.saved);
    scrubSavedData(state.saved);

    // this is convienent for dev, but could easily cause the site to STAY broken for a single user if bad data gets in.
    window.saved = state.saved;
    return state;
  }
  componentDidUpdate(prevProps, prevState){
    if(prevState.saved != this.state.saved){
      cruTagGrid.store(this.state.saved);
      window.saved = this.state.saved;
    }
  }
  loadNetworkData(parsedOrUnparsedData){
    // console.log('loadNetworkData',parsedOrUnparsedData);
    var json = typeof(parsedOrUnparsedData) != "string" ? parsedOrUnparsedData : null;
    if(!(json != null))
    try{
      json = JSON.parse(parsedOrUnparsedData);
      console.log('parse success');
    } catch (ex){
      console.error(ex);
      this.setState({error:ex});
      return;
    }
    if(getIsLocalFileSystem()){
      storeIt("gameDataJson",json);
    }
    var heroMap = {};
    this.props.referenceData.crusaders.map(c =>{
      heroMap[c.heroId] = c;
    });
    var legendaryReductionDate = json && json.details && json.details.stats && json.details.stats.legendary_reduction_date ? new Date(+json.details.stats.legendary_reduction_date * 1000): null;
    var getOrGetFromDetails = name => json[name] || (json.details && json.details[name]);

    // account for pasting just the heroes section of json, or the whole data packet
    var mappedHeroes = parseNetworkDataHeroesSection(heroMap, getOrGetFromDetails("heroes"));
    var mappedLoot = parseLoot(this.props.referenceData.crusaders,getOrGetFromDetails("loot"));
    var mappedTalents = parseTalents(this.props.referenceData.talents,getOrGetFromDetails("talents"));
    window.mappedTalents=mappedTalents;
    var mappedFormations = parseFormationSaves(getOrGetFromDetails("formation_saves"));
    console.log('loadNetworkData.mappedFormations', mappedFormations);
    window.mappedFormations = mappedFormations;

    window.heroMap = this.props.heroMap;
    var stateMods = {networkDataJson:json, mappedLoot:mappedLoot, mappedHeroes:mappedHeroes, mappedTalents:mappedTalents,
      mappedFormations:mappedFormations,
      saved:this.mergeSaveState({legendaryReductionDate: legendaryReductionDate})};
    console.log('loadNetworkData setting state', stateMods);
    this.setState(stateMods);
  }
  // network-data importer
  findNetworkData(){
    console.group("findNetworkData");
    if(this.state.networkDataRaw){
      console.log('findNetworkData: using networkDataRaw');
      this.loadNetworkData(this.state.networkDataRaw);
    }
    else if (window.heroesRaw || window.lootRaw){
      var data = {};
      data.details = {};
      if(window.heroesRaw){
        try{
          if(typeof(window.heroesRaw) == "string"){
            console.log('starting heroesRaw parse');
            data.details.heroes = JSON.parse(window.heroesRaw);
          }
          else{
            console.log('starting heroesRaw import');
            data.details.heroes = window.heroesRaw;
          }
        } catch (ex){
          console.error(ex);
        }
      }
      if(window.lootRaw){
        try{
        if(typeof(window.lootRaw) == "string"){
        console.log('starting lootRaw parse');
        data.details.loot = JSON.parse(window.lootRaw);
        } else {
          console.log('starting lootRaw import');
          data.details.loot = window.lootRaw;
        }
        } catch (ex){
          console.error(ex);
        }
      }
      if(window.talentsRaw){
        try{
        if(typeof(window.talentsRaw) == "string"){
        console.log('starting talentsRaw parse');
        data.details.talents = JSON.parse(window.talentsRaw);
        } else {
          console.log('starting talentsRaw import');
          data.details.talents = window.talentsRaw;
        }
        } catch (ex){
          console.error(ex);
        }
      }
      this.loadNetworkData(data);
    }
    console.groupEnd();
  }
  onClearGameDataParseClick(){
    console.log('onClearGameDataParseClick');
    this.setState({networkDataJson:null});
  }
  // network data merge method
  onImportGameDataClick(heroes,loot,talents,formationSaves){
    // heroes looks like this:
    // return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
    var cruTagGridData = cruTagGrid.readOrDefault(undefined);
    var data = copyObject(cruTagGridData);
    try
    {
      if(!(data != null))
        throw error("onImportGameDataClick: data was not present");
      if(!(this.props != null) || !(this.props.referenceData != null))
        throw error("onImportGameDataClick: props or referenceData was not present");
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
    // loot looks like this:
    // {heroBenchSlot : x.crusader.slot,heroName: x.crusader.displayName, heroSlotId : x.crusader.id, slot: x.lootItem.slot, lootId : x.lootItem.lootId, rarity: x.lootItem.rarity,countOrLegendaryLevel:x.lootItem.count})
    // merged should look like this :
    // crusaderGear:{"01":{"slot0":4,"slot1":4,"slot2":4},
    if(loot && loot.gear){
      mergeImportLoot(data,loot)
      console.log('imported loot game data');
    }
    console.log('importing talents?', talents);
    if(talents){
      console.log('onImportGameDataClick talents', talents);
      mergeImportTalents(data,talents);
    }
    if(formationSaves){
      console.group("onImportGameDataClick: formationSaves import");
      console.log('importing formationSaves');
      var mergedFormations = Formation.mergeImportFormations(formationSaves, this.props.referenceData.crusaders);
      console.log('onImportGameDataClick.mergedFormations', mergedFormations);
      console.groupEnd();
    }
    data.mainSelectedTab = 0;
    cruTagGrid.store(data);

    this.setState({saved:data});

  }
  changeSaveState(newData){
    var merged = this.mergeSaveState(newData);
    console.log('changeSaveState',merged);
    this.setState({saved: merged});
    cruTagGrid.store(merged);
    window.saved = merged;
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
        cruTagGrid.store(data);
        scrubSavedData(data);
        this.setState({saved:data});
      }
    }
    // wipe out saved data
    else{
      cruTagGrid.store(undefined);
      this.setState({saved:{}});
      // this should be able to be removed once we find out why it is putting things in a bad state
      window.location.reload(false);
    }
  }
  importAppState(data,reload){
    if(!data && getIsLocalFileSystem())
      throw "importAppState called without any data";
    if(!data)
      return;
    var parsed = JSON.parse(data);
    // this potentially can add lots of unused properties into the state that will be stored into html5 local storage and never deleted.
    cruTagGrid.store(parsed);
    if(reload)
      window.location.reload(false);
    return parsed;
  }
  onGenerateUrlClick(){
    var data = cruTagGrid.readOrDefault();
    var stringified = JSON.stringify(data);
    var baseUrl = window.location.origin + window.location.pathname;
    var url = baseUrl + exportToUrl("appGameState", stringified);
    this.setState({url:url,urlBase:baseUrl});
  }
  mergeSaveState(newData){
    return copyObject(this.state.saved,newData);
  }
  render(){
    var w = window,
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
    var clipper = createInputClipperButton("clipperText");
    // console.log('clipper', clipper);

    var heroMap = {};

    this.props.referenceData.crusaders.map(c =>{
      heroMap[c.heroId] = c;
    });
    window.networkDataJson = this.state.networkDataJson;
    window.crusaderGear = this.state.saved.crusaderGear;
    var importArea = getIsUrlLoaded() ? null : (<Exporter
                  maxWidth={maxWidth}
                  onImportTextChange={val => this.setState({textState:val})}
                  exportPretty={this.state.exportPretty || false}
                  onExportPrettyClick={e => this.setState({exportPretty:this.state.exportPretty === true ? false : true})}
                  // networkgame section?
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
                  onGenerateUrlClick={this.onGenerateUrlClick}
                  onImportAppStateFromUrlClick={() => {
                    gaEvent('import','gameState');
                    this.importAppState(importFromUrl("appGameState"),true);
                  }}
                  onUpdateClick={() => !getIsUrlLoaded() ?  this.setState({lastRead:cruTagGrid.readOrDefault(undefined)}): null}
                  clipper={clipper}
                  stateStyle={stateStyle}
                  json={this.state.lastRead}
                  importText={importText}
                  />);

    return (<div>
        <div>{JSON.stringify(this.state.error)}</div>

        <div className="onGreen">Install the extension to auto-load your data from <a href="https://chrome.google.com/webstore/detail/crusaders-automaton/dhlljphpeodbcliiafbedkbkiifdgdjk">Crusader Automaton</a></div>
      <Tabs selected={this.state.saved.mainSelectedTab} onTabChange={val => {
          gaEvent('navigation','click',val == 0? 'crusaders': val==1 ? 'talents': val==2 ? 'importexport' : 'unknown');
          this.changeSaveState({mainSelectedTab:val});
          }}>
        <Pane label="Crusaders">
          <div>
            <LegendaryReduction legendaryReductionDate={this.state.saved.legendaryReductionDate} />
            <CruTagGrid model={props.referenceData}
                        slotSort={this.state.saved.slotSort}
                        epSort={this.state.saved.epSort}
                        nameSort={this.state.saved.nameSort}
                        mode={this.state.saved.mode}
                        isEpMode={this.state.saved.isEpMode}
                        isGearMode={this.state.saved.isGearMode}
                        crusaderGear={this.state.saved.crusaderGear}
                        sharingIsCaring={this.state.saved.sharingIsCaring}
                        enchantmentPoints={this.state.saved.enchantmentPoints}
                        ownedCrusaderIds={this.state.saved.ownedCrusaderIds}
                        isBuildingFormation={this.state.saved.isBuildingFormation}
                        formationIds={this.state.saved.formationIds}
                        filterTags={this.state.saved.filterTags}
                        filterOwned={this.state.saved.filterOwned}
                        updateSave={this.changeSaveState} />
          </div>
        </Pane>
        <Pane label="Talents">
          <TalentCalc
            changeSaveState={this.changeSaveState}
            saved={this.state.saved}
            referenceData={this.props.referenceData}
            />
        </Pane>
        <Pane label="FormationCalc">
          <FormationCalc />
        </Pane>
        <Pane label="Extension and raw Import/Export">
          <div>
            {this.state.url? <div><a href={this.state.url}>{this.state.urlBase}</a></div> : null}
            {importArea}
          </div>
        </Pane>
        </Tabs>
        <div className="onGreen">
        </div>
      </div>);
  }
}

ReactDOM.render(
      <CruApp referenceData={jsonData} />,
        document.getElementById('crusaders_holder')
);

var exportCrusaderData = (refData,playerFields,refFields) =>{
  var data = cruTagGrid.readOrDefault();
  if(!(data!=null))
    throw Error("cruTagGrid data not found");
  if(!(refData != null))
    throw Error("jsonData not found");
  var crusaders = refData.crusaders;
  return crusaders.map(cru =>{
    var r = {};
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
window.exportCrusaderData = exportCrusaderData;
