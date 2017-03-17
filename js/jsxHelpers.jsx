((app) =>
{

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

app.TextInput2 = props =>
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
app.TextInputUnc = React.createClass({
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

// from https://toddmotto.com/creating-a-tabs-component-with-react/
app.Tabs = React.createClass({
  displayName: 'Tabs',
  getDefaultProps(){
    return {selected:0};
  },
  getInitialState(){
    return {selected:this.props.selected};
  },
  handleClick(index,event){
    event.preventDefault();
    if(props.onTabChange)
      props.onTabChange(index, this.props.children && this.props.children.length > index && index >=0 ? this.props.children[index] : undefined);
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