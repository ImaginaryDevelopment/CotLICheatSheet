// data is in window.jsonData
var CruTag = React.createClass({
    render:function(){
        return (<div></div>);
    }
});
var CruTagRow = React.createClass({
    render: function () {
        var cru = this.props.crusader;
        var baseUrl = window.location.host === "run.plnkr.co"? 'https://imaginarydevelopment.github.io/CotLICheatSheet/' : '';
        var image = cru.image ? <img src={ baseUrl + 'media/portraits/' + cru.image} className='img_portrait' /> : null;
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
    var self = this;
    var rows=[];
    this.props.model.crusaders.map(function(crusader){
      rows.push(<CruTagRow key={crusader.displayName} crusader={crusader} missionTags={self.props.model.missionTags} />);
    });
    return (<table id="tab">
    <thead>
      <tr>
        <th>Slot</th>
        <th colSpan="2">Crusader (count:{rows.length})</th>
        <th>Tags</th>
      </tr></thead>
    <tbody>
    {rows}
    </tbody>
    </table>)
  }
});
ReactDOM.render(
        <CruTagGrid model={jsonData} />,
        document.getElementById('crusaders_holder')
      );
var legacy = function () {


    var htmlResult = "";


	/*
	for (var i = 0; i < jsonData.missionTags.length; i++) {
		htmlResult 		+= "<img src='media/tags/" + jsonData.missionTags[i].image + "' title='" + jsonData.missionTags[i].displayName + "' class='img_tag' />";
	}
	*/

    htmlResult = "<table id='tab'>";
    htmlResult += "<thead>";
    htmlResult += "<tr>";
    htmlResult += "<th>Slot</th>";
    htmlResult += "<th colspan='2'>Crusader</th>";
    htmlResult += "<th>Tags</th>";
    htmlResult += "</tr>";
    htmlResult += "</thead>";

    for (var i = 0; i < window.jsonData.crusaders.length; i++) {
        var crusaderHolder = window.jsonData.crusaders[i];

        htmlResult += "<tr>";

        htmlResult += "<td>" + crusaderHolder.slot + "</td>";
        htmlResult += "<td><img src='media/portraits/" + crusaderHolder.image + "' class='img_portrait' /></td>";
        htmlResult += "<td>" + crusaderHolder.displayName + "</td>";

        htmlResult += "<td>"
        for (var j = 0; j < window.jsonData.missionTags.length; j++) {
            var tagHolder = window.jsonData.missionTags[j];
            var tagCssClass = (crusaderHolder.tags.indexOf(tagHolder.id) != -1) ? "img_tag" : "img_tag_off";

            htmlResult += "<img src='media/tags/" + tagHolder.image + "' title='" + tagHolder.displayName + "' class='" + tagCssClass + "' />";
        }
        htmlResult += "</td>";

        htmlResult += "</tr>";
    }

    htmlResult += "</table>";

    pchCrusaders.innerHTML = htmlResult;
};