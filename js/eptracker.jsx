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
    var filterClasses = this.props.on ? "fa fa-fw fa-filter active" : "fa fa-fw fa-filter";
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
var CruTagRow = React.createClass({
    render: function () {
      var self = this; 
      var cru = this.props.crusader;
      var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
      var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null; 
      var tags = [];
      this.props.missionTags.map(function(tag){
        var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag":"img_tag_off";
        var title= tag.id === "dps" ? tag.displayName + ':' + self.props.dps : tag.displayName; 
        tags.push(<img key={tag.id} src={baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title} />);
      });
      var owned = null;
      if (this.props.mode === "mine"){
        if(cru.slot == cru.id && cru.slot < 21){
          owned = (<td key="owned"><CheckBox checked={true} readonly={true} disabled={true} /></td>);
        } else {
          owned = (<td key="owned"><CheckBox checked={this.props.owned} onChange={this.props.onOwnedChange} /></td>);
        }
      }
      
      return (<tr>
          {owned}
          <td key="slot" title={cru.id}>{cru.slot}</td>
          <td key="image">{image}</td>
          <td key="display">{cru.displayName}</td>
          <td key="tags">{tags}</td>
          <td key="tagcount">{cru.tags.length}</td>
      </tr>);
    }
});
var CruTagGrid = React.createClass({
  getInitialState:function(){
    // json.stringify this whole thing to make input/html5 storage data
    var init = readIt("cruTagGrid", {slotSort:"up",mode:"",filterOwned:false,ownedCrusaderIds:[], filterTags:{}});
    if(typeof(init.filterTags) === "undefined"){
      init.filterTags = {};
    }
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
  onOwnedChange:function(crusader){
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
    var sortedCrusaders = this.state.slotSort === "up" ? this.props.model.crusaders : this.props.model.crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0; 
    });
    console.log('filterOwned', self.state.filterOwned);
    sortedCrusaders
      .filter(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var ownershipFilter = owned || !self.state.filterOwned || (crusader.slot == crusader.id && crusader.slot < 21);
        var tagFilter = Object.keys(self.state.filterTags).map(function(tagId) {
          return !self.state.filterTags[tagId] || crusader.tags.indexOf(tagId) > -1;
        }).reduce(function(a,b){ return a && b},true); 
        console.log('owned', crusader.displayName, owned);
        return ownershipFilter && tagFilter;
      })
      .map(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        var dps = getCrusaderDps(crusader);
        rows.push(<CruTagRow key={crusader.displayName} crusader={crusader} dps={dps} owned={owned} missionTags={self.props.model.missionTags} mode={self.state.mode} onOwnedChange={self.onOwnedChange.bind(self,crusader)} />);
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
    
    var filterOwnedClasses = this.state.filterOwned ? "fa fa-fw fa-filter active" : "fa fa-fw fa-filter";  
    return (<table id="tab">
    <thead>
      <tr> 
        { this.state.mode === "mine" ? <th>Owned <Filter on={this.state.filterOwned} filterClick={this.filterOwnedClick} /></th> : null}
        <th>Slot<i className={slotSort} onClick={this.slotSortClick}></i></th>
        <th colSpan="2">Crusader</th>
        <th>Tags</th>
        <th></th>
      </tr>
      <tr>
        {this.state.mode === "mine" ? <th></th> : null}
        <th>(count:{rows.length})</th><th colSpan="2"><CheckBox checked={this.state.mode === "mine"} onChange={this.onModeChangeClicked}  />Mine</th>
        <th>{tagCounts}</th>
        <th>Counts</th>
      </tr>
      </thead>
    <tbody>
    {rows}
    </tbody>
    </table>)
  }
});
console.info('preparing to render tag grid, react');

ReactDOM.render(
        <CruTagGrid model={jsonData} />,
        document.getElementById('crusaders_holder')
);