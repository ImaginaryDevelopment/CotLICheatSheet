// data is in window.jsonData
// reference heroId data at http://pastebin.com/Bf5UgsBC
// reference lootId data at http://pastebin.com/vJNceSJZ
var loggedStorageFailure = false;
const isDefined = function(o){
    return typeof(o) !== 'undefined' && o !== null;
};
const copyObject = (source,toMerge) => {
    var target = toMerge ? toMerge : {};
    Object.keys(source).map(function(prop){
      target[prop] = source[prop];
    });
    return target;
};
const trim = function(s) {
    return s.trim();
};
const debounce = (function(){
        var timer = 0;
        return (function(callback, ms){
            if(typeof(callback) !== "function")
                throw callback;
            // this method does not ever throw, or complain if passed an invalid id
            clearTimeout(timer);
            timer = setTimeout(callback,ms); //setTimeout(callback,ms);
        });
    })();
var debounceChange = function (callback, e, ...args) {
    if(!isDefined(callback)){
        console.info('no callback for debounceChange',e.target, typeof(callback),callback);
        return;
    }
    e.persist();
    args.unshift(e.target.value);
    debounce(() => callback(...args), 500);
};
// reworked without let, since the browser support for it is low
const flattenArrays = (a,b) => {
        var isAa = Array.isArray(a),isAb = Array.isArray(b);
        if(isAa && !isAb){
            var result1 = a.slice(0);
            result1.push(b);
            return result1;
        }
        if(isAa && isAb){
            return a.concat(b);
        }
        if(!isAa && isAb){
            var result2 = [a].concat(b);
            return result2;
        }
        return [a,b];
    };
// otherClasses: allows/adapts to inputs of type string or array
const addClasses = (defaultClasses=[], otherClasses=[]) =>{
    var unwrappedClasses = defaultClasses.reduce(flattenArrays,[]);
    var otherClassesX = Array.isArray(otherClasses) ? otherClasses : otherClasses.split(" ");
    unwrappedClasses = otherClassesX.reduce(flattenArrays,[]).concat(unwrappedClasses);
    return unwrappedClasses.filter(isDefined).map(trim).join(' ').trim();
};
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
function getIsLocalStorageAvailable() {
  if (typeof(localStorage) !== 'undefined' && (typeof(localStorage.setItem) === 'function') && typeof(localStorage.getItem) === 'function'){
    return true;
  }
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
    console.info('storage is available!');
		return true;
	}
	catch(e) {
    if(!loggedStorageFailure){
      loggedStorageFailure = true;
      console.info('failed to test storage available');
    }
		return false;
	}
}
var storeIt = function(key,value){
  var canStore = getIsLocalStorageAvailable();
  if(canStore){
    var stringy = JSON.stringify(value);
    //console.info('storing:' + key,value);
    localStorage.setItem(key,stringy);
  }
};
var readIt = function(key,defaultValue){
  if(getIsLocalStorageAvailable()){
    var item = localStorage.getItem(key);
    if(typeof(item) !== 'undefined' && item != null){
      console.info("read item from localStorage", key,item);
      try{
        return JSON.parse(item);
      }
      catch (ex)
      {
        return defaultValue;
      }
    } else {
      return defaultValue;
    }
  } else {
    return defaultValue;
  }
};
var add = function(a,b){
  return a + b;
};
var getCrusaderDps = function(crusader){
  if (!crusader.upgrades){
    return "no data";
  }
  var alldps = crusader.upgrades.alldps ? crusader.upgrades.alldps.reduce(add) : 0;
  return crusader.upgrades.selfdps ? crusader.upgrades.selfdps.reduce(add) + +alldps : null;
};
var Filter = React.createClass({
  render:function(){
    var filterClasses = this.props.on ? "fa fa-fw fa-filter active hoverShowClickable" : "fa fa-fw fa-filter hoverShowClickable";
    return (<i className={filterClasses} onClick={this.props.filterClick}></i>);
  }

});
var CheckBox = React.createClass({
  render:function(){
    return (<input type="checkbox" onChange={this.props.onChange}  disabled={this.props.disabled} checked={this.props.checked} readOnly={this.props.readonly}  />)
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
      var epBox = this.props.epMode && isOwned ? (<div className="ep"><TextInputUnc type="number" min="0" onChange={this.props.onEpChange} className={["medium"]} value={this.props.enchantmentPoints} /><div className="sharedEp">Shared:{this.props.effectiveEp}</div></div>) : null;
      if(this.props.mode === "mine" && this.props.isFormationMode){
        formation = (<td key="formation"><CheckBox checked={this.props.formationIds[cru.slot] == cru.id ? true: false} onChange={this.props.onFormationChange} />{epBox}</td>);
      } else if (this.props.mode === "mine" && !this.props.isFormationMode){
        if(cru.slot == cru.id && cru.slot < 21){
          owned = (<td key="owned"><CheckBox checked={true} readonly={true} disabled={true} />{epBox}</td>);
        } else {
          owned = (<td key="owned"><CheckBox checked={this.props.owned} onChange={this.props.onOwnedChange} />{epBox}</td>);
        }
      }
      var link = cru.link && cru.link.indexOf('/') < 0 ? (self.props.wikibase + cru.link)
      : cru.link?
        cru.link
      : self.props.wikibase + cru.displayName.replace(" ","_");

      var cruGear = this.props.gear ? this.props.gear : {};
      var slotGear;
      // extract the 3 slots with qualities
      var cruGearQ = [cruGear["slot" + 0] || 0, cruGear["slot" + 1] || 0, cruGear["slot" + 2] || 0];
        if(cruGearQ[0] > 0 || cruGearQ[1] > 0 || cruGearQ[2] > 0){
          var makeBox = slot => {
            return (<div className={"rarity rarity" + cruGearQ[slot]} />);
          };
          slotGear = (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
        }
      var gearTd = null;
      if (this.props.mode ==="mine" && this.props.gearMode){
        var gearPossibilities = this.props.gearTypes;

        var options = gearPossibilities.map((g,i)=> (<option key={g} value={i}>{g}</option>));

        var makeSelect = slot => (<select key={"gear" + slot} value={cruGear["slot" + slot]? +cruGear["slot" + slot]: 0} onChange={e => this.props.onGearChange(cru.id, slot, e.target.value)} name={"slot" + slot}>{options}</select>);
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
          <td key="slot" data-key="slot id" className={cru.tier > 1? "tier2" : null} title={cru.id}>{cru.slot}{slotGear}</td>
          <td key="image" data-key="image">{image}</td>
          <td key="display" data-key="display"><a href={link}>{cru.displayName}</a></td>
          {tagColumn}
          {tagCountColumn}
      </tr>);
    }
});
var cruTagGridKey = "cruTagGrid"
function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
var CruTagGrid = React.createClass({
  getInitialState:function(){
    var defaultValue = {slotSort:"up",mode:"",epMode:false,sharingIsCaringLevel:0,enchantmentPoints:{},filterOwned:false,ownedCrusaderIds:[], formation:null, filterTags:{}, formationIds:{}};
    // json.stringify this whole thing to make input/html5 storage data
    var init = readIt(cruTagGridKey, defaultValue);
    if(init != null){
      console.log('initRaw', init);

    } else {
      init = defaultValue;
    }
    var toRemove=[];
    init.ownedCrusaderIds.sort();
    var x = init.ownedCrusaderIds;
    x.sort();
    for(var i = 0; i < x.length; i++){
      var value = x[i];

      if(typeof(value) === "number" || value.length < 2 || value.length > 3 || x.indexOf(value,i + 1) >= 0){
        console.log('removing ownedId', value, 'index', i,'dupAt',  x.indexOf(value, i + 1));
        toRemove.push(value);
      }
    }
    toRemove.map(v => x.splice(x.indexOf(v),1));

    for(var i = 1; i <= 20; i++)
    {
      var proposedValue = padLeft(i,2);
      if(x.indexOf(proposedValue) < 0){
        x.push(proposedValue);
      }
    }
    x.sort();
    console.log('init ownedIds',x, x.length);

    if(typeof(init.filterTags) === "undefined"){
      init.filterTags = {};
    }
    if(typeof(init.formationIds) === "undefined"){
      init.formationIds = {};
    }
    if(typeof(init.enchantmentPoints) === "undefined"){
      init.enchantmentPoints = {};
    }
    console.log('initialState', init);
    window.state = init;
    return init;
  },
  componentDidUpdate:function(prevProps, prevState){
    storeIt("cruTagGrid",this.state);
    window.state = this.state;
  },
  slotSortClick:function(){
    this.setState({slotSort: this.state.slotSort === "up" ? "desc":"up"});
  },
  filterOwnedClick:function(){
    this.setState({filterOwned: !this.state.filterOwned});
  },
  onModeChangeClicked: function(){
    this.setState({mode:this.state.mode === "" ? "mine": ""});
  },
  onIdolChange: function(val){
    this.setState({Idols:val});
  },
  onFormationClick: function(){
    var stateMods = {formation:this.state.formation != null ? null : "formation"};
    console.log('formationClick', stateMods);
    this.setState(stateMods);
  },
  onEpClick: function(){
    var stateMods = {epMode:this.state.epMode? false:true};
    console.log('epClick',stateMods);
    this.setState(stateMods);
  },
  onGearClick: function(){
    var stateMods = {gearMode: this.state.gearMode? false: true};
    console.log('gearClick', stateMods);
    this.setState(stateMods);
  },
  onEpChange:function(crusaderId, epValue){
    console.log('onEpChange',arguments);
    var oldEp = this.state.enchantmentPoints;
    var newEp = {};
    for(var attr in oldEp){
      if (oldEp.hasOwnProperty(attr)) {
        newEp[attr] = oldEp[attr];
      }
    }
    newEp[crusaderId] = epValue;
    var stateMods = {enchantmentPoints:newEp};
    this.setState(stateMods);
  },
  onFormationChange: function(crusader){
    console.log('formation change');
    var oldState = this.state.formationIds;
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
    this.setState({formationIds:newState});
  },
  onOwnedChange:function(crusader){
    console.log('onOwnedChange');
    var owned = this.state.ownedCrusaderIds.slice(0);
    var i = owned.indexOf(crusader.id);
    console.log('i,owned',i,owned);
    if(i == -1){
      owned.push(crusader.id);
    } else {
      owned.splice(i,1);
    }
    this.setState({ownedCrusaderIds:owned});
  },
  onGearChange:function(cruId,slot,gearTypeIndex){
    console.log('onGearChange', cruId,slot, gearTypeIndex);
    var stateMods = {};
    if(!this.state.crusaderGear){
      stateMods.crusaderGear = {};
    } else {
      var merged = copyObject(this.state.crusaderGear);
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
    this.setState(stateMods);
  },
  onFilterTag:function(tagId){
    var self = this;
    console.log('onFilterTag', tagId, self.state.filterTags);
    var tagFilter = {};
    Object.keys(this.state.filterTags).map(function(tagId){
      tagFilter[tagId] = self.state.filterTags[tagId] ? true : false;
    });
    tagFilter[tagId] = tagFilter[tagId] ? false : true;
    console.log('filterTags', tagFilter);
    this.setState({filterTags:tagFilter});
  },
  render:function(){
  	console.info('rendering tag grid, react');
    var self = this;
    var rows=[];
    var totalCrusaders = this.props.model.crusaders.length;
    // this may not be reliable, if any dirty data gets in the state from versioning changes
    var totalOwned = this.state.ownedCrusaderIds? this.state.ownedCrusaderIds.length : '';
    var sortedCrusaders = this.state.slotSort === "up" ? this.props.model.crusaders : this.props.model.crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0;
    });
    sortedCrusaders
      .filter(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var ownershipFilter = owned || !self.state.filterOwned || (crusader.slot == crusader.id && crusader.slot < 21);
        var tagFilter =
          Object.keys(self.state.filterTags).map(function(tagId) {
            return !self.state.filterTags[tagId] || crusader.tags.indexOf(tagId) > -1;
          })
          .reduce(function(a,b){ return a && b},true);

        var formationFilter = self.state.formation !== "formation"
          || //nothing in slot selected
            (!(self.state.formationIds[crusader.slot] != null)
            ||  // this one is not selected
            self.state.formationIds[crusader.slot] === crusader.id);
        return ownershipFilter && tagFilter && formationFilter;

      })
      .map(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var gear = self.state.crusaderGear ? self.state.crusaderGear[crusader.id]: [];
        var dps = getCrusaderDps(crusader);
        var otherSlotCrusaders = sortedCrusaders.filter(c => c.slot == crusader.slot && c.id != crusader.id).map(c => c.id);
        var otherEp = otherSlotCrusaders.map(cId => +self.state.enchantmentPoints[cId]).reduce((acc,val) => acc + (val || 0),0);
        // account for sharing is caring here, once you have it
        var sharingIsCaring = 6 + +(self.state.sharingIsCaringLevel || 0);
        // rounding via http://www.jacklmoore.com/notes/rounding-in-javascript/
        var rawSharedEp = (0.05 * sharingIsCaring * otherEp);
        var effectiveEp = Number(Math.round(rawSharedEp)) + +self.state.enchantmentPoints[crusader.id];

        rows.push(<CruTagRow key={crusader.displayName}
          formationIds={self.state.formationIds}
          epMode={self.state.epMode}
          gearMode={self.state.gearMode}
          gearTypes={self.props.model.gearTypes}
          gear={gear}
          onGearChange={self.onGearChange}
          enchantmentPoints={self.state.enchantmentPoints[crusader.id]}
          effectiveEp={effectiveEp}
          onEpChange={self.onEpChange.bind(null,crusader.id)}
          isFormationMode={self.state.formation === "formation"}
          wikibase={self.props.model.wikibase}
          crusader={crusader}
          dps={dps}
          owned={owned}
          missionTags={self.props.model.missionTags}
          mode={self.state.mode}
          onOwnedChange={self.onOwnedChange.bind(self,crusader)}
          onFormationChange={self.onFormationChange.bind(self,crusader)} />);
      }
    );
    var tagCounts = [];
    var slotSort = this.state.slotSort === "up" ? "fa fa-fw fa-sort-up" : "fa fa-fw fa-sort-desc";
    this.props.model.missionTags.map(function(tag){
        var count = self.props.model.crusaders.map(function (crusader){
            return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
        }).reduce(function(a,b){ return a + b;});
        var classes = "img_tag";
        if(self.state.filterTags[tag.id]){
          classes += " active";
        }
        tagCounts.push(<span key={tag.id} className={classes} title={tag.id} onClick={self.onFilterTag.bind(self,tag.id)}>{count}</span>);
    });

    var countDisplay = totalCrusaders === rows.length ? totalCrusaders : (rows.length + " of " + totalCrusaders);
    var filterOwnedClasses = this.state.filterOwned ? "fa fa-fw fa-filter active" : "fa fa-fw fa-filter";
    var formationRow;
    if(this.state.mode === "mine"){
      formationRow=(
        <tr>
          <th title="American or otherwise">Idols <TextInputUnc onChange={this.onIdolChange} value={this.state.Idols} /></th>
          <th><CheckBox checked={this.state.epMode} onChange={this.onEpClick} />Track EP</th>
          <th colSpan="2"><CheckBox checked={this.state.formation === "formation"} onChange={this.onFormationClick} /> Build Formation</th>
          <th><CheckBox checked={this.state.gearMode} onChange={this.onGearClick} />Track gear</th>
          <th></th>
        </tr>
      );
    }
    var tagsTh = this.state.mode !== "mine" || !this.state.gearMode ? (<th className="tags">Tags</th>) : null;
    var tagsTh2 = this.state.mode !== "mine" || !this.state.gearMode ? (<th className="tags clickable">{tagCounts}</th>) : null;
    var countsTh = this.state.mode !== "mine" || !this.state.gearMode? (<th>Counts</th>) : null;
    var sharingTh = this.state.mode ==="mine" && this.state.epMode ?
    (<th colSpan="2">SharingIsCaring <TextInputUnc className={["medium"]} value={this.state.sharingIsCaringLevel} onChange={val => this.setState({sharingIsCaringLevel: +val})} /></th>): null;
    return (<table id="tab">
    <thead>
      <tr>
        { this.state.mode === "mine" && this.state.formation !== "formation" ? <th>Owned <Filter on={this.state.filterOwned} filterClick={this.filterOwnedClick} /></th>
          : this.state.mode ==="mine" && this.state.formation ==="formation" ? <th></th> : null}
        <th>Slot<i className={slotSort} onClick={this.slotSortClick}></i></th>
        <th colSpan="2">Crusader</th>
        {tagsTh}
        <th></th>
      </tr>
      <tr>
        {this.state.mode === "mine" ? <th>{totalOwned}</th> : null}
        <th>(count:{countDisplay})</th><th colSpan="2"><CheckBox checked={this.state.mode === "mine"} onChange={this.onModeChangeClicked}  />Mine</th>
        {tagsTh2}
        {countsTh}
      </tr>
      { formationRow }
      <tr><th /><th />{sharingTh}</tr>
      </thead>
    <tbody>
    {rows}
    </tbody>
    </table>)
  }
});
var parseLoot = (crusaders,lootData) =>{
        console.log('attempting to parse loot');
        var refC = crusaders;
        var lootComparer = (a,b) =>{
          if(a.heroBenchSlot > b.heroBenchSlot)
            return 1;
          if(a.heroBenchSlot < b.heroBenchSlot)
            return -1;
          if(a.heroId > b.heroId)
            return 1;
          if(a.heroId < b.heroId)
            return -1;
          if(a.lot != null && !(b.slot != null))
            return 1;
          if(!(a.lot != null) && b.slot != null)
            return -1;
          if(a.slot > b.slot)
            return 1;
          if(a.slot < b.slot)
            return -1;

          return 0;
        };
        var lootMapped =
          lootData
            .map(l =>
            {
              var crusader = refC.find(cru => cru.loot.find(cl => cl.lootId == l.loot_id));
              var lootItem = crusader && crusader.loot.find(cl => cl.lootId == l.loot_id);
              // console.log('lootDataMap',l, crusader,lootItem);

              return {loot:l, crusader:crusader,lootItem:lootItem};
            })
            .filter(l => l.crusader != null)
            .map(x => (
              {heroBenchSlot : x.crusader.slot,heroName: x.crusader.displayName, heroId : x.crusader.heroId, slot: x.lootItem.slot, lootId : x.lootItem.lootId, rarity: x.lootItem.rarity})
            ).sort(lootComparer);
          console.log('lootMapped',lootMapped);
          return lootMapped;
};

var parseNetworkDataHeroesSection = (heroMap, heroes) => {
  console.log('parseNetworkDataHeroesSection', heroes.length);
    var mapped = Array.isArray(heroes) ?
      heroes.map(h => {
        var crusader;
        try{
          crusader = heroMap[h.hero_id];
        } catch(ex)
        {
          console.error('failed to parse',h,ex);
        }
        return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
        }
      ) : [];
    return mapped;
};
// data pull
var HeroGameData = React.createClass({
  render(){
    console.log('rendering hero game data');

    // does not yet account for loot data contained in data.loot
    // account for pasting just the heroes section of json, or the whole data packet
    var heroesSection = (this.props.data && this.props.data.heroes) || (this.props.data && this.props.data.details && this.props.data.details.heroes);
    var mappedHeroes = parseNetworkDataHeroesSection(this.props.heroMap, heroesSection);
    var mappedLoot = parseLoot(this.props.crusaders,(this.props.data && this.props.data.loot) || (this.props.data && this.props.data.details && this.props.data.details.loot));

    window.heroMap = this.props.heroMap;


    var heroLIs =  mappedHeroes.map(h =>
      (<li data-key={h.HeroId} key={h.HeroId}>{JSON.stringify(h)}</li>)
    );
    var lootLIs = mappedLoot.map(l =>
      (<li data-key={l.lootId} key={l.lootId}>{JSON.stringify(l)}</li>)
    );
    //return (<li data-key={h.hero_id} key={h.hero_id}>{JSON.stringify({Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false})}</li>);

    return (<div>
        <button onClick={() => this.props.onImportGameDataClick(mappedHeroes,mappedLoot)}>import</button>
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

var Exporter = props =>
(
  <div>
  <button onClick={props.onHideClick}>Hide Exporter</button>
  <Tabs>
    <Pane label="Import/Export">
      <div>
      <TextAreaInputUnc className={'fullwidth'} onChange={props.onTextChange} placeHolder='{"slotSort":"up","mode":"mine","epMode":true,"enchantmentPoints":'/>
      <button onClick={props.onSetClick} >{props.importText}</button>
      <button onClick={props.onUpdateClick}>Update Export Text</button>
      {props.clipper}
      <div title="export text" id="clipperText" style={props.stateStyle}>{props.json}</div>
      </div>
    </Pane>
    <Pane label="Network-Data Importer">
      <div>
        <TextAreaInputUnc onChange={props.onGameTextInputChange} value={props.gameRaw} placeHolder='{"success":true,"details":{"abilities":{' className={'fullwidth'} />
        <button onClick={props.onLoadGameDataClick}>Parse game data</button>
        <button onClick={props.onClearGameDataParseClick}>Clear Parsed Game Data</button>
        {props.gameJson? (<HeroGameData heroMap={props.heroMap} crusaders={props.crusaders} data={props.gameJson} crusaderReferenceData={props.crusaderReferenceData} onImportGameDataClick={props.onImportGameDataClick} />) : null}
    </div>
      </Pane>
    </Tabs>
    </div>
);
// var ImportExporter = React.createClass({

// });
var CruApp = React.createClass({
  getInitialState(){
    var read= readIt(cruTagGridKey,undefined);
    var state = {lastRead:read};
    // this is convienent for dev, but should it really stay here in prod?
    var gameDataJson = readIt("gameDataJson",undefined);
    state.gameJson=gameDataJson;
    if (Clipboard)
    {
      state.clipboard = new Clipboard('.btn');
    }
    return state;
  },
  // import/exporter NOT network-data importer
  loadGameData(){
    if(!this.state.gameText){
      return;
    }
    var json;
    try{
      json = JSON.parse(this.state.gameText);
      console.log('parse success');
    } catch (ex){
      console.error(ex);
      this.setState({error:ex});
    }
    if(json){
      storeIt("gameDataJson",json);
      this.setState({gameJson:json});
    }
  },
  onClearGameDataParseClick(){
    console.log('onClearGameDataParseClick');
    this.setState({gameJson:null});
  },
  // network data merge method
  onImportGameDataClick(heroes,loot){
    // heroes looks like this:
    // return {Name:crusader && crusader.displayName,Slot:(crusader && crusader.id),HeroId:h.hero_id,Ep:h.disenchant,Owned:h.owned?true:false};
    var cruTagGrid = readIt(cruTagGridKey,undefined);
    var data = copyObject(cruTagGrid);
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
    if(loot && Array.isArray(loot)){
      try{
        console.log('loot merge step not implemented')


      } catch(ex){
          console.error('could not import loot game data', ex);
      }
    }
    storeIt(cruTagGridKey,data);
    window.location.reload(false);

  },
  onSetClick(){
    console.log('onSetClick',arguments);
    // this does an overwrite, not a merge, perhaps allow a merge button?
    if(this.state.textState){
      // not 2, because if the index is 2 it could be {"ownedCrusaderIds"} which isn't a partial load
      if(this.state.textState.indexOf('ownedCrusaderIds') == 0 || this.state.textState.indexOf('ownedCrusaderIds') == 1){
        // special load from the .linq script, not direct game data, or page state
        var data = JSON.parse("{" + this.state.textState + "}");
        this.setState({ownedCrusaderIds:data.ownedCrusaderIds});
      } else {
        storeIt(cruTagGridKey, JSON.parse(this.state.textState));
      }
    }
    else{
      storeIt(cruTagGridKey, undefined);
    }
      window.location.reload(false);
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
      clipper = (<button className="btn" data-clipboard-target="#clipperText" >Copy to Clipboard</button>);
    }
    var toggleHide = () =>
      this.setState({showImportExport:(this.state.showImportExport ? false : true)});
    var heroMap = {};

    this.props.jsonData.crusaders.map(c =>{
      heroMap[c.heroId] = c;
    });
    var importArea = this.state.showImportExport ?
      (<Exporter  onHideClick={toggleHide}
                  maxWidth={maxWidth}
                  onTextChange={val => this.setState({textState:val})}
                  onGameTextInputChange={val => { console.log("setting gameText"); this.setState({gameText:val});}}
                  onLoadGameDataClick={this.loadGameData}
                  gameRaw={this.state.gameText}
                  gameJson={this.state.gameJson}
                  heroMap={heroMap}
                  crusaders={props.jsonData.crusaders}
                  onImportGameDataClick={this.onImportGameDataClick}
                  onClearGameDataParseClick={this.onClearGameDataParseClick}
                  onSetClick={this.onSetClick}
                  onUpdateClick={() => this.setState({lastRead:readIt(cruTagGridKey,undefined)})}
                  clipper={clipper}
                  stateStyle={stateStyle}
                  json={json}
                  importText={importText}
                  />) :
      ( <button onClick={toggleHide}>Show Import/Export </button>);
    return (<div>
            <CruTagGrid model={props.jsonData} />
            <div>{JSON.stringify(this.state.error)}</div>
            <div className="onGreen">
            {importArea}
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