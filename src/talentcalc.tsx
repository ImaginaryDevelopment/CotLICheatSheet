/* global React */
(function(app,exposeYourself:boolean){
// app.reactClasses = app.reactClasses || {};
app.HeroSelect = props =>
{
    var crusaders = app.heroSelectSorter(props.crusaders, props.dontSort);
    var options = crusaders
        .map(cru =>
        <option key={cru.id} className={cru.tags.includes("dps")? "dps" : ""} value={cru.id}>{cru.displayName} ({cru.slot})</option>
    );
    var selectedCrusader = crusaders.find(cru => cru.id === props.selectedHeroId);
    var title;
    if(selectedCrusader != null){
        title = "";
        if(selectedCrusader.abilityDps != null){
            title+="dpsMultiplier(abilities only):" + selectedCrusader.abilityDps + "\r\n";
        }
        if(selectedCrusader.globalDps != null && selectedCrusader.globalDps != 1)
            title +="dpsMultiplier(with gear):" + selectedCrusader.globalDps + "\r\n";
        if(selectedCrusader.globalGold != null && selectedCrusader.globalGold != 1)
            title += "goldMultiplier:" + selectedCrusader.globalGold +"\r\n";
    }
    return(
    <select title={title} value={props.selectedHeroId || "0"} className={selectedCrusader && selectedCrusader.tags && selectedCrusader.tags.includes("dps") ? "dps" : "" } onChange={e => props.onHeroChange(e.target.value)}>
        <option value="0">None</option>
        {options}
        </select>);
};
app.HeroSelect.displayName = "HeroSelect";
app.HeroSelect.PropTypes = {
    crusaders: React.PropTypes.arrayOf(React.PropTypes.shape({
        id:React.PropTypes.string.isRequired,
        displayName:React.PropTypes.number.isRequired
    })).isRequired,
    selectedHeroId: React.PropTypes.string,
    onHeroChange: React.PropTypes.func.isRequired
};

app.TalentHeaderRow = props =>{
    return (            <tr data-row={props.index} className="dpsHeaderRow">
                <th><h3>{props.title}</h3></th>
                {props.td1? props.td1 : <td />}
                {props.td2? props.td2: <td />}
                {props.td3? props.td3: <td />}
                <th>current dps buff</th>
                <th>next level dps buff</th>
                <th>percent improvement</th>
                <th>Score(larger is better)</th>
                {props.td4? props.td4 : <td />}
                {props.td5? props.td5: <td />}
            </tr>);

};

app.TalentInput = props =>{
    var meta = app.Talents.getTalentMeta(props.getDps, props.value, props.max, props.costForNextLevel);
    var dpsText = meta.showingMessage? meta.dpsBuff : meta.dpsBuff.toFixed(2);
    var scoreText = meta.showingMessage ? meta.dpsBuff : meta.showingMax? meta.score : (meta.score.toFixed(2) + '%');
    return (<tr data-row={props.dataRow? props.dataRow: undefined}>
        <th>Current level</th>
        <td><app.TextInputUnc type="number" min="0" step={props.step} max={props.max? props.max : undefined} value={props.value} onChange={props.onChange} /></td>
        {props.td1 ? props.td1: <td />}
        {props.td2 ? props.td2: <td />}
        <td className="textcenter">{dpsText}</td>
        <td data-talent={props.dataRow}
            className="textcenter">
            {!meta.showingMessage && typeof(meta.nextDps) =="number" ? meta.nextDps.toFixed(2) : null}
        </td>
        <td className="textcenter">{!meta.showingMessage && typeof(meta.nextDps) == "number" ? (meta.impr * 100).toFixed(2) + '%' : null}</td>
        <td className="textcenter">{scoreText}</td>
    </tr>)
};

app.RaritySelect = props =>{

    var gearPossibilities = props.gearTypes.slice();
    if(props.includeGoldens){
        gearPossibilities.splice(5,0,"golden epic");
        gearPossibilities.splice(7,0,"golden legendary");
    }

    var options = gearPossibilities.map((g,i)=> (<option key={g} value={i}>{g}</option>));

    return (<select value={props.rarity} onChange={e => props.onChange ? props.onChange(e.target.value): null}>{options}</select>);
}
app.NonDpsTalent = props =>
                (<td title={props.name}><app.TextInputUnc value={props.value} type="number" min={props.min} max={props.max} onChange={props.onChange}/></td>);
app.NonDpsTalent.displayName = "NonDpsTalent";
app.NonDpsTalent.propTypes={
    onChange:React.PropTypes.func.isRequired,
    name:React.PropTypes.string.isRequired,
    value:React.PropTypes.number.isRequired
}

  /**
   * @typedef TrinketContainer
   * @type {Object}
   * @property {number} common
   * @property {number} uncommon
   * @property {number} rare
   * @property {number} epic
   */
  /**
   * @typedef DpsInfo
   * @type {Object}
   * @property {Crusader} cru
   * @property {number} ep
   * @property {number} slotEp
   * @property {number} epics
   * @property {number} slotEpics
   */

  /**
   * @typedef TalentInfo
   * @type {Object}
   * @property {number} level
   * @property {number} max
   * @property {number => number} getCost
   * @property {() => void} onChange
   */

  /**
   * @typedef TalentInputContainer
   * @type {Object}
   * @property {number} critChance
   * @property {number} stormRiderPercentage
   * @property {TrinketContainer} tc
   * @property {DpsInfo} dpsInfo
   * @property {Object<string,TalentInfo>} td
   * @property {Object<number,number>} rarityMultMap
   */
app.Inputs = props =>
{

    // this is for dps talents only
    var getCanReadTalent = name => props[name] != null && props.talents[name].costs != null && props.talents[name].costs.length > props[name];
    /**
     * @type TalentInputContainer
     */
    var tic = props.tic;
    var critChance = tic.critChance;


    var getNextCost = name => getCanReadTalent(name) ? props.talents[name].costs[props[name] + 1] : undefined;

    var talents = app.Talents;
    var {cooldown, dpsHero, effectiveEP, getStormRiderPercentageFromRarity, talentDict, defaultOrder,currentStormRider, nextStormRider, spent: totalDpsIdols} = talents.getTalentDisplay(tic);

    // need to be able to opt out of sorting
    var sortByScore = props.sortTalents;
    var sortedDpsTalentNames = sortByScore ? Object.keys(talentDict).sort((name1,name2) => {
        var x1 = talentDict[name1].score.sortScore;
        var x2 = talentDict[name2].score.sortScore;
        if(x1 == null && x2 == null)
            return 0;
        if(x1 == null)
            return 1;
        if(x2 == null)
            return -1;
        if (x1 === x2) return 0;
        return x1 > x2 ? -1 : 1;
    }) : defaultOrder;
    var makeTalentTrArray = (tdInfo, index, td1?,td2?) => [
        (<app.TalentHeaderRow key={tdInfo.name} index={index} title={tdInfo.name} />),
        (<app.TalentInput key={name+"2"} value={tdInfo.level} dataRow={tdInfo.name} td1={td1} td2={td2} getDps={tdInfo.getDps} max={tdInfo.max} costForNextLevel={tdInfo.nextCost} onChange={tdInfo.onChange} />),
        typeof tdInfo.nextCost === "number" ? (<tr key={name+"3"}><th>Cost for next level</th><td>{tdInfo.nextCost}</td></tr>): null,
        (<tr key={name+"4"}><td>Cumulative Cost</td><td>{tdInfo.spent}</td></tr>),
    ];
    var rows = sortedDpsTalentNames.map((name,i) =>{
        var tdInfo = talentDict[name];
        switch(name){
            case "passiveCriticals":
                return makeTalentTrArray(tdInfo,i);
            case "surplusCooldown":
                return makeTalentTrArray(tdInfo, i);
            case "overenchanted":
                return makeTalentTrArray(tdInfo, i);
            case "setBonus":
                return makeTalentTrArray(tdInfo, i);
            case "sharingIsCaring":
                return makeTalentTrArray(tdInfo, i);
            case "fastLearners":
                return makeTalentTrArray(tdInfo, i);
            case "wellEquipped":
                return makeTalentTrArray(tdInfo, i, (<td>Epics:{tic.dpsInfo.epics}</td>));
            case "swapDay":
                return makeTalentTrArray(tdInfo, i, (<td>Other Epics:{tic.dpsInfo.slotEpics}</td>));
            case "rideTheStorm":
                return makeTalentTrArray(tdInfo, i,
                            (<td>Current Storm Rider:{currentStormRider}</td>),
                            (<td>Next Storm Rider: {nextStormRider}</td>));
            case "stormsBuilding":
                return makeTalentTrArray(tdInfo, i);
            default :
                console.warn("talent not found", name);

        }
    });
    console.log('dpsHero',dpsHero);


    var TextInputUnc = app.TextInputUnc;
    var ndt = props.nonDpsTalents;
    var makeNonDpsItem = (name,max) => (<app.NonDpsTalent name={name} value={ndt[name].value} min={0} max={max} onChange={ndt[name].onChange} />);
    return (
        <table>
            <thead>
            </thead>
            <tbody>
                <tr><th>Crit Chance %</th><td><app.TextInputUnc type="number" min="0" max="300" onChange={props.onCritChanceChange} value={critChance} /></td><td>%</td><td title="D"></td><th colSpan={5}>Horn and Cornucopia Trinkets</th></tr>
                <tr><th>Ability Cooldown %</th><td>{cooldown}</td><td title="C"></td><td></td><th className="rarity1 black">Common:</th><th className="rarity2 black">Uncommon:</th><th className="rarity3 black">Rare:</th><th className="rarity4 black">Epic:</th><th>Total:</th></tr>
                <tr><th>Enchantment Points on main dps</th><td>{effectiveEP}</td><th colSpan={2}></th>
                    <td title="E4"><app.TextInputUnc type="number" value={tic.tc.common} min="0" onChange={props.onCooldownCommonChange} /></td>
                    <td title="F4"><app.TextInputUnc type="number" value={tic.tc.uncommon} min="0" onChange={props.onCooldownUncommonChange} /></td>
                    <td><app.TextInputUnc type="number" value={tic.tc.rare} min="0" onChange={props.onCooldownRareChange} /></td>
                    <td><app.TextInputUnc type="number" value={tic.tc.epic} min="0" onChange={props.onCooldownEpicChange} /></td>
                    <td>{cooldown.toFixed(2)}</td>
                </tr>
                <tr><th>Main Dps</th><td colSpan={2}><app.HeroSelect crusaders={props.crusaders} selectedHeroId={props.selectedHeroId} onHeroChange={props.onHeroChange} /></td><th>Slot</th></tr>
                <tr><th>Main Crusader Enchantments</th><td>{tic.dpsInfo.ep}</td><td> Epics: {tic.dpsInfo.epics}</td><td className="textcenter vcenter">{dpsHero && dpsHero.cru ? dpsHero.cru.slot: ""}</td><th colSpan={6}>Put your levels for other talents here to calculate how much you have spent.</th></tr>
                <tr><th>Alt Crusader Enchantments</th><td>{tic.dpsInfo.slotEp - tic.dpsInfo.ep}</td><td>Other Epics: {tic.dpsInfo.slotEpics}</td><td /><th>Time-O-Rama</th><th>Massive Criticals</th><th>Speed Runner</th><th>Endurance Training</th><th>Gold-o-Splosion</th><th>Sniper</th></tr>
                <tr data-row={8}>
                    <th>Sort Talents<app.Checkbox onChange={props.onSortTalentsChange} checked={props.sortTalents} /></th><th />
                    <th colSpan={2} />
                    {makeNonDpsItem("timeORama",20)}
                    {makeNonDpsItem("massiveCriticals",25)}
                    {makeNonDpsItem("speedRunner",20)}
                    {makeNonDpsItem("enduranceTraining",20)}
                    {makeNonDpsItem("goldOSplosion",25)}
                    {makeNonDpsItem("sniper",40)}
                </tr>
                <tr data-row={9}><th colSpan={4} /><th>Every Last Cent</th><th>Spend it all</th><th>Upgrade them all</th><th>Scavenger</th><th>Speed Looter</th><th>Efficient Crusading</th></tr>
                <tr data-row={10}>
                    <th colSpan={4} />
                    {makeNonDpsItem("everyLastCent",20)}
                    {makeNonDpsItem("spendItAll",1)}
                    {makeNonDpsItem("upgradeThemAll",1)}
                    {makeNonDpsItem("scavenger",50)}
                    {makeNonDpsItem("speedLooter",1)}
                    {makeNonDpsItem("efficientCrusading",25)}
                </tr>
                <tr data-row={11}>
                    <th/><td />
                    <th colSpan={2} /><th>Doing it Again</th><th>Deep Idol Scavenger</th><th title="if you can cap, raising the level cap is best for dps" className="lightGreen">Extra Training</th><th>Triple Tier Trouble</th><th></th><th></th>
                </tr>
                <tr data-row={12}>
                    <th/><td />
                    <th colSpan={2} />
                    {makeNonDpsItem("doingItAgain",1)}
                    {makeNonDpsItem("deepIdolScavenger",25)}
                    {makeNonDpsItem("extraTraining",40)}
                    {makeNonDpsItem("tripleTierTrouble",1)}
                    <td />
                    <td />
                    </tr>
                <tr data-row={13} />

                <tr>
                    <th/><td />
                    <th colSpan={2} />
                    <th>Extended Spawns</th>
                    <th>Click-tastrophy</th>
                    <th>Instant Satisfaction</th>
                    <th>Idols Over Time</th>
                    <th>Sprint Mode</th>
                    <th title="if you can cap, raising the level cap is best for dps" className="lightGreen">Superior Training</th>
                    <th></th>
                </tr>
                <tr >
                    <th/><td />
                    <th colSpan={2} />
                    {makeNonDpsItem("extendedSpawns",40)}
                    {makeNonDpsItem("clickTastrophy",40)}
                    {makeNonDpsItem("instantSatisfaction",40)}
                    {makeNonDpsItem("idolsOverTime",40)}
                    {makeNonDpsItem("sprintMode",10)}
                    {makeNonDpsItem("superiorTraining",80)}
                </tr>

                <tr data-row={14} />
                <tr data-row={15}>
                    <th>Storm Rider Percentage</th>
                    <td><app.TextInputUnc type="number" min="0" step="0.05" max="10" id="stormRiderPercentage" debug={true} value={tic.stormRiderPercentage} onChange={props.onStormRiderPercentageChange} /></td>
                    <td><app.RaritySelect gearTypes={props.referenceData.gearTypes} includeGoldens={true}
                                        onChange={val => props.onStormRiderPercentageChange(getStormRiderPercentageFromRarity(val))} /></td>
                </tr>
                <tr data-row={16} />
                <tr data-row={17}>
                    <th colSpan={5}>Talents</th>
                    <th title="not including Extra Training or Superior Training" colSpan={2}>Idols Spent on DPS Talents:{totalDpsIdols}</th>
                    <td></td>
                    <td />
                    <th />
                    {/*<th>Total Idols:</th>*/}
                    </tr>
                {
                    rows
                }
            </tbody>
            <tfoot>
                <tr className="dpsHeaderRow">
                    <th>
                        not accounted for
                    </th>
                    <td colSpan={3}>
                        <ul>
                            <li>Storm Rider talents : Littlefoot xp, Thalia Legendaries</li>
                            <li>Tier 4 dps talents</li>
                            <li>Legendaries/abilities that depend on being under attack/not under attack. dead crusaders</li>
                        </ul>
                    </td>
                </tr>
            </tfoot>
        </table>
        );
};
app.Inputs.displayName = 'Inputs';
app.Inputs.propTypes = {
    onCritChanceChange: React.PropTypes.func.isRequired,
    // hero may not be selected
    selectedHeroId:React.PropTypes.string,
    // hero may not be selected yet
    heroDpsId:React.PropTypes.string,
    coolDownCommon:React.PropTypes.number,
    cooldownUncommon:React.PropTypes.number,
    cooldownRare:React.PropTypes.number,
    cooldownEpic:React.PropTypes.number,
    onCooldownCommonChange: React.PropTypes.func.isRequired,
    onCooldownUncommonChange: React.PropTypes.func.isRequired,
    onCooldownRareChange: React.PropTypes.func.isRequired,
    onCooldownEpicChange: React.PropTypes.func.isRequired,
    crusaders:React.PropTypes.array.isRequired,
};
interface DpsTalentInfo{
    level:number
    max:number
    getCost? (lvl:number): number
}

interface TalentInputContainer{
    stormRiderPercentage:number
    rarityMultMap(rarity:number): number
    critChance: number
    tc:{common:number; uncommon:number; rare:number;epic:number}
    td:{
        passiveCriticals:DpsTalentInfo
        surplusCooldown:DpsTalentInfo
        overenchanted:DpsTalentInfo
        setBonus:DpsTalentInfo
        sharingIsCaring:DpsTalentInfo
        fastLearners:DpsTalentInfo
        wellEquipped:DpsTalentInfo
        rideTheStorm:DpsTalentInfo
        stormsBuilding:DpsTalentInfo
        swapDay:DpsTalentInfo
    }
    dpsInfo:any

}


var talentCalc = props =>{

        var saved = props.saved;
        var crusaders = props.referenceData.crusaders;
        var getNumberOrDefault = app.getNumberOrDefault;

        var talentSelectedCrusader = saved.talentCalcHeroId ? {cru : crusaders.find(cru => cru.id == props.saved.talentCalcHeroId), mainDpsEpics:0, dpsSlotEpics:0,mainDpsEP:0} : null;
        if(talentSelectedCrusader && !(talentSelectedCrusader.cru != null))
            talentSelectedCrusader = null;
        if(talentSelectedCrusader){
            var cru = talentSelectedCrusader.cru;
            var savedGear = saved.crusaderGear || [];
            var cruRarities = app.Loot.getSlotRarities(savedGear[cru.id], talentSelectedCrusader.cru.loot);
            var cruEpicCount = cruRarities.reduce((a,b) => a + (b > 3? 1 : 0),0);
            talentSelectedCrusader.mainDpsEpics = cruEpicCount;
            var slotMates = crusaders.filter(x => x.slot == cru.slot);
            talentSelectedCrusader.dpsSlotEpics =
                slotMates
                .map(x =>
                {
                    var g = savedGear[x.id];
                    var rarities = app.Loot.getSlotRarities(g,x.loot);
                    return rarities;
                })
                .reduce((a,gearArray) => a.concat(gearArray),[]).reduce((a,b) => a + (b > 3 ? 1 : 0),0);
            talentSelectedCrusader.mainDpsEP = app.getNumberOrDefault(saved.enchantmentPoints[cru.id], 0);
            (talentSelectedCrusader as any).dpsSlotEP = +crusaders.filter(x => x.slot == cru.slot).map(x => props.saved.enchantmentPoints[x.id] || 0).reduce((a,b) => +a + +b,0)
        }

        var getCanReadTalent = name => props.saved[name] != null && props.referenceData.talents[name].costs != null && props.referenceData.talents[name].costs.length > props.saved[name];

        /**
         * @type TalentInputContainer
         */
        var tic : TalentInputContainer = {
            stormRiderPercentage: saved.stormRiderPercentage,
            rarityMultMap: props.referenceData.talents.rideTheStorm.rarityMultMap,
            critChance: getNumberOrDefault(props.saved.critChance, 0),
            tc:{common:getNumberOrDefault(saved.cooldownCommon), uncommon:getNumberOrDefault(saved.cooldownUncommon), rare: getNumberOrDefault(saved.cooldownRare), epic: getNumberOrDefault(saved.cooldownEpic)},
            td:{
                passiveCriticals:{level:saved.passiveCriticals, max: 50, getCost: undefined},
                surplusCooldown:{level:saved.surplusCooldown, max: 50, getCost: undefined},
                overenchanted:{level:saved.overenchanted, max: 50, getCost: undefined},
                setBonus:{level:saved.setBonus, max: 50, getCost: undefined},
                sharingIsCaring:{level:saved.sharingIsCaring, max: 14, getCost: undefined},
                fastLearners:{level:saved.fastLearners, max: 18, getCost: undefined},
                wellEquipped:{level:saved.wellEquipped, max: 50, getCost: undefined},
                rideTheStorm:{level:saved.rideTheStorm, max: 25, getCost: undefined},
                stormsBuilding:{level:saved.stormsBuilding, max: 15, getCost: undefined},
                swapDay:{level:saved.swapDay, max:50, getCost:undefined}
            },
            dpsInfo:{
                cru: talentSelectedCrusader, //props.crusaders.find(cru => cru.id === props.selectedHeroId),
                ep:talentSelectedCrusader && talentSelectedCrusader.mainDpsEP || 0, //props.mainDpsEP,
                slotEp: talentSelectedCrusader && (talentSelectedCrusader as any).dpsSlotEP, //  props.dpsSlotEP,
                epics: talentSelectedCrusader && talentSelectedCrusader.mainDpsEpics, // props.mainDpsEpics,
                slotEpics: talentSelectedCrusader && (talentSelectedCrusader as any).dpsSlotEpics //props.dpsSlotEpics
            }
        };
        var objectFromNameValue = (name,value) => {
            var result = {};
            result[name] = value;
            return result;
        };
        Object.keys(tic.td).map(name =>{
            var ti = tic.td[name];
            if(getCanReadTalent(name))
                ti.getCost = x => props.referenceData.talents[name].costs[x];
            else ti.getCost = () => undefined;
            ti.name = name;
            tic.td[name].onChange = x => props.changeSaveState(objectFromNameValue(name,x));
        });
        var createChangeHandler = name => val =>
        {
            var saveStateMod = {};
            saveStateMod[name] = val;
            props.changeSaveState(saveStateMod);
        };
        var nonTicTalents = [
            "timeORama",
            "massiveCriticals",
            "speedRunner",
            "enduranceTraining",
            "goldOSplosion",
            "sniper",
            "everyLastCent",
            "spendItAll",
            "upgradeThemAll",
            "scavenger",
            "speedLooter",
            "efficientCrusading",
            "doingItAgain",
            "deepIdolScavenger",
            "extraTraining",
            "tripleTierTrouble",
            "extendedSpawns",
            "clickTastrophy",
            "instantSatisfaction",
            "idolsOverTime",
            "sprintMode",
            "superiorTraining"
        ];
        var ntt = {};
        nonTicTalents.map(name =>{
            // var pascalCased = name[0].toUpperCase() + name.substr(1);
            ntt[name]={
                value:getNumberOrDefault(props.saved[name],0),
                onChange:createChangeHandler(name)
            };
        });
        return (<app.Inputs {...props}
            tic={tic}
            crusaders={crusaders}
            talents={props.referenceData.talents}
            onCritChanceChange={val => (props.changeSaveState({critChance: app.inspect(+val || 0, 'changeSaveState crit')}))}
            idols={props.saved.idols} onIdolsChange={val => props.changeSaveState({idols:val})}
            sortTalents={props.sortTalents} onSortTalentChange={props.onSortTalentsChange}
            onCooldownCommonChange={val => props.changeSaveState({cooldownCommon: +val || 0})}
            onCooldownUncommonChange={val => props.changeSaveState({cooldownUncommon: +val || 0})}
            onCooldownRareChange={val => props.changeSaveState({cooldownRare: +val || 0})}
            onCooldownEpicChange={val => props.changeSaveState({cooldownEpic: +val || 0})}
            selectedHeroId={typeof(props.saved.talentCalcHeroId) ==="string"? props.saved.talentCalcHeroId : undefined} onHeroChange={val => props.changeSaveState({talentCalcHeroId:val})}
            onStormRiderPercentageChange={createChangeHandler("stormRiderPercentage")}
            nonDpsTalents={ntt}
         />);
};
(talentCalc as any).displayName = 'TalentCalc';
(talentCalc as any).propTypes = {
    saved:React.PropTypes.object,
    changeSaveState: React.PropTypes.func.isRequired,
    sortTalents: React.PropTypes.bool,
    onSortTalentsChange: React.PropTypes.func.isRequired,
    referenceData: React.PropTypes.shape({talents:React.PropTypes.object})
}
app.TalentCalc = talentCalc;

})(findJsParent(), false);