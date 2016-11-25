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

var CheckBox = React.createClass({
  render:function(){
    return (<input type="checkbox" onChange={this.props.onChange} checked={this.props.checked} />)
  }
});
var CruTagRow = React.createClass({
    render: function () {
        var cru = this.props.crusader;
        var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
        var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null; 
        var tags = [];
        this.props.missionTags.map(function(tag){
          var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag":"img_tag_off";
          tags.push(<img key={tag.id} src={baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={tag.displayName} />);
        });
        
        return (<tr>
            {this.props.mode==="mine" ? <td key="owned"><CheckBox checked={this.props.owned} onChange={this.props.onOwnedChange} /></td>: null}
            <td key="slot">{cru.slot}</td>
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
    return readIt("cruTagGrid", {slotSort:"up",mode:"",filterOwned:false,ownedCrusaderIds:[]});
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
    if(i == -1){
      owned.push(crusader.id);
    } else {
      owned.slice(i,1);
    }
    this.setState({ownedCrusaderIds:owned});
  },
  render:function(){
  	console.info('rendering tag grid, react');
    var self = this;
    var rows=[];
    var sortedCrusaders = this.state.slotSort === "up" ? this.props.model.crusaders : this.props.model.crusaders.slice(0).sort(function(a,b){
      return a.slot > b.slot ? -1 : a.slot < b.slot ? 1 : 0; 
    });
    sortedCrusaders
      .filter(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        return !self.state.filterOwned || owned;
      })
      .map(function(crusader){
        var owned = self.state.ownedCrusaderIds.indexOf(crusader.id) != -1;
        rows.push(<CruTagRow key={crusader.displayName} crusader={crusader} owned={owned} missionTags={self.props.model.missionTags} mode={self.state.mode} onOwnedChange={self.onOwnedChange.bind(self,crusader)} />);
      }
    );
    var tagCounts = [];
    var slotSort = this.state.slotSort === "up" ? "fa fa-fw fa-sort-up" : "fa fa-fw fa-sort-desc";
    this.props.model.missionTags.map(function(tag){
        var count = self.props.model.crusaders.map(function (crusader){
            return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
        }).reduce(function(a,b){ return a + b;});
        tagCounts.push(<span className="img_tag" title={tag.id} key={tag.id}>{count}</span>);
    });
    //"fa fa-fw fa-sort-desc"
    return (<table id="tab">
    <thead>
      <tr> 
        { this.state.mode === "mine" ? <th>Owned <i className="fa fa-fw fa-filter" onClick={this.filterOwnedClick}></i></th> : null}
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