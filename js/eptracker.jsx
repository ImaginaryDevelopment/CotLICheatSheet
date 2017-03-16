// data is in window.jsonData
// reference heroId data at http://pastebin.com/Bf5UgsBC
// reference lootId data at http://pastebin.com/vJNceSJZ

var TextAreaInput2 = props =>
(<textarea
name={props.name}
        className={addClasses(['form-control'],props.className)}
        type={props.type}
        value={props.value}
        defaultValue={props.defaultValue}
        placeholder={props.placeHolder}
        onChange={ e =>
            {
            if(props.onControlledChange){
                props.onControlledChange(e);
            }
            return debounceChange(props.onChange,e)
          }
        }
        onBlur={props.onBlur}
        {...props.spread} />
);

var TextInput2 = props =>
(<input
        name={props.name}
        className={addClasses(['form-control'],props.className)}
        type={props.type}
        value={props.value}
        defaultValue={props.defaultValue}
        placeholder={props.placeHolder}
        readOnly={props.readonly}
        onChange={ e =>
            {
            if(props.onControlledChange){
                props.onControlledChange(e);
            }
            return debounceChange(props.onChange,e)
          }
        }
        onBlur={props.onBlur}
        {...props.spread} />);

// looks uncontrolled, but is not under the hood. better user experience
var TextInputUnc = React.createClass({
  getInitialState(){
    return {value:this.props.value};
  },
  componentWillReceiveProps(nextProps){
    if(this.props.value !== nextProps.value && this.props.id !== nextProps.id){
      this.setState({value:nextProps.value});
    }
  },
  render(){
    var props = this.props;
    var state = this.state;
    return (<TextInput2
          name={props.name}
          defaultValue={props.defaultValue}
          value={state.value? state.value : ''}
          type={props.type}
          min={props.min}
          readonly={props.readonly}
          placeHolder={props.placeHolder}
          className={props.className}
          onControlledChange={e => this.setState({value: e.target.value})}
          onChange={e => props.onChange(e)}
          onBlur={e => e.target.value === '' ? {} : e.target.value = (+e.target.value)}
          spread={props.spread}
      />
      );
  }
});
var TextAreaInputUnc = React.createClass({
  getInitialState(){
    return {value:this.props.value};
  },
  componentWillReceiveProps(nextProps){
    if(this.props.value !== nextProps.value && this.props.id !== nextProps.id){
      this.setState({value:nextProps.value});
    }
  },
  render(){
    var props = this.props;
    var state = this.state;
    return (<TextAreaInput2
          name={props.name}
          className={props.className}
          defaultValue={props.defaultValue}
          value={state.value? state.value : ''}
          placeHolder={props.placeHolder}
          type={props.type}
          min={props.min}
          onControlledChange={e => this.setState({value: e.target.value})}
          onChange={e => props.onChange(e)}
          onBlur={e => e.target.value === '' ? {} : e.target.value = (+e.target.value)}
          spread={props.spread}
      />
      );
  }


});

// from https://toddmotto.com/creating-a-tabs-component-with-react/
var Tabs = React.createClass({
  displayName: 'Tabs',
  getDefaultProps(){
    return {selected:0};
  },
  getInitialState(){
    return {selected:this.props.selected};
  },
  handleClick(index,event){
    event.preventDefault();
    this.setState({
      selected: index
    });
  },
  _renderTitles(){
    function labels(child,index){
      var activeClass = this.state.selected === index ? 'activeTab':'';
      return(
        <li key={index}>
          <a href="#"
            onClick={this.handleClick.bind(this,index)}
            className={activeClass}
          >
            {child.props.label}
          </a>
        </li>
      );
    }
    return (<ul className="tabs__labels">
        {this.props.children.map(labels.bind(this))}
        </ul>
      );

  },
  _renderContent(){
    return (
      <div className="tabs__content">
        {this.props.children[this.state.selected]}
      </div>
    );
  },
  render(){
    return (
    <div className="tabs">
      {this._renderTitles()}
      {this._renderContent()}
    </div>);
  }
});
var Pane = React.createClass({
  displayName:'Pane',
  propTypes: {
    label: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  },
  render(){
    return(<div>{this.props.children}</div>);
  }
});

var getCrusaderDps = function(crusader){
  if (!crusader.upgrades){
    return "no data";
  }
  var alldps = crusader.upgrades.alldps ? crusader.upgrades.alldps.reduce(add) : 0;
  return crusader.upgrades.selfdps ? crusader.upgrades.selfdps.reduce(add) + +alldps : null;
};
var Filter = React.createClass({
  render:function(){
    // var filterClasses = this.props.on ? "fa fa-fw fa-filter active hoverShowClickable" : "fa fa-fw fa-filter hoverShowClickable";
        var filterClasses =
      this.props.on == 1 ? "fa fa-fw fa-filter active"
      : this.props.on == 0 || !(this.props.on != null) ? "fa fa-fw fa-filter" :
      "fa fa-fw fa-filter activeNegative";
    return (<i className={filterClasses} onClick={this.props.filterClick}></i>);
  }

});
var CheckBox = React.createClass({
  render:function(){
    return (<input type="checkbox" onChange={this.props.onChange} disabled={this.props.disabled} checked={this.props.checked} readOnly={this.props.readonly}  />)
  }
});
var TagsTd = React.createClass({
  render:function(){
      var self = this;
      var cru = this.props.crusader;
      var tags = [];
      this.props.missionTags.map(function(tag){
          var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag":"img_tag_off";
          var title = tag.displayName;
          switch (tag.id){
            case "dps":
              title += ':' + self.props.dps;
            break;
            case "event":
              if(cru.event){
                title += ":" + cru.event;
              }
            break;
          }
          tag.id === "dps" ? tag.displayName  : tag.displayName;
          var imgTag = (<img key={tag.id} src={self.props.baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
          if(tag.id === "event" && cru.eventLink){
            tags.push(<a key={tag.id} className="tooltip" href={cru.eventLink}>{imgTag}</a>);
          } else {
            tags.push(imgTag);
          }
      });
      return (<td key="tags" className="tags" data-key="tags">{tags}</td>);
  }
});
var CruTagRow = React.createClass({
    render: function () {
      var self = this;
      var cru = this.props.crusader;
      var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
      var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null;
      var isOwned = this.props.owned || cru.slot == cru.id && cru.slot < 21;
      var owned = null;
      var formation = null;
      var epBox = this.props.isEpMode && isOwned ? (
        <div className="ep"><TextInputUnc type="number" min="0" readonly={getIsUrlLoaded()} onChange={this.props.onEpChange} className={["medium"]} value={this.props.enchantmentPoints} />
          {this.props.effectiveEp && !Number.isNaN(this.props.effectiveEp) ? (<div className="sharedEp">Shared:{this.props.effectiveEp}</div>) : null}
        </div>)
        : null;
      // console.log('cruTagRow render', this.props.mode, this.props.isFormationMode, cru.slot, cru.id);
      if(this.props.mode === "mine" && this.props.isFormationMode){
        formation = (<td key="formation"><CheckBox checked={this.props.formationIds[cru.slot] == cru.id ? true: false} onChange={this.props.onFormationChange} />{epBox}</td>);
      } else if (this.props.mode === "mine" && !this.props.isFormationMode){
        if(cru.slot == cru.id && cru.slot < 21) {
          owned = (<td key="owned"><CheckBox checked={true} readonly={true} disabled={true} />{epBox}</td>);
        } else {
          if(!getIsUrlLoaded() || this.props.owned){
            owned = (<td key="owned"><CheckBox checked={this.props.owned} readonly={getIsUrlLoaded()} disabled={getIsUrlLoaded()} onChange={this.props.onOwnedChange} />{epBox}</td>);
          }
          else owned = (<td></td>)
        }
      }
      var link = cru.link && cru.link.indexOf('/') < 0 ? (self.props.wikibase + cru.link)
      : cru.link?
        cru.link
      : self.props.wikibase + cru.displayName.replace(" ","_");

      var cruGear = this.props.gear ? this.props.gear : {};
      if(cru.id==="15")
      console.log('cruGear for boxes', cruGear);
      var slotGear;
      // extract the 3 slots with qualities
      var cruGearQ = [cruGear["slot" + 0] || 0, cruGear["slot" + 1] || 0, cruGear["slot" + 2] || 0];
        if(cruGearQ[0] > 0 || cruGearQ[1] > 0 || cruGearQ[2] > 0){
          var makeBox = slot => {
            var itemRarityCompound = cruGearQ[slot];
            var rarity = !(itemRarityCompound != null) ? 0 : itemRarityCompound && typeof(itemRarityCompound) === "number" ? itemRarityCompound : itemRarityCompound[0];
            var golden = !(itemRarityCompound != null) || typeof(itemRarityCompound) != "string" || itemRarityCompound.length < 2 || itemRarityCompound[1] !== "g" ? "" : " golden";
            var classes = "rarity rarity" + rarity + golden;
            if(cru.id =="15")
            console.log('making box', slot, itemRarityCompound, rarity,golden,classes);
            return (<div className={classes} />);
          };
          slotGear = (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
        }
      var gearTd = null;
      if (this.props.mode ==="mine" && this.props.gearMode){
        var gearPossibilities = this.props.gearTypes;

        var options = gearPossibilities.map((g,i)=> (<option key={g} value={i}>{g}</option>));

        var makeSelect = slot => {
          // var slot = (typeof(slot) === "string" && slot.length > 1 ? slot[0] && +slot === slot ? +slot
          var itemInfo = cruGear["slot" + slot]? cruGear["slot" + slot]: 0;
          var rarity = !itemInfo ? 0 : (typeof(itemInfo) === "string" && itemInfo.length > 1 ? +itemInfo[0] : +itemInfo);
          // if(typeof(ItemInfo) !== "number"){
          //   console.log('making select for item with info', slot,itemInfo,rarity);
          // }

          return (<select key={"gear" + slot} value={rarity} onChange={e => this.props.onGearChange(cru.id, slot, e.target.value)} name={"slot" + slot}>{options}</select>);
        }
                    // <select key="gear0" onChange={e => this.props.onGearChange(cru.id, 0, e.target.value)} name="slot0">{options}</select>
                    // <select key="gear1" onChange={e => this.props.onGearChange(cru.id, 1, e.target.value)} name="slot1">{options}</select>
        gearTd = (<td key="gear" data-key="gear">
                    {makeSelect(0)}
                    {makeSelect(1)}
                    {makeSelect(2)}
                    </td>);

      }
      var tagsTd;
      // enable tags if mine mode is off, or gear mode is off
      if(this.props.mode !== "mine" || !this.props.gearMode ){
        tagsTd = (<TagsTd dps={this.props.dps} missionTags={this.props.missionTags} crusader={cru} baseUrl={baseUrl} />) ;
      }
      var tagColumn = tagsTd ? tagsTd : gearTd;
      var tagCountColumn = this.props.mode !== "mine" || !this.props.gearMode ? (<td key="tagcount" data-key="tagcount">{cru.tags.length}</td>) : null;
      var trClasses = cru.tags.indexOf('dps') >= 0 ? 'dps' : '';
      return (<tr className={trClasses}>
          {formation}
          {owned}
          <td key="slot" data-key="slot id" className={cru.tier > 1? "tier2" : null} title={JSON.stringify({Place:cru.id,HeroId:cru.heroId,tier2: cru.tier ===2})}>{cru.slot}{slotGear}</td>
          <td key="image" data-key="image">{image}</td>
          <td key="display" data-key="display"><a href={link}>{cru.displayName}</a></td>
          {tagColumn}
          {tagCountColumn}
      </tr>);
    }
});

var CruGridBody = props =>{
  var self = {props:props};
  var rows = props.sortedCrusaders
        .map(function(crusader){
        // console.log('mapping a crusader!');
        var owned = self.props.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var gear = props.crusaderGear ? props.crusaderGear[crusader.id]: [];
        var dps = getCrusaderDps(crusader);
        var otherSlotCrusaders = props.sortedCrusaders.filter(c => c.slot == crusader.slot && c.id != crusader.id).map(c => c.id);
        var otherEp = otherSlotCrusaders.map(cId => +props.enchantmentPoints[cId]).reduce((acc,val) => acc + (val || 0),0);
        // account for sharing is caring here, once you have it
        var sharingIsCaring = 6 + +(props.sharingIsCaringLevel || 0);
        // rounding via http://www.jacklmoore.com/notes/rounding-in-javascript/
        var rawSharedEp = (0.05 * sharingIsCaring * otherEp);
        var effectiveEp = Number(Math.round(rawSharedEp)) + +props.enchantmentPoints[crusader.id];

        return (<CruTagRow key={crusader.displayName}
          formationIds={props.formationIds}
          isEpMode={props.isEpMode}
          gearMode={props.isGearMode}
          gearTypes={props.referenceData.gearTypes}
          gear={gear}
          onGearChange={props.onGearChange}
          enchantmentPoints={props.enchantmentPoints[crusader.id]}
          effectiveEp={effectiveEp}
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
      }
    );
  return (
   <tbody>
    {rows}
    </tbody>);
};
// get most of the state out of here, so more display stuff can be attached, leave things that don't need to be stored in state
var CruTagGrid = React.createClass({

  slotSortClick:function(){
    var update = {slotSort: this.props.slotSort === "up" ? "desc":"up"};
    console.log('slotSortClick', ' was ' + this.props.slotSort, update);
    this.props.updateSave(update);
  },
  filterOwnedClick:function(){
    //(i + 2) % 3 - 1)
    var filterOwned = (this.props.filterOwned + 2) % 3 - 1;
    console.log(this.props.filterOwned,' will become ', filterOwned);
    this.props.updateSave({filterOwned: filterOwned});
  },
  onModeChangeClicked: function(){
    console.log('onModeChangeClicked');
    this.props.updateSave({mode:this.props.mode === "" ? "mine": ""});
  },
  onEpClick: function(){
    this.props.updateSave({isEpMode: this.props.isEpMode? false : true})
  },
  onIdolChange: function(val){
    this.props.updateSave({idols:val});
  },
  onFormationClick: function(){
    var saveMods = {isBuildingFormation: this.props.isBuildingFormation != null ? null : "formation"};
    console.log('formationClick', saveMods);
    this.props.updateSave(saveMods);
  },
  onGearClick: function(){
    var stateMods = {gearMode: this.state.gearMode? false: true};
    console.log('gearClick', stateMods);
    this.props.updateSave(stateMods);
  },
  onEpChange:function(crusaderId, epValue){
    console.log('onEpChange',arguments);
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
  },
  onFormationChange: function(crusader){
    console.log('formation change');
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
    console.log('formationIds changed to', newState);
    this.props.updateSave({formationIds:newState});
  },
  onOwnedChange:function(crusader){
    console.log('onOwnedChange');
    var owned = this.props.ownedCrusaderIds.slice(0);
    var i = owned.indexOf(crusader.id);
    console.log('i,owned',i,owned);
    if(i == -1){
      owned.push(crusader.id);
    } else {
      owned.splice(i,1);
    }
    this.props.updateSave({ownedCrusaderIds:owned});
  },
  onGearChange:function(cruId,slot,gearTypeIndex){
    console.log('onGearChange', cruId,slot, gearTypeIndex);
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
    stateMods.crusaderGear[cruId]["slot" + slot] = +gearTypeIndex;
    console.log('gearChangeMods', stateMods);
    this.props.updateSave(stateMods);
  },
  onFilterTag:function(tagId){
    var self = this;
    console.log('onFilterTag', tagId, self.props.filterTags);
    var tagFilter = {};
    Object.keys(this.props.filterTags).map(function(tagId){
      tagFilter[tagId] = self.props.filterTags[tagId] ? true : false;
    });
    tagFilter[tagId] = tagFilter[tagId] ? false : true;
    console.log('filterTags', tagFilter);
    this.props.updateSave({filterTags:tagFilter});
  },
  filterSortCrusaders(ownedCrusaderIds, filterOwned, filterTags, isBuildingFormation, formationIds, isDesc,crusaders){


  },
  render:function(){
  	console.info('rendering tag grid, react');
    var self = this;
    var totalCrusaders = this.props.model.crusaders.length;
    var isBuildingFormation = this.props.isBuildingFormation === "formation";
    var isMineMode = this.props.mode === "mine";
    // this may not be reliable, if any dirty data gets in the state from versioning changes
    var totalOwned = this.props.ownedCrusaderIds ? this.props.ownedCrusaderIds.length : '';
    var rows=[];
    var sortedCrusaders = this.props.slotSort === "up" ? this.props.model.crusaders : this.props.model.crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0;
    })
      .filter(function(crusader){
        var owned = self.props.ownedCrusaderIds.indexOf(crusader.id) != -1 || (crusader.slot == crusader.id && crusader.slot < 21);
        // var ownershipFilter = (owned || !self.state.filterOwned) || (crusader.slot == crusader.id && crusader.slot < 21);
        var ownershipFilter =
          (self.props.filterOwned == 0)
          || (self.props.filterOwned == 1 && (owned || (crusader.slot == crusader.id && crusader.slot < 21)))
          || (self.props.filterOwned == -1 && !owned);
        if(!ownershipFilter)
          console.log('ownershipFilter', self.props.filterOwned, owned, crusader.slot,crusader.id);
        var tagFilter =
          Object.keys(self.props.filterTags).map(function(tagId) {
            return !self.props.filterTags[tagId] || crusader.tags.indexOf(tagId) > -1;
          })
          .reduce(function(a,b){ return a && b},true);

        var formationFilter = !isBuildingFormation
          || //nothing in slot selected
            (!(self.props.formationIds[crusader.slot] != null)
            ||  // this one is not selected
            self.props.formationIds[crusader.slot] === crusader.id);
        var result = ownershipFilter && tagFilter && formationFilter;
        // console.log('filteringCheck',crusader.id,ownershipFilter, tagFilter, formationFilter, result);
        return result;

      });


    var tagCounts = [];
    var slotSortClasses = this.props.slotSort === "up" ? "fa fa-fw fa-sort-up" : "fa fa-fw fa-sort-desc";
    this.props.model.missionTags.map(function(tag){
        var count = self.props.model.crusaders.map(function (crusader){
            return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
        }).reduce(function(a,b){ return a + b;});
        var classes = "img_tag";
        if(self.props.filterTags[tag.id]){
          classes += " active";
        }
        tagCounts.push(<span key={tag.id} className={classes} title={tag.id} onClick={self.onFilterTag.bind(self,tag.id)}>{count}</span>);
    });

    var countDisplay = totalCrusaders === sortedCrusaders.length ? totalCrusaders : (sortedCrusaders.length + " of " + totalCrusaders);
    var formationRow;
    if(isMineMode){
      formationRow=(
        <tr>
          <th title={(this.props.idols && !isNaN(this.props.idols)? numberWithCommas(this.props.idols) + ' ' : '') +  "American or otherwise"}>Idols <TextInputUnc readonly={getIsUrlLoaded()} onChange={this.onIdolChange} value={this.props.idols} /></th>
          <th><CheckBox checked={this.props.isEpMode} onChange={this.onEpClick} />Track EP</th>
          <th colSpan="2"><CheckBox checked={isBuildingFormation} onChange={this.onFormationClick} /> Build Formation</th>
          <th><CheckBox checked={this.props.gearMode} onChange={this.onGearClick} />Track gear</th>
          <th></th>
        </tr>
      );
    }
    var tagsTh = !isMineMode || !this.props.gearMode ? (<th className="tags">Tags</th>) : null;
    var tagsTh2 = !isMineMode || !this.props.gearMode ? (<th className="tags clickable">{tagCounts}</th>) : null;
    var countsTh = !isMineMode || !this.props.gearMode? (<th>Counts</th>) : null;
    var sharingTh = isMineMode && this.props.isEpMode ?
    (<th colSpan="2">SharingIsCaring <TextInputUnc className={["medium"]} value={this.props.sharingIsCaringLevel} type="number" onChange={val => this.props.updateSave({sharingIsCaringLevel: +val})} /></th>): null;
    console.log('showing cruTagGrid with rowCount', rows.length);
    return (<table id="tab">
    <thead>
      <tr>
        { isMineMode && !isBuildingFormation ? <th>Owned <Filter on={this.props.filterOwned} filterClick={this.filterOwnedClick} /></th>
          : isMineMode && isBuildingFormation ? <th></th> : null}
        <th>Slot<i className={slotSortClasses} onClick={this.slotSortClick}></i></th>
        <th colSpan="2">Crusader</th>
        {tagsTh}
        <th></th>
      </tr>
      <tr>
        {isMineMode ? <th title="owned">{totalOwned}</th> : null}
        <th>(count:{countDisplay})</th><th colSpan="2"><CheckBox checked={isMineMode} onChange={this.onModeChangeClicked} />Mine</th>
        {tagsTh2}
        {countsTh}
      </tr>
      { formationRow }
      <tr><th /><th />{sharingTh}</tr>
      </thead>
      <CruGridBody
          sortedCrusaders={sortedCrusaders}
          ownedCrusaderIds={this.props.ownedCrusaderIds}
          crusaderGear={this.props.crusaderGear}
          enchantmentPoints={this.props.enchantmentPoints}
          sharingIsCaringLevel={this.props.sharingIsCaringLevel}
          formationIds={this.props.formationIds}
          isEpMode={this.props.isEpMode}
          isGearMode={this.props.gearMode}
          referenceData={this.props.model}
          onGearChange={this.onGearChange}
          isBuildingFormation={isBuildingFormation}
          mode={this.props.mode}
          onOwnedChange={this.onOwnedChange}
          onFormationChange={this.onFormationChange}
          onEpChange={this.onEpChange}

          />
      {/*{this.props.children}*/}
    </table>)
  }
});

// data pull
var HeroGameData = React.createClass({
  render(){
    console.log('rendering hero game data');
    //legacy data/usage would not have these in state (but also legacy data shouldn't be stored anywhere in prod)
    if(!this.props.mappedHeroes)
      return null;
    if(! this.props.mappedLoot)
      return null;

    var heroLIs =  this.props.mappedHeroes.map(h =>
      (<li data-key={h.HeroId} key={h.HeroId}>{JSON.stringify(h)}</li>)
    );
    var lootLIs = this.props.mappedLoot.map(l =>
      (<li data-key={l.lootId} key={l.lootId}>{JSON.stringify(l)}</li>)
    );

    // consider maping the parsed raw section collapsible at least at the highest level

    return (<div>
        <button onClick={() => this.props.onImportGameDataClick(this.props.mappedHeroes,this.props.mappedLoot)}>import</button>
        <Tabs>
          <Pane label="Heroes and EP">
            <div><div>{ heroLIs.length + " items"}</div>
              <ul>
                {heroLIs}
              </ul>
            </div>
          </Pane>
          <Pane label="Loot">
            <div><div>{lootLIs.length + " loot items"}</div>
            <ul>
              {lootLIs}
              </ul>
            </div>
          </Pane>
          <Pane label="Parsed Raw">
              <pre>{JSON.stringify(this.props.data,null,2)}</pre>
          </Pane>
        </Tabs>
    </div>);
  }
});
var LegendaryReduction = props =>
props.legendaryReductionDate ?
  (<div className="onGreen">Legendary Cost Reduction at {props.legendaryReductionDate.toLocaleString()}</div>)
  : null


var Exporter = props =>
(
  <div>
  <button onClick={props.onHideClick}>Hide Exporter</button>
  <Tabs>
    <Pane label="Import/Export">
      <div>
      <button onClick={ () => props.onImportAppStateFromUrlClick()}>Import AppStateFrom Url</button>
      <button onClick={ props.onGenerateUrlClick}>Generate AppState Url</button>
      <TextAreaInputUnc className={'fullwidth'} onChange={props.onImportTextChange} placeHolder='{"slotSort":"up","mode":"mine","isEpMode":true,"enchantmentPoints":'/>
      <button onClick={props.onImportSiteStateClick} >{props.importText}</button>
      {getIsUrlLoaded() ? null : <button onClick={props.onUpdateClick}>Update Export Text</button> }
      {/*<button onClick={props.toggleAppStateVisibility}>Toggle AppState Visibility</button>*/}
      <div title="export text" id="clipperText" style={props.stateStyle}>{props.json}</div>
      {props.clipper}
      </div>
    </Pane>
    <Pane label="Network-Data Importer">
      <div>
        <TextAreaInputUnc onChange={props.onNetworkDataTextInputChange} value={props.networkDataRaw} placeHolder='{"success":true,"details":{"abilities":{' className={'fullwidth'} />
        <button onClick={props.onLoadNetworkDataClick}>Parse game data</button>
        <button onClick={props.onClearGameDataParseClick}>Clear Parsed Game Data</button>
        {props.networkDataJson? (<HeroGameData heroMap={props.heroMap} crusaders={props.crusaders} data={props.networkDataJson} crusaderReferenceData={props.crusaderReferenceData} mappedHeroes={props.mappedHeroes} mappedLoot={props.mappedLoot} onImportGameDataClick={props.onImportGameDataClick} />) : null}
    </div>
      </Pane>
    </Tabs>
    </div>
);
var provideSavedDefaults = saved => {
    if(!(saved.slotSort != null))
      saved.slotSort = "up";
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

var CruApp = React.createClass({
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
  },
  componentDidUpdate:function(prevProps, prevState){
    if(prevState.saved != this.state.saved){
      cruTagGrid.store(this.state.saved);
      window.saved = this.state.saved;
    }
  },
  // network-data importer
  loadNetworkData(){
    if(!this.state.networkDataRaw){
      return;
    }
    var json;
    try{
      json = JSON.parse(this.state.networkDataRaw);
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
    this.props.jsonData.crusaders.map(c =>{
      heroMap[c.heroId] = c;
    });
    var legendaryReductionDate = json && json.details && json.details.stats && json.details.stats.legendary_reduction_date ? new Date(+json.details.stats.legendary_reduction_date * 1000): null;

      // account for pasting just the heroes section of json, or the whole data packet
      var heroesSection = (json.heroes) || (json.details && json.details.heroes);
      var mappedHeroes = parseNetworkDataHeroesSection(heroMap, heroesSection);
      var mappedLoot = parseLoot(this.props.jsonData.crusaders,(json.loot) || (json.details && json.details.loot));

      window.heroMap = this.props.heroMap;
      this.setState({networkDataJson:json, mappedLoot:mappedLoot, mappedHeroes:mappedHeroes,saved:this.mergeSaveState({legendaryReductionDate: legendaryReductionDate})});
  },
  onClearGameDataParseClick(){
    console.log('onClearGameDataParseClick');
    this.setState({networkDataJson:null});
  },
  // network data merge method
  onImportGameDataClick(heroes,loot){
    // heroes looks like this:
    // return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
    var cruTagGridData = cruTagGrid.readOrDefault(undefined);
    var data = copyObject(cruTagGridData);
    try
    {
      var ownedCrusaderIds = heroes.filter(h => h.Owned).map(h => this.props.jsonData.crusaders.filter(c => c.heroId == h.HeroId)[0].id);
      data.ownedCrusaderIds = ownedCrusaderIds;
      var ep = {}
      heroes.filter(h => h.Owned).map(h => {
        var crusader = this.props.jsonData.crusaders.filter(c => c.heroId == h.HeroId)[0];
        ep[crusader.id] = h.Ep;
      });
      data.enchantmentPoints = ep;
    }
    catch (ex){
      console.error('could not import hero game data', ex);
    }
    // loot looks like this:
    // {heroBenchSlot : x.crusader.slot,heroName: x.crusader.displayName, heroSlotId : x.crusader.id, slot: x.lootItem.slot, lootId : x.lootItem.lootId, rarity: x.lootItem.rarity,countOrLegendaryLevel:x.lootItem.count})
    // merged should look like this :
    // crusaderGear:{"01":{"slot0":4,"slot1":4,"slot2":4},
    if(loot && Array.isArray(loot)){
      tryPullLootData(data);
    }
    cruTagGrid.store(data);
    this.setState({saved:data});
  },
  onImportSiteStateClick(){
    console.log('onImportSiteStateClick',arguments);
    // this does an overwrite, not a merge, perhaps allow a merge button?
    if(this.state.textState){
      // not 2, because if the index is 2 it could be {"ownedCrusaderIds"} which isn't a partial load
      if(this.state.textState.indexOf('ownedCrusaderIds') == 0 || this.state.textState.indexOf('ownedCrusaderIds') == 1){
        // special load from the .linq script, not direct game data, or page state
        var data = JSON.parse("{" + this.state.textState + "}");
        // shouldn't this be updating save state? ownedCrusaderIds was being stored in CruTagGrid, why does this say self state, instead of this.state.saveData or something?
        this.changeSaveState({ownedCrusaderIds:data.ownedCrusaderIds});
      } else {
        var data = JSON.parse(this.state.textState);
        cruTagGrid.store(data);
        this.changeSaveState({saved:data});
      }
    }
    // wipe out saved data
    else{
      cruTagGrid.store(undefined);
      this.setState({saved:{}});
    }
  },
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
  },
  onGenerateUrlClick(){
    var data = cruTagGrid.readOrDefault();
    var stringified = JSON.stringify(data);
    var baseUrl = window.location.origin + window.location.pathname;
    var url = baseUrl + exportToUrl("appGameState", stringified);
    this.setState({url:url,urlBase:baseUrl,showImportExport:false});
  },
  mergeSaveState(newData){
    return copyObject(this.state.saved,newData);
  },
  changeSaveState(newData){
    var merged = this.mergeSaveState(newData);
    console.log('changeSaveState',merged);
    this.setState({saved: merged});
  },
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
    var clipper = null;
    var json = JSON.stringify(this.state.lastRead);
    if(Clipboard && Clipboard.isSupported()){
      clipper = (<button className="btn" data-clipboard-target="#clipperText">Copy to Clipboard</button>);
    }
    var toggleHide = () =>
      this.setState({showImportExport:(this.state.showImportExport ? false : true)});
    var heroMap = {};

    this.props.jsonData.crusaders.map(c =>{
      heroMap[c.heroId] = c;
    });
    window.networkDataJson = this.state.networkDataJson;
    var importArea = getIsUrlLoaded() ? null : this.state.showImportExport ?
      (<Exporter  onHideClick={toggleHide}
                  maxWidth={maxWidth}
                  onImportTextChange={val => this.setState({textState:val})}
                  // networkgame section?
                  onNetworkDataTextInputChange={val => { console.log("setting networkDataRaw"); this.setState({networkDataRaw:val});}}
                  onLoadNetworkDataClick={this.loadNetworkData}
                  networkDataRaw={this.state.networkDataRaw}
                  networkDataJson={this.state.networkDataJson}
                  heroMap={heroMap}
                  crusaders={props.jsonData.crusaders}
                  onImportGameDataClick={this.onImportGameDataClick}
                  onClearGameDataParseClick={this.onClearGameDataParseClick}
                  mappedLoot={this.state.mappedLoot}
                  mappedHeroes={this.state.mappedHeroes}
                  // network game section end?
                  onImportSiteStateClick={this.onImportSiteStateClick}
                  onGenerateUrlClick={this.onGenerateUrlClick}
                  onImportAppStateFromUrlClick={() => this.importAppState(importFromUrl("appGameState"),true)}
                  onUpdateClick={() => !getIsUrlLoaded() ?  this.setState({lastRead:cruTagGrid.readOrDefault(undefined)}): null}
                  clipper={clipper}
                  stateStyle={stateStyle}
                  json={json}
                  importText={importText}
                  />) :
      ( <button onClick={toggleHide}>Show Import/Export </button>);
    return (<div>
    <LegendaryReduction legendaryReductionDate={this.state.saved.legendaryReductionDate} />

        <CruTagGrid model={props.jsonData}
                    slotSort={this.state.saved.slotSort}
                    mode={this.state.saved.mode}
                    isEpMode={this.state.saved.isEpMode}
                    sharingIsCaringLevel={this.state.saved.sharingIsCaringLevel}
                    enchantmentPoints={this.state.saved.enchantmentPoints}
                    ownedCrusaderIds={this.state.saved.ownedCrusaderIds}
                    isBuildingFormation={this.state.saved.isBuildingFormation}
                    formationIds={this.state.saved.formationIds}
                    filterTags={this.state.saved.filterTags}
                    filterOwned={this.state.saved.filterOwned}
                    idols={this.state.saved.idols}
                    updateSave={this.changeSaveState}>
        </CruTagGrid>
        <div>{JSON.stringify(this.state.error)}</div>
        <div className="onGreen">
        {importArea}
          {this.state.url? <div><a href={this.state.url}>{this.state.urlBase}</a></div> : null}
        </div>
      </div>);
  }
});

// ReactDOM.render(
//   <App />,
//   document.getElementById('crusaders_holder')
// );
ReactDOM.render(
      <CruApp jsonData={jsonData} />,
        document.getElementById('crusaders_holder')
);