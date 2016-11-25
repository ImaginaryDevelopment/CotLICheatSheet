// data is in window.jsonData
var CruTag = React.createClass({
    render:function(){
        return (<div></div>);
    }
});
var CruTagRow = React.createClass({
    render: function () {
        var cru = this.props.crusader;
        var baseUrl = window.location.host === "run.plnkr.co"? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
        var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null;
        console.warn('image',image);
        var tags = [];
        this.props.missionTags.map(function(tag){
          var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag":"img_tag_off";
          tags.push(<img key={tag.id} src={baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={tag.displayName} />);
        });
        return (<tr>
            <td key="slot">{cru.slot}</td>
            <td key="image">{image}</td>
            <td key="display">{cru.displayName}</td>
            <td key="tags">{tags}</td>

        </tr>);
    }
});
var CruTagGrid = React.createClass({
  render:function(){
  	console.log('rendering tag grid, react');
    var self = this;
    var rows=[];
    this.props.model.crusaders.map(function(crusader){
      rows.push(<CruTagRow key={crusader.displayName} crusader={crusader} missionTags={self.props.model.missionTags} />);
    });
    var tagCounts =[];
    this.props.model.missionTags.map(function(tag){
        var count = self.props.model.crusaders.map(function (crusader){
            return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
        }).reduce(function(a,b){ return a + b;});
        tagCounts.push(<span className="img_tag" title={tag.id} key={tag.id}>{count}</span>);
    });
    return (<table id="tab">
    <thead>
      <tr>
        <th>Slot</th>
        <th colSpan="2">Crusader</th>
        <th>Tags</th>
      </tr>
      <tr>
    <th>(count:{rows.length})</th><th colSpan="2"></th>
    <th>{tagCounts}</th>
      </tr>
      </thead>
    <tbody>
    {rows}
    </tbody>
    </table>)
  }
});
console.log('preparing to render tag grid, react');

ReactDOM.render(
        <CruTagGrid model={jsonData} />,
        document.getElementById('crusaders_holder')
);