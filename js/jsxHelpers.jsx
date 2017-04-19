((app) =>
{
app.createInputClipperButton = targetId =>
  Clipboard && Clipboard.isSupported() && (<button className="btn" data-clipboard-target={"#" + targetId}>Copy to Clipboard</button>);
app.createClipperButton = text =>
  Clipboard && Clipboard.isSupported() && (<button className="btn" data-clipboard-text={text}>Copy to Clipboard</button>);

app.GearBox = props => {

  var makeBox = (slot) => {
    // for crusaders that aren't owned for instance
    if(!(props.cruGearQ != null) || !(props.cru.loot != null))
      return null;
    var type = props.cru.gear && props.cru.gear[slot];
    var lootId =  props.cruGearQ["s" + slot];
    var rarity = Loot.getSlotRarity(lootId, props.cru.loot);
    var golden = Loot.getIsGolden(lootId, props.cru.loot) ? " golden" : "";
    var classes = "rarity rarity" + rarity + golden;
    if(props.cru.id==15)
      console.log('makeBox', props.cru.gear, props.cru);
    console.log()
    return (<div className={classes} title={type || "gear data for crusader not found"} />);
  };
  var result = (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
  return result;
};
app.GearBox.displayName = "GearBox";

app.TextAreaInput2 = props =>
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
app.TextAreaInput2.displayName = "TextAreaInput2";

app.TextInput2 = props =>
(<input
        id={props.id}
        name={props.name}
        className={addClasses(['form-control'],props.className)}
        type={props.type}
        value={props.value}
        defaultValue={props.defaultValue}
        placeholder={props.placeHolder}
        readOnly={props.readonly}
        min={props.min}
        max={props.max}
        step={props.step}
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

app.TextInput2.displayName = "TextInput2";

// looks uncontrolled, but is not under the hood. better user experience
app.TextInputUnc = React.createClass({
  getInitialState(){
    return {value:this.props.value};
  },
  componentWillReceiveProps(nextProps){
    if(this.props.debug)
      console.log('TextInputUnc componentWillReceiveProps', this.props, nextProps);
    // this used to check more stuff before it would try to change state
    if(this.props.value !== nextProps.value && this.state.value !== nextProps.value){
      this.setState({value:nextProps.value});
    }
  },
  render(){
    var props = this.props;
    var state = this.state;
    return (<TextInput2
          name={props.name}
          id={props.id}
          defaultValue={props.defaultValue}
          value={state.value? state.value : ''}
          type={props.type}
          min={props.min}
          max={props.max}
          step={props.step}
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
app.TextInputUnc.displayName = "TextInputUnc";

app.TextAreaInputUnc = React.createClass({
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
app.TextAreaInputUnc.displayName = "TextAreaInputUnc";

// from https://toddmotto.com/creating-a-tabs-component-with-react/
app.Tabs = React.createClass({
  displayName: 'Tabs',
  getDefaultProps(){
    return {selected:0};
  },
  getInitialState(){
    return {selected:this.props.selected};
  },
  componentWillReceiveProps(nextProps){
    if(nextProps.selected != this.props.selected){
      this.setState({selected:nextProps.selected});
    }
  },
  handleClick(index,event){
    event.preventDefault();
    if(this.props.onTabChange)
      this.props.onTabChange(index, this.props.children && this.props.children.length > index && index >=0 ? this.props.children[index] : undefined);
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
app.Pane = React.createClass({
  displayName:'Pane',
  propTypes: {
    label: React.PropTypes.string.isRequired,
    children: React.PropTypes.element.isRequired
  },
  render(){
    return(<div>{this.props.children}</div>);
  }
});
})(window)