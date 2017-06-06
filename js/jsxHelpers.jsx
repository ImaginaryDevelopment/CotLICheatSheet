(function (app, exposeYourself) {
    app.createInputClipperButton = targetId => app.Clipboard && app.Clipboard.isSupported() && (<button className="btn" data-clipboard-target={"#" + targetId}>Copy to Clipboard</button>);
    app.createClipperButton = text => app.Clipboard && app.Clipboard.isSupported() && (<button className="btn" data-clipboard-text={text}>Copy to Clipboard</button>);
    app.Checkbox = props => (<input type="checkbox" onChange={props.onChange ? (e => props.onChange(e.target.value)) : undefined} disabled={props.disabled} 
    // this should help it not say controlled to uncontrolled component
    checked={props.checked || false} readOnly={props.readonly}/>);
    app.Checkbox.displayName = "Checkbox";
    app.UnorderedList = function UnorderedList(props) {
        var items = (props.sorter ? props.items.slice(0).sort(props.sorter) : props.items);
        // if(props.displayMap != null)
        //   items = items.map(displayMap)
        return (<ul>{items.map(item => (<li key={props.keyMaker(item)}>{props.displayMap ? props.displayMap(item) : item}</li>))}
  </ul>);
    };
    app.GearBox = props => {
        var makeBox = (slot) => {
            // for crusaders that aren't owned for instance
            if (!(props.cruGearQ != null) || !(props.cru.loot != null))
                return null;
            var type = props.cru.gear && props.cru.gear[slot];
            var lootId = props.cruGearQ["s" + slot];
            var gearMult = props.cru["s" + slot];
            var lMult = props.cru["l" + slot];
            var rarity = app.Loot.getRarityByItemId(lootId, props.cru.loot);
            var golden = app.Loot.getIsGolden(lootId, props.cru.loot) ? " golden" : "";
            var classes = "rarity rarity" + rarity + golden;
            var titling = "";
            // console.log({type,lootId,gearMult,lMult,rarity,golden,classes,slot});
            if (gearMult) {
                titling += gearMult + " ";
            }
            titling += type || "gear data for crusader not found";
            if (lMult)
                titling += "\r\nLegendaryFactor:" + lMult;
            titling += "\r\nrarity:" + rarity;
            if (golden)
                titling += golden;
            if (lootId)
                titling += "\r\nlootId:" + lootId;
            return (<div className={classes} title={titling}/>);
        };
        var result = (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
        return result;
    };
    app.GearBox.displayName = "GearBox";
    var TextAreaInput2 = props => (<textarea name={props.name} className={app.addClasses(['form-control'], props.className)} type={props.type} value={props.value} defaultValue={props.defaultValue} placeholder={props.placeHolder} onChange={e => {
        if (props.onControlledChange) {
            props.onControlledChange(e);
        }
        return app.debounceChange(props.onChange, e);
    }} onBlur={props.onBlur} {...props.spread}/>);
    TextAreaInput2.displayName = "TextAreaInput2";
    //bad naming, TextInput2 looks from the outside like it should be the better option over TextInputUnc, but really, TextInputUnc is what we should always want as far as I can tell
    var TextInput2 = props => (<input id={props.id} name={props.name} className={app.addClasses(['form-control'], props.className)} type={props.type} value={props.value} defaultValue={props.defaultValue} placeholder={props.placeHolder} readOnly={props.readonly} min={props.min} max={props.max} step={props.step} onChange={e => {
        if (props.onControlledChange) {
            props.onControlledChange(e);
        }
        return app.debounceChange(props.onChange, e);
    }} onBlur={props.onBlur} {...props.spread}/>);
    TextInput2.displayName = "TextInput2";
    // looks uncontrolled, but is not under the hood. better user experience
    class TextInputUnc extends React.Component {
        constructor(props) {
            super(props);
            this.getInitialState = this.getInitialState.bind(this);
            this.state = this.getInitialState(props);
        }
        getInitialState(props) {
            return { value: props.value };
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.debug)
                console.log('TextInputUnc componentWillReceiveProps', this.props, nextProps);
            // this used to check more stuff before it would try to change state
            if (this.props.value !== nextProps.value && this.state.value !== nextProps.value) {
                this.setState({ value: nextProps.value });
            }
        }
        render() {
            var props = this.props;
            var state = this.state;
            if (!(props.placeHolder != null) && props.placeholder != null)
                console.warn('TextInputUnc expects prop placeHolder not placeholder');
            return (<TextInput2 name={props.name} id={props.id} defaultValue={props.defaultValue} value={state.value != null ? state.value : ''} type={props.type} min={props.min} max={props.max} step={props.step} readonly={props.readonly} placeHolder={props.placeHolder} className={props.className} onControlledChange={e => this.setState({ value: e.target.value })} onChange={e => props.onChange(e)} onBlur={e => e.target.value === '' ? {} : e.target.value = (+e.target.value)} spread={props.spread}/>);
        }
    }
    ;
    TextInputUnc.displayName = "TextInputUnc";
    app.TextInputUnc = TextInputUnc;
    // interface TextAreaInputUncProp{
    //   value?:string
    //   id?:string
    //   name?:string
    //   className?: string[] | string
    //   defaultValue?:string
    //   placeHolder?:string
    //   type:string
    // }
    class TextAreaInputUnc extends React.Component {
        constructor(props) {
            super(props);
            this.getInitialState = this.getInitialState.bind(this);
            this.state = this.getInitialState(props);
        }
        getInitialState(props) {
            return { value: props.value };
        }
        componentWillReceiveProps(nextProps) {
            if (this.props.value !== nextProps.value && this.props.id !== nextProps.id) {
                this.setState({ value: nextProps.value });
            }
        }
        render() {
            var props = this.props;
            var state = this.state;
            return (<TextAreaInput2 name={props.name} className={props.className} defaultValue={props.defaultValue} value={state.value ? state.value : ''} placeHolder={props.placeHolder} type={props.type} min={props.min} onControlledChange={e => this.setState({ value: e.target.value })} onChange={e => props.onChange(e)} onBlur={e => e.target.value === '' ? {} : e.target.value = (+e.target.value)} spread={props.spread}/>);
        }
    }
    ;
    TextAreaInputUnc.displayName = "TextAreaInputUnc";
    app.TextAreaInputUnc = TextAreaInputUnc;
    // from https://toddmotto.com/creating-a-tabs-component-with-react/
    class Tabs extends React.Component {
        constructor(props) {
            super(props);
            this._renderTitles = this._renderTitles.bind(this);
            this.getInitialState = this.getInitialState.bind(this);
            this.state = this.getInitialState(props);
        }
        getInitialState(props) {
            return { selected: props.selected };
        }
        componentWillReceiveProps(nextProps) {
            if (nextProps.selected != this.props.selected) {
                this.setState({ selected: nextProps.selected });
            }
        }
        handleClick(index, event) {
            event.preventDefault();
            if (this.props.onTabChange)
                this.props.onTabChange(index, this.props.children && this.props.children.length > index && index >= 0 ? this.props.children[index] : undefined);
            this.setState({
                selected: index
            });
        }
        _renderTitles() {
            function labels(child, index) {
                var activeClass = this.state.selected === index ? 'activeTab' : '';
                return (<li key={index}>
          <a href="#" onClick={this.handleClick.bind(this, index)} className={activeClass}>
            {child.props.label}
          </a>
        </li>);
            }
            return (<ul className="tabs__labels">
        {this.props.children.map(labels.bind(this))}
        </ul>);
        }
        _renderContent() {
            return (<div className="tabs__content">
        {this.props.children[this.state.selected]}
      </div>);
        }
        render() {
            return (<div className="tabs">
      {this._renderTitles()}
      {this._renderContent()}
    </div>);
        }
    }
    ;
    Tabs.defaultProps = {
        selected: 0
    };
    app.Tabs = Tabs;
    class Pane extends React.Component {
        render() {
            return (<div>{this.props.children}</div>);
        }
    }
    ;
    app.Pane = Pane;
    /**
     * @typedef Tag
     * @property {string} id
     */
    /**
     * @typedef {Object} Crusader - a crusader object
     * @property {string} id
     * @property {Array<string>} tags
     */
    var TagCountsComponent = app.TagCountsComponent =
        /**
         *
         * @param {Array<string>} missionTagIds
         * @param {Array<Crusader>} crusaders
         * @param {Array<string>|undefined} filterTags
         * @param {function|undefined} onFilterTagClick
         */
        (missionTagIds, crusaders, filterTags, onFilterTagClick) => {
            var tagCounts = [];
            missionTagIds.map(tagId => {
                var count = crusaders.map(function (crusader) {
                    return crusader.tags.indexOf(tagId) != -1 ? 1 : 0;
                }).reduce((a, b) => a + b, 0);
                var classes = "img_tag";
                if (filterTags && filterTags[tagId]) {
                    classes += " active";
                }
                tagCounts.push(<span key={tagId} className={classes} title={tagId} onClick={onFilterTagClick ? onFilterTagClick.bind(self, tagId) : null}>{count}</span>);
            });
            return tagCounts;
        };
})(findJsParent(), false);
//# sourceMappingURL=jsxHelpers.jsx.map