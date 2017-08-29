(function (app, exposeYourself) {
    var getCrusaderDps = function (crusader) {
        if (!crusader || !crusader.upgrades) {
            return "no data";
        }
        var alldps = crusader.upgrades.alldps ? crusader.upgrades.alldps.reduce(app.add) : 0;
        return crusader.upgrades.selfdps ? crusader.upgrades.selfdps.reduce(app.add) + +alldps : null;
    };
    var Filter = props => {
        var filterClasses = props.on == 1 ? "fa fa-fw fa-filter active"
            : props.on == 0 || !(props.on != null) ? "fa fa-fw fa-filter" :
                "fa fa-fw fa-filter activeNegative";
        return (<i className={filterClasses} onClick={props.filterClick}></i>);
    };
    var TagsTd = props => {
        var cru = props.crusader;
        var tags = [];
        props.missionTags.map(function (tag) {
            var tagCssClass = cru.tags.indexOf(tag.id) != -1 ? "img_tag" : "img_tag_off";
            var title = tag.displayName;
            switch (tag.id) {
                case "dps":
                    title += ':' + props.dps;
                    break;
                case "event":
                    if (cru.event) {
                        title += ":" + cru.event;
                    }
                    break;
            }
            tag.id === "dps" ? tag.displayName : tag.displayName;
            var imgTag = (<img key={tag.id} src={props.baseUrl + 'media/tags/' + tag.image} className={tagCssClass} title={title}/>);
            if (tag.id === "event" && cru.eventLink) {
                tags.push(<a key={tag.id} className="tooltip" href={cru.eventLink}>{imgTag}</a>);
            }
            else {
                tags.push(imgTag);
            }
        });
        return (<td key="tags" className="tags" data-key="tags">{tags}</td>);
    };
    TagsTd.displayName = 'TagsTd';
    var CruTagRowFormationEpBox = props => props.isEpMode && props.isOwned ? (<div className="ep"><app.TextInputUnc type="number" min="0" readonly={app.getIsUrlLoaded()} onChange={props.onEpChange} className={["medium"]} value={props.enchantmentPoints}/>
            {props.effectiveEp && !Number.isNaN(props.effectiveEp) ? (<div className="sharedEp">Shared:{props.effectiveEp}</div>) : null}
          </div>)
        : null;
    CruTagRowFormationEpBox.displayName = 'CruTagRowFormationEpBox';
    var CruTagRowFormation = props => (props.mode === "mine" && props.isFormationMode ?
        (<td key="formation">
              <app.Checkbox checked={props.formationIds[props.cru.slot] == props.cru.id ? true : false} onChange={props.onFormationChange}/>
              {props.epBox}
            </td>)
        : null);
    CruTagRowFormation.displayName = 'CruTagRowFormation';
    var CruTagRowOwned = props => {
        if (props.mode !== "mine" || props.isFormationMode)
            return null;
        var isAlwaysOwnedSlot = props.cru.slot == props.cru.id && props.cru.slot < 21;
        var renderBox = isAlwaysOwnedSlot || (!app.getIsUrlLoaded() || props.owned);
        if (isAlwaysOwnedSlot || (app.getIsUrlLoaded() && props.owned)) {
            return (<td key="owned"><app.Checkbox checked={true} readonly={true} disabled={true}/>{props.epBox}</td>);
        }
        if (!app.getIsUrlLoaded() || props.owned) {
            return (<td key="owned"><app.Checkbox checked={props.owned} readonly={app.getIsUrlLoaded()} disabled={app.getIsUrlLoaded()} onChange={props.onOwnedChange}/>{props.epBox}</td>);
        }
        return (<td></td>);
    };
    var CruTagRowTagsOrGear = props => {
        var tagsTd;
        // enable tags if mine mode is off, or gear mode is off
        if (props.mode !== "mine" || !props.isGearMode) {
            return (<TagsTd dps={props.dps} missionTags={props.missionTags} crusader={props.cru} baseUrl={props.baseUrl}/>);
        }
        return props.gearTd;
    };
    var GearSelect = (props) => {
        // v1/1.5 loot should be transformed on url or localStorage load
        if (props.debug === true)
            console.group("GearSelect");
        try {
            var cruGear = props.cruGear;
            var slot = props.slot;
            var gearInfo = app.Loot.getGearInfo(cruGear);
            var itemIdentification = gearInfo && gearInfo[slot] || 0;
            var gearRef = props.gearReference && props.gearReference[3];
            var gearInfo = itemIdentification && gearRef && app.Loot.getLootFromId(itemIdentification, props.gearReference[3]);
            var rarity = app.Loot.getRarityByItemId(itemIdentification, gearRef);
            var slotGear = gearRef
                .filter(g => g.slot == slot)
                .sort((a, b) => a.rarity < b.rarity ? -1 : b.rarity < a.rarity ? 1 : a.golden && !b.golden ? 1 : b.golden && !a.golden ? -1 : 0);
            // this appears to run whenever there isn't gear declared for this crusader
            var getOptionsV1 = () => props.gearPossibilities.map((g, i) => (<option key={g} value={i}>{g}</option>));
            var $options = !slotGear ? getOptionsV1() : slotGear.map(g => (<option key={g.lootId} value={g.lootId} title={g.name}>{(g.golden ? 'golden ' : '') + props.gearPossibilities[g.rarity]}</option>));
            if (slotGear)
                $options.unshift(<option key={0}>None</option>);
            var selectValueV = !(cruGear["s" + slot] != null) ? 2 : !(cruGear["slot" + slot] != null) ? 1 : 0;
            var selectV = (slotGear != null) ? 2 : 1;
            var legendaryValue = rarity >= 5 && app.Loot.getLLevel(itemIdentification, props.gearReference && props.gearReference[3]);
            var $ll = rarity >= 5 ? (<app.TextInputUnc type="number" className="medium" min="1" max="10" value={legendaryValue} onChange={e => props.onLlChange(props.cruId, slot, e)}/>) : null;
            // console.log("slotGear",slotGear,"gearReference", props.gearReference);
            if (!(props.gearReference != null))
                throw Error("bad gearReference");
            var value = gearInfo && gearInfo.lootId
                ||
                    (itemIdentification && app.Loot.getRarityByItemId(itemIdentification, props.gearReference && props.gearReference[3]));
            return (<div data-component="gearSelect">
        <select key={"gear" + slot} title={JSON.stringify(gearInfo) + '\r\n'} data-valueV={selectValueV} data-v={selectV} data-value={value} value={value} onChange={e => props.onGearChange(props.cruId, slot, e.target.value, selectV)} name={"slot" + slot}>{$options}</select>{$ll}{gearInfo && gearInfo.name ? gearInfo.name : null}</div>);
        }
        catch (ex) {
            console.error(ex);
            return (<div>error</div>);
        }
        finally {
            if (props.debug === true)
                console.groupEnd();
        }
    };
    var CruTagRowSlotGear = props => {
        var $slotGear;
        // extract the 3 slots with qualities
        var cruGearQ = app.Loot.getGearInfo(props.cruGear);
        if (cruGearQ[0] > 0 || cruGearQ[1] > 0 || cruGearQ[2] > 0 || typeof (cruGearQ[0]) == "string" || typeof (cruGearQ[1]) == "string" || typeof (cruGearQ[2]) == "string") {
            var makeBox = slot => {
                var itemRarityCompound = cruGearQ[slot];
                var rarity = app.Loot.getRarityByItemId(itemRarityCompound, props.cru.loot);
                var golden = app.Loot.getIsGolden(itemRarityCompound, props.cru.loot) ? " golden" : "";
                var classes = "rarity rarity" + rarity + golden;
                return (<div className={classes}/>);
            };
            return (<div className="rarities">{makeBox(0)}{makeBox(1)}{makeBox(2)}</div>);
        }
        return null;
    };
    CruTagRowSlotGear.displayName = "CruTagRowSlotGear";
    var CruTagRowGear = props => {
        var gearTd = null;
        if (props.mode !== "mine" || !props.isGearMode)
            return null;
        // gearReference currently looks like [undefined,undefined,undefined,cruGearArray] or cruGearArray
        var makeSelect = slot => {
            try {
                return (<GearSelect cruGear={props.cruGear} slot={slot} gearReference={props.gearReference} cruId={props.cruId} gearPossibilities={props.gearTypes} onGearChange={props.onGearChange} onLlChange={props.onLlChange}/>);
            }
            catch (ex) {
                return undefined;
            }
        };
        return (<td key="gear" data-key="gear" data-component="CruTagRowGear">
                {makeSelect(0)}
                {makeSelect(1)}
                {makeSelect(2)}
                </td>);
    };
    CruTagRowGear.displayName = "CruTagRowGear";
    var CruTagRow = props => {
        var cru = props.crusader;
        var baseUrl = app.location.host === "run.plnkr.co" ? '//imaginarydevelopment.github.io/CotLICheatSheet/' : '';
        var $image = cru.image ? <img src={baseUrl + 'media/portraits/' + cru.image} className='img_portrait'/> : null;
        var isOwned = props.owned || cru.slot == cru.id && cru.slot < 21;
        var $epBox = (<CruTagRowFormationEpBox isEpMode={props.isEpMode} isOwned={isOwned} onEpChange={props.onEpChange} enchantmentPoints={props.enchantmentPoints} effectiveEp={props.effectiveEp}/>);
        var $formation = (<CruTagRowFormation mode={props.mode} isFormationMode={props.isFormationMode} cru={cru} formationIds={props.formationIds} onFormationChange={props.onFormationChange} epBox={$epBox}/>);
        var $owned = (<CruTagRowOwned mode={props.mode} isFormationMode={props.isFormationMode} cru={cru} owned={isOwned} epBox={$epBox} onOwnedChange={props.onOwnedChange}/>);
        var link = cru.link && cru.link.indexOf('/') < 0 ? (props.wikibase + cru.link)
            : cru.link ?
                cru.link
                : props.wikibase + cru.displayName.replace(" ", "_");
        var cruGear = props.gear ? props.gear : {};
        var $slotGear = (<CruTagRowSlotGear cru={cru} cruGear={cruGear}/>);
        // the select boxes and legendary level inputs
        var $gearTd = (<CruTagRowGear mode={props.mode} isGearMode={props.isGearMode} cruGear={cruGear} gearReference={props.gearReference} cruId={cru.id} gearTypes={props.gearTypes} onGearChange={props.onGearChange} onLlChange={props.onLlChange}/>);
        var $tagsOrGearColumn = (<CruTagRowTagsOrGear mode={props.mode} isGearMode={props.isGearMode} dps={props.dps} missionTags={props.missionTags} cru={cru} baseUrl={baseUrl} gearTd={$gearTd}/>);
        var $tagCountColumn = props.mode !== "mine" || !props.isGearMode ? (<td key="tagCount" data-key="tagCount">{cru.tags.length}</td>) : null;
        var trClasses = cru.tags.indexOf('dps') >= 0 ? 'dps' : '';
        return (<tr className={trClasses}>
            {$formation}
            {$owned}
            <td key="slot" data-key="slot id" className={cru.tier > 1 ? "tier2" : undefined} title={JSON.stringify({ Place: cru.id, HeroId: cru.heroId, tier2: cru.tier === 2 })}>{cru.slot}{$slotGear}</td>
            <td key="image" data-key="image">{$image}</td>
            <td key="display" data-key="display"><a href={link}>{cru.displayName}</a></td>
            {$tagsOrGearColumn}
            {$tagCountColumn}
        </tr>);
    };
    CruTagRow['displayName'] = 'CruTagRow';
    var CruGridBody = props => {
        var rows = props.sortedCrusaders
            .map(function (crusader) {
            var owned = props.ownedCrusaderIds && props.ownedCrusaderIds.indexOf && props.ownedCrusaderIds.indexOf(crusader.id) != -1;
            var gear = props.crusaderGear ? props.crusaderGear[crusader.id] : {};
            var dps = getCrusaderDps(crusader);
            var otherSlotCrusaders = props.sortedCrusaders.filter(c => c.slot == crusader.slot).map(c => c.id);
            // this is wrong when crusaders are filtered
            var otherEp = otherSlotCrusaders.map(cId => +props.enchantmentPoints[cId]).reduce((acc, val) => acc + (val || 0), 0);
            var effectiveEP = app.calcEffectiveEP(props.sharingIsCaring, +props.enchantmentPoints[crusader.id], otherEp);
            if (!crusader.loot || crusader.id == 1) {
                console.warn('no loot found for crusader', crusader, props.crusaderGear);
            }
            var gearRef = crusader.loot && [null, null, null, crusader.loot];
            return (<CruTagRow key={crusader.displayName} formationIds={props.formationIds} isEpMode={props.isEpMode} isGearMode={props.isGearMode} gearTypes={props.referenceData.gearTypes} gearReference={gearRef} gear={gear} onGearChange={props.onGearChange} onLlChange={props.onLlChange} enchantmentPoints={props.enchantmentPoints[crusader.id]} effectiveEp={effectiveEP} onEpChange={val => props.onEpChange(crusader.id, val)} isFormationMode={props.isBuildingFormation} wikibase={props.referenceData.wikibase} crusader={crusader} dps={dps} owned={owned} missionTags={props.referenceData.missionTags} mode={props.mode} onOwnedChange={val => props.onOwnedChange(crusader, val)} onFormationChange={val => props.onFormationChange(crusader, val)}/>);
        });
        return (<tbody>
      {rows}
      </tbody>);
    };
    CruGridBody['displayName'] = CruGridBody;
    var sortStates = [
        { value: "up", classes: "fa fa-fw fa-sort-up", next: "desc" },
        { value: "desc", classes: "fa fa-fw fa-sort-desc", next: undefined },
        { value: undefined, classes: "fa fa-fw fa-sort", next: "up" }
    ];
    // var getSortClasses = value => sortStates.find(val => val.value === value).classes;
    var getSortClasses = value => sortStates.find(val => val.value === value).classes;
    var getNextSortValue = value => sortStates.find(val => val.value === value).next;
    var getSortUpdate = (name, value) => {
        var update = {};
        update[name] = getNextSortValue(value);
        return update;
    };
    // get most of the state out of here, so more display stuff can be attached, leave things that don't need to be stored in state
    app.CruTagGrid = class CruTagGrid extends React.Component {
        constructor(props) {
            super(props);
            Object.getOwnPropertyNames(CruTagGrid.prototype).filter(x => x != "constructor").map(x => {
                if (typeof (this[x]) === "function")
                    this[x] = this[x].bind(this);
            });
            app.importMe = () => this.props.updateSave({ usesExtension: true, mainSelectedTab: 3 });
            this.state = { crusaderGear: [], epFilter: undefined };
        }
        onSlotSortClick() {
            this.props.updateSave(getSortUpdate('slotSort', this.props.slotSort));
        }
        onEpSortClick() {
            this.props.updateSave(getSortUpdate('epSort', this.props.epSort));
        }
        onNameSortClick() {
            this.props.updateSave(getSortUpdate('nameSort', this.props.nameSort));
        }
        filterOwnedClick() {
            //(i + 2) % 3 - 1)
            var filterOwned = (this.props.filterOwned + 2) % 3 - 1;
            this.props.updateSave({ filterOwned: filterOwned });
        }
        onModeChangeClicked() {
            console.info('onModeChangeClicked');
            this.props.updateSave({ mode: this.props.mode !== "mine" ? "mine" : undefined });
        }
        onEpClick() {
            this.props.updateSave({ isEpMode: this.props.isEpMode ? false : true });
        }
        onFormationClick() {
            var saveMods = { isBuildingFormation: this.props.isBuildingFormation != null ? null : "formation" };
            console.info('formationClick', saveMods);
            this.props.updateSave(saveMods);
        }
        onGearClick() {
            var stateMods = { isGearMode: this.props.isGearMode ? false : true };
            console.info('gearClick', stateMods);
            this.props.updateSave(stateMods);
        }
        onEpChange(crusaderId, epValue) {
            console.info('onEpChange', arguments);
            var oldEp = this.props.enchantmentPoints;
            var newEp = {};
            for (var attr in oldEp) {
                if (oldEp.hasOwnProperty(attr)) {
                    newEp[attr] = oldEp[attr];
                }
            }
            newEp[crusaderId] = epValue;
            var stateMods = { enchantmentPoints: newEp };
            this.props.updateSave(stateMods);
        }
        onFormationChange(crusader) {
            console.info('formation change');
            var oldState = this.props.formationIds;
            var newState = oldState.constructor();
            for (var attr in oldState) {
                if (oldState.hasOwnProperty(attr)) {
                    newState[attr] = oldState[attr];
                }
            }
            if (oldState[crusader.slot] != null) {
                if (oldState[crusader.slot] == crusader.id) {
                    newState[crusader.slot] = null;
                }
                else {
                    newState[crusader.slot] = crusader.id;
                }
            }
            else {
                newState[crusader.slot] = crusader.id;
            }
            this.props.updateSave({ formationIds: newState });
        }
        onOwnedChange(crusader) {
            console.info('onOwnedChange');
            var owned = this.props.ownedCrusaderIds.slice(0);
            var i = owned.indexOf(crusader.id);
            if (i == -1) {
                owned.push(crusader.id);
            }
            else {
                owned.splice(i, 1);
            }
            this.props.updateSave({ ownedCrusaderIds: owned });
        }
        onLlChange(cruId, slot, legendaryLevel) {
            console.info('onLlChange', arguments);
            var stateMods = {};
            if (!this.props.crusaderGear) {
                stateMods.crusaderGear = {};
            }
            else {
                var merged = app.copyObject(this.props.crusaderGear);
                stateMods.crusaderGear = merged;
            }
            var cruGear;
            if (!stateMods.crusaderGear[cruId]) {
                cruGear = {};
            }
            else {
                cruGear = app.copyObject(stateMods.crusaderGear[cruId]);
            }
            stateMods.crusaderGear[cruId] = cruGear;
            //if the prop is slot not s then the loot isn't loaded for that crusader, and we're going to use LootV1 itemCompounds
            var prevId = cruGear["s" + slot] || cruGear["slot" + slot];
            // is the slot vs s property distinction for when the crusader's loot isn't in data.js yet? so we know it is a rarity selection not a lootId
            var newId = app.Loot.changeLLevel(prevId, legendaryLevel);
            if (prevId === newId) {
                return;
            }
            if (newId && typeof (newId) == "string" && newId.indexOf("undefined") >= 0)
                throw ("invalid newId returned" + newId);
            stateMods.crusaderGear[cruId]["s" + slot] = newId;
            this.props.updateSave(stateMods);
        }
        onGearChange(cruId, slot, gearTypeIndex, selectV) {
            var stateMods = { crusaderGear: {}, epFilter: undefined };
            if (!this.props.crusaderGear) {
                stateMods.crusaderGear = {};
            }
            else {
                var merged = app.copyObject(this.props.crusaderGear);
                stateMods.crusaderGear = merged;
            }
            var cruGear;
            if (!stateMods.crusaderGear[cruId]) {
                cruGear = {};
            }
            else {
                cruGear = app.copyObject(stateMods.crusaderGear[cruId]);
            }
            stateMods.crusaderGear[cruId] = cruGear;
            if (selectV == 1) {
                stateMods.crusaderGear[cruId]["slot" + slot] = +gearTypeIndex;
            }
            else {
                if (stateMods.crusaderGear[cruId]["slot" + slot])
                    stateMods.crusaderGear[cruId]["slot" + slot] = undefined;
                stateMods.crusaderGear[cruId]["s" + slot] = +gearTypeIndex;
            }
            this.props.updateSave(stateMods);
        }
        onFilterTag(tagId) {
            var self = this;
            console.log('onFilterTag', tagId, self.props.filterTags);
            var tagFilter = {};
            var filterTags = self.props.filterTags || {};
            Object.keys(filterTags).map(function (tagId) {
                tagFilter[tagId] = filterTags[tagId] ? true : false;
            });
            tagFilter[tagId] = tagFilter[tagId] ? false : true;
            this.props.updateSave({ filterTags: tagFilter });
        }
        render() {
            app.crusaderGear = this.props.crusaderGear;
            var self = this;
            var totalCrusaders = this.props.model.crusaders.length;
            var isBuildingFormation = this.props.isBuildingFormation === "formation";
            var isMineMode = this.props.mode === "mine";
            // this may not be reliable, if any dirty data gets in the state from versioning changes
            var totalOwned = this.props.ownedCrusaderIds ? this.props.ownedCrusaderIds.length : '';
            var sortedCrusaders = app.filterSortCrusaders(this.props.ownedCrusaderIds || [], this.props.filterOwned, this.props.filterTags || [], isBuildingFormation, this.props.formationIds || [], this.props.slotSort, this.props.model.crusaders, this.props.epSort, this.props.enchantmentPoints, this.props.nameSort, this.state.epFilter);
            var tagCounts = [];
            this.props.model.missionTags.map(function (tag) {
                var count = self.props.model.crusaders.map(function (crusader) {
                    return crusader.tags.indexOf(tag.id) != -1 ? 1 : 0;
                })
                    .reduce((a, b) => a + b, 0);
                var classes = "img_tag";
                if (self.props.filterTags && self.props.filterTags[tag.id]) {
                    classes += " active";
                }
                tagCounts.push(<span key={tag.id} className={classes} title={tag.id} onClick={self.onFilterTag.bind(self, tag.id)}>{count}</span>);
            });
            var countDisplay = totalCrusaders === sortedCrusaders.length ? totalCrusaders : (sortedCrusaders.length + " of " + totalCrusaders);
            var formationRow;
            var epFilterComponent;
            if (isMineMode) {
                epFilterComponent = (<select value={this.state.epFilter} onChange={e => this.setState({ epFilter: app.inspect(e.target.value, "epFilter.val") })}>
            <option>None</option>
            <option value="<200">&lt;200</option>
            <option value=">200">&gt;200</option>
            <option value="<400">&lt;400</option>
            <option value=">400">&gt;400</option>
            </select>);
                formationRow = (<tr>
            <th>SharingIsCaring <app.TextInputUnc className={["medium"]} value={this.props.sharingIsCaring} type="number" onChange={val => this.props.updateSave({ sharingIsCaring: +val })}/></th>
            <th><app.Checkbox checked={this.props.isEpMode} onChange={this.onEpClick}/>Track EP</th>
            <th colSpan={2}><app.Checkbox checked={isBuildingFormation} onChange={this.onFormationClick}/> Build Formation</th>
            <th><app.Checkbox checked={this.props.isGearMode} onChange={this.onGearClick}/>Track gear</th>
            <th></th>
          </tr>);
            }
            var tagsTh = !isMineMode || !this.props.isGearMode ? (<th className="tags">Tags<button onClick={() => this.props.updateSave({ filterTags: undefined })}>Clear tag filters</button></th>) : null;
            var tagsTh2 = !isMineMode || !this.props.isGearMode ? (<th className="tags clickable">{tagCounts}</th>) : null;
            var countsTh = !isMineMode || !this.props.isGearMode ? (<th>Counts</th>) : null;
            var sharingTh = isMineMode && this.props.isEpMode ?
                (<th colSpan={2}></th>) : null;
            return (<table id="tab">
      <thead>
        <tr>
          {isMineMode && !isBuildingFormation ? <th>Owned <Filter on={this.props.filterOwned} filterClick={this.filterOwnedClick}/></th>
                : isMineMode && isBuildingFormation ? <th></th> : null}
          <th></th>
          <th colSpan={2}>Crusader</th>
          {tagsTh}
          <th></th>
        </tr>
        <tr>
          {isMineMode ? <th title="owned">{totalOwned}</th> : null}
          <th>(count:{countDisplay})</th><th colSpan={2}><app.Checkbox checked={isMineMode} onChange={this.onModeChangeClicked}/>Mine</th>
          {tagsTh2}
          {countsTh}
        </tr>
        {formationRow}
        <tr>
          {isMineMode ? (<th>EP<i className={getSortClasses(this.props.epSort)} onClick={this.onEpSortClick}></i>{epFilterComponent}</th>) : null}
          <th>Slot<i className={getSortClasses(this.props.slotSort)} onClick={this.onSlotSortClick}></i></th>
          <th colSpan={2}>Name<i className={getSortClasses(this.props.nameSort)} onClick={this.onNameSortClick}></i></th>
          <th />
          <th />
        </tr>

        </thead>
        <CruGridBody sortedCrusaders={sortedCrusaders} ownedCrusaderIds={this.props.ownedCrusaderIds} crusaderGear={this.props.crusaderGear} enchantmentPoints={this.props.enchantmentPoints} sharingIsCaring={this.props.sharingIsCaring} formationIds={this.props.formationIds} isEpMode={this.props.isEpMode} isGearMode={this.props.isGearMode} referenceData={this.props.model} onGearChange={this.onGearChange} onLlChange={this.onLlChange} isBuildingFormation={isBuildingFormation} mode={this.props.mode} onOwnedChange={this.onOwnedChange} onFormationChange={this.onFormationChange} onEpChange={this.onEpChange}/>
        
      </table>);
        }
    };
})(findJsParent(), false);
//# sourceMappingURL=tagGrid.jsx.map