// data is in window.jsonData
var loggedStorageFailure = false;
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
    if(typeof(item) !== 'undefined' && item !== null){
      console.info("read item from localStorage", key,item);
      return JSON.parse(item);
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
    // var opts = {};
    // if(this.props.readonly || this.props.readOnly){
    //   opts['readOnly'] = 'readOnly';
    // }
    // {...opts}
    return (<input type="checkbox" onChange={this.props.onChange}  disabled={this.props.disabled} checked={this.props.checked} readOnly={this.props.readonly}  />)
  }
});
// unused code?
var CruTagRow = React.createClass({
    render: function () {
      var self = this; 
      var cru = this.props.crusader;
      var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
      var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null; 
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
          var imgTag = (<img key={tag.id} src={baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
        if(tag.id === "event" && cru.eventLink){
          tags.push(<a key={tag.id} className="tooltip" href={cru.eventLink}>{imgTag}</a>);
        } else {
          tags.push(imgTag);
        }
      });
      var owned = null;
      var formation = null;
      if(this.props.mode === "mine" && this.props.isFormationMode){
        if(this.props.formationIds[cru.slot]){
          console.log('formation',this.props.formationIds,cru);
        }
        formation = (<td key="formation"><CheckBox checked={this.props.formationIds[cru.slot] == cru.id ? true: false} onChange={this.props.onFormationChange} /></td>);
      } else if (this.props.mode === "mine" && !this.props.isFormationMode){
        if(cru.slot == cru.id && cru.slot < 21){
          owned = (<td key="owned"><CheckBox checked={true} readonly={true} disabled={true} /></td>);
        } else {
          owned = (<td key="owned"><CheckBox checked={this.props.owned} onChange={this.props.onOwnedChange} /></td>);
        }
      }
      
      return (<tr>
          {formation}
          {owned}
          <td key="slot" data-key="slot id" title={cru.id}>{cru.slot}</td>
          <td key="image" data-key="image">{image}</td>
          <td key="display" data-key="display"><a href={self.props.wikibase + cru.displayName.replace(" ","_")}>{cru.displayName}</a></td>
          <td key="tags" className="tags" data-key="tags">{tags}</td>
          <td key="tagcount" data-key="tagcount">{cru.tags.length}</td>
      </tr>);
    }
});

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
var CruTagGrid = React.createClass({
  getInitialState:function(){
    // json.stringify this whole thing to make input/html5 storage data
    var init = readIt("cruTagGrid", {slotSort:"up",mode:"",filterOwned:false,ownedCrusaderIds:[], formation:null, filterTags:{}, formationIds:{}});
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
    console.log('initialState', init);
    return init; 
  },
  componentDidUpdate:function(prevProps, prevState){
    storeIt("cruTagGrid",this.state);
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
  onFormationClick: function(){
    var stateMods = {formation:this.state.formation != null ? null : "formation"};
    console.log('formationClick', stateMods);
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
    var totalOwned = this.state.ownedCrusaderIds? this.state.ownedCrusaderIds.length : '';
    var sortedCrusaders = this.state.slotSort === "up" ? this.props.model.crusaders : this.props.model.crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0; 
    });
    console.log('filterOwned', self.state.filterOwned);
    console.log('formationIds', self.state.formationIds);
    sortedCrusaders
      .filter(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var ownershipFilter = owned || !self.state.filterOwned || (crusader.slot == crusader.id && crusader.slot < 21);
        var tagFilter = Object.keys(self.state.filterTags).map(function(tagId) {
          return !self.state.filterTags[tagId] || crusader.tags.indexOf(tagId) > -1;
        }).reduce(function(a,b){ return a && b},true); 
        var formationFilter = !owned || self.state.formation !=="formation" || (!(self.state.formationIds[crusader.slot] != null)) || self.state.formationIds[crusader.slot] === crusader.id;
        // if(!owned){
        //   console.log('owned', crusader.displayName, owned);
        // }
        return ownershipFilter && tagFilter && formationFilter;
      })
      .map(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        
        var dps = getCrusaderDps(crusader);
        
        rows.push(<CruTagRow key={crusader.displayName} formationIds={self.state.formationIds} isFormationMode={self.state.formation === "formation"} wikibase={self.props.model.wikibase} crusader={crusader} dps={dps} owned={owned} missionTags={self.props.model.missionTags} mode={self.state.mode} onOwnedChange={self.onOwnedChange.bind(self,crusader)} onFormationChange={self.onFormationChange.bind(self,crusader)} />);
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
          <th><CheckBox checked={this.state.formation === "formation"} onChange={this.onFormationClick} /> Build Formation</th>
        </tr>
      );
    }
    return (<table id="tab">
    <thead>
      <tr> 
        { this.state.mode === "mine" && this.state.formation !== "formation" ? <th>Owned <Filter on={this.state.filterOwned} filterClick={this.filterOwnedClick} /></th> : null}
        <th>Slot<i className={slotSort} onClick={this.slotSortClick}></i></th>
        <th colSpan="2">Crusader</th>
        <th className="tags">Tags</th>
        <th></th>
      </tr>
      <tr>
        {this.state.mode === "mine" ? <th>{totalOwned}</th> : null}
        <th>(count:{countDisplay})</th><th colSpan="2"><CheckBox checked={this.state.mode === "mine"} onChange={this.onModeChangeClicked}  />Mine</th>
        <th className="tags clickable">{tagCounts}</th>
        <th>Counts</th>
      </tr>
      { formationRow }
      </thead>
    <tbody>
    {rows}
    </tbody>
    </table>)
  }
});


// ReactDOM.render(
//   <App />,
//   document.getElementById('crusaders_holder')
// );
ReactDOM.render(
        <CruTagGrid model={jsonData} />,
        document.getElementById('crusaders_holder')
);