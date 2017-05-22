(app => {
// app.reactClasses = app.reactClasses || {};
app.HeroSelect = props =>
{
    var crusaders = heroSelectSorter(props.crusaders, props.dontSort);
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
    var meta = Talents.getTalentMeta(props.getDps, props.value, props.max, props.costForNextLevel);
    var dpsText = meta.showingMessage? meta.dpsBuff : meta.dpsBuff.toFixed(2);
    var scoreText = meta.showingMessage ? meta.dpsBuff : meta.showingMax? meta.score : (meta.score.toFixed(2) + '%');
    return (<tr data-row={props.dataRow? props.dataRow: undefined}>
        <th>Current level</th>
        <td><TextInputUnc type="number" min="0" step={props.step} max={props.max? props.max : undefined} value={props.value} onChange={props.onChange} /></td>
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

app.Inputs = props =>
{
    var cooldown = app.Talents.getCooldown(props.cooldownCommon, props.cooldownUncommon, props.cooldownRare, props.cooldownEpic) * 100;
    var dpsHero = props.crusaders.find(cru => cru.id === props.selectedHeroId);
    var effectiveEP = calcEffectiveEP(props.sharingIsCaring, props.mainDpsEP, props.dpsSlotEP);
    var {cooldown, dpsHero, effectiveEP} = Talents.getTalentDisplay();

    var getCanReadTalent = name => props[name] != null && props.talents[name].costs != null && props.talents[name].costs.length > props[name];
    var getNextCost = name => getCanReadTalent(name) ? props.talents[name].costs[props[name] + 1] : undefined;
    var getSpent = name => getCanReadTalent(name) ? props.talents[name].costs.map((cost,i)=> i <= props[name] ? cost : 0).reduce((a,b) => a + b,0) : null;
    var getCumulativeCost = getSpent;
    // var passiveCriticalsNextCost = props.passiveCriticals != null && props.talents.passiveCriticals.costs.length > props.passiveCriticals ? props.talents.passiveCriticals.costs[props.passiveCriticals + 1]: undefined;
    var getEnchantBuff = olvl => (olvl * 0.2 + 1) * 0.25;
    var getOverDps = x => ((1 + getEnchantBuff(x)*props.mainDpsEP) - (1 + 0.25*props.mainDpsEP)) / (1 + 0.25 * props.mainDpsEP);
    var currentEnchantBuff = getEnchantBuff(props.overenchanted);
    var idkMyBffJill = props.mainDpsEP + Math.round((props.dpsSlotEP - props.mainDpsEP)*6*0.05,0);
    var getSharingDps = x => (calcEffectiveEP(x, props.mainDpsEP, props.dpsSlotEP)*currentEnchantBuff  - currentEnchantBuff * idkMyBffJill) / (currentEnchantBuff * (idkMyBffJill)+1);
    var getFastLearnerMinutes = x => (1-0.05*x) * 300;
    var getFastLearnersDps = x => 300 / (getFastLearnerMinutes(x) - 1);
    var getWellEquippedDps = Talents.getWellEquippedDps(props.mainDpsEpics);
    var getSwapDayDps = x => 0.2*x*(props.dpsSlotEpics - props.mainDpsEpics);
    var getWellEquippedDps = x => 0.2*x*props.mainDpsEpics;
        //{switch (x) {case 0: return 0.1; case 1: return 0.11; case 2: return 0.125; case 3: return 0.15; case 4: return 0.2; case "4g" : return 0.25; case 5: return 0.4; case "5g": return 0.5;}}
    // this needs your storm rider percentage
    var getCurrentStormRider = x => props.stormRiderPercentage * (x*0.1 + 1);
    var getRideTheStormDps = x => (getCurrentStormRider(x) - props.stormRiderPercentage) / (props.stormRiderPercentage+1);
    var getRideTheStormMagnifiedDps = x => ((getCurrentStormRider(x)*1.5 + 1) - (1 + props.stormRiderPercentage * 1.5)) / (props.stormRiderPercentage * 1.5 + 1);
    // window.getRideTheStormMagnifiedDps = getRideTheStormMagnifiedDps;
    var getTimePerStormRider = x => 480*(1-Math.min(cooldown / 100 ,0.5))*(1-0.05*x);
    var getStormsBuildingDps = x => 480*(1-(Math.min(cooldown / 100,0.5)))/getTimePerStormRider(x) - 1;
    var getStormRiderPercentageFromRarity = rarity =>
    {
        var map = props.referenceData.talents.rideTheStorm.rarityMultMap[rarity];
        return map? map.mult : undefined;
    };
    // var meta = getTalentMeta(props.getDps, props.value, props.max, props.costForNextLevel);
    var getTalentMeta = Talents.getTalentMeta;
    var getPassiveCrits = x => Talents.getPassiveCrits(props.critChance,x);
    var getSurplusCooldown = x => Talents.getSurplusCooldown(cooldown,x);
    var scores = {
            passiveCriticals: getTalentMeta(getPassiveCrits, props.passiveCriticals, 50, getNextCost("passiveCriticals") ),
            surplusCooldown:getTalentMeta(getSurplusCooldown, props.surplusCooldown, 50, getNextCost("surplusCooldown")),
            overenchanted:getTalentMeta(getOverDps, props.overenchanted, 50, getNextCost("overenchanted")),
            // assumes you have no empty slots
            setBonus:getTalentMeta(x => x * 0.2, props.setBonus, 50, getNextCost("setBonus")),
            sharingIsCaring:getTalentMeta(getSharingDps, props.sharingIsCaring, 14, getNextCost("sharingIsCaring")),
            fastLearners:getTalentMeta(getFastLearnersDps, props.fastLearners, 18, getNextCost("fastLearners")),
            wellEquipped:getTalentMeta(getWellEquippedDps, props.wellEquipped, 50, getNextCost("wellEquipped")),
            swapDay:getTalentMeta(getSwapDayDps, props.swapDay, 50, getNextCost("swapDay")),
            rideTheStorm: getTalentMeta(getRideTheStormMagnifiedDps, props.rideTheStorm, 25, getNextCost("rideTheStorm")),
            // <TalentInput    value:{props.stormsBuilding} getDps={getStormsBuildingDps} max="15" costForNextLevel={getNextCost("stormsBuilding")}
            stormsBuilding:getTalentMeta(getStormsBuildingDps, props.stormsBuilding, 15, getNextCost("stormsBuilding"))
    };

                            // td1={(<td>{getCurrentStormRider(props.rideTheStorm) * 1.5}</td>)}
                            // td2={(<td>{getCurrentStormRider(props.rideTheStorm + 1) * 1.5}</td>)}
    var currentStormRider = getCurrentStormRider(props.rideTheStorm) * 1.5;
    if(typeof currentStormRider === "number")
        currentStormRider= currentStormRider.toFixed(2);
    var nextStormRider = getCurrentStormRider(props.rideTheStorm + 1) * 1.5;
    if(typeof nextStormRider === "number")
        nextStormRider= nextStormRider.toFixed(2);
    var rows = [

    ];



    return (<table>
        <thead>
            </thead>
            <tbody>
            <tr><th>Crit Chance %</th><td><TextInputUnc type="number" min="0" max="300" onChange={val => props.onCritChanceChange(val)} value={props.critChance} /></td><td>%</td><td title="D"></td><th colSpan="5">Horn and Cornucopia Trinkets</th></tr>
            <tr><th>Ability Cooldown %</th><td>{cooldown}</td><td title="C"></td><td></td><th className="rarity1 black">Common:</th><th className="rarity2 black">Uncommon:</th><th className="rarity3 black">Rare:</th><th className="rarity4 black">Epic:</th><th>Total:</th></tr>
            <tr><th>Enchantment Points on main dps</th><td>{effectiveEP}</td><th colSpan="2"></th>
                <td title="E4"><TextInputUnc type="number" value={props.cooldownCommon} min="0" onChange={props.onCooldownCommonChange} /></td>
                <td title="F4"><TextInputUnc type="number" value={props.cooldownUncommon} min="0" onChange={props.onCooldownUncommonChange} /></td>
                <td><TextInputUnc type="number" value={props.cooldownRare} min="0" onChange={props.onCooldownRareChange} /></td>
                <td><TextInputUnc type="number" value={props.cooldownEpic} min="0" onChange={props.onCooldownEpicChange} /></td>
                <td>{cooldown.toFixed(2)}</td>
            </tr>
            <tr><th>Main Dps</th><td colSpan="2"><HeroSelect crusaders={props.crusaders} selectedHeroId={props.selectedHeroId} onHeroChange={props.onHeroChange} /></td><th>Slot</th></tr>
            <tr><th>Main Crusader Enchantments</th><td>{props.mainDpsEP}</td><td /><td className="textcenter vcenter">{dpsHero? dpsHero.slot: ""}</td><th colSpan="6">Put your levels for other talents here to calculate how much you have spent.</th></tr>
            <tr><th>Alt Crusader Enchantments</th><td>{props.dpsSlotEP - props.mainDpsEP}</td><td /><td /><th>Time-O-Rama</th><th>Massive Criticals</th><th>Speed Runner</th><th>Endurance Training</th><th>Gold-o-Splosion</th><th>Sniper</th></tr>
            <tr data-row="8"><th colSpan="2" /><th /><th />
                <td title="timeORama"><TextInputUnc value={props.timeORama} type="number" min="0" max="20" onChange={props.ontimeORamaChange}/></td>
                <td title="massiveCriticals"><TextInputUnc value={props.massiveCriticals} type="number" min="0" max="25" onChange={props.onMassiveCriticalsChange}/></td>
                <td title="speedRunner"><TextInputUnc value={props.speedRunner} type="number" min="0" max="20" onChange={props.onSpeedRunnerChange}/></td>
                <td title="enduranceTraining"><TextInputUnc value={props.enduranceTraining} type="number" min="0" max="20" onChange={props.onEnduranceTrainingChange}/></td>
                <td title="goldOSplosion"><TextInputUnc value={props.goldOSplosion} type="number" min="0" max="25" onChange={props.onGoldOSplosionChange}/></td>
                <td title="sniper"><TextInputUnc value={props.sniper} type="number" min="0" max="40" onChange={props.onSniperChange}/></td>
            </tr>
            <tr data-row="9"><th colSpan="4" /><th>Every Last Cent</th><th>Spend it all</th><th>Upgrade them all</th><th>Scavenger</th><th>Speed Looter</th><th>Efficient Crusading</th></tr>
            <tr data-row="10">
                <th colSpan="4" />
                <td title="everyLastCent"><TextInputUnc value={props.everyLastCent} type="number" min="0" max="20" onChange={props.onEveryLastCentChange}/></td>
                <td title="spendItAll"><TextInputUnc type="number" min="0" max="1" value={props.spendItAll} onChange={props.onSpendItAllChange}/></td>
                <td title="upgradeThemAll"><TextInputUnc type="number" min="0" max="1" value={props.upgradeThemAll} onChange={props.onUpgradeThemAllChange}/></td>
                <td title="scavenger"><TextInputUnc value={props.scavenger} type="number" min="0" max="50" onChange={props.onScavengerChange}/></td>
                <td title="speedLooter"><TextInputUnc value={props.speedLooter} type="number" min="0" max="1" onChange={props.onSpeedLooterChange}/></td>
                <td title="efficientCrusading"><TextInputUnc value={props.efficientCrusading} type="number" min="0" max="25" onChange={props.onEfficientCrusadingChange}/></td>
            </tr>
            <tr data-row="11">
                <th>Number of epics/legendaries on DPS</th><td>{props.mainDpsEpics}</td>
                <th colSpan="2" /><th>Doing it Again</th><th>Deep Idol Scavenger</th><th>Extra Training</th><th>Triple Tier Trouble</th><th></th><th>Total:</th>
            </tr>
            <tr data-row="12">
                <th>Number of epics/legendaries on alts</th><td>{props.dpsSlotEpics - props.mainDpsEpics}</td>
                <th colSpan="2" />
                <td title="doingItAgain"><TextInputUnc value={props.doingItAgain} type="number" min="0" max="1" onChange={props.onDoingItAgainChange}/></td>
                <td title="deepIdolScavenger"><TextInputUnc value={props.deepIdolScavenger} type="number" min="0" max="25" onChange={props.onDeepIdolScavengerChange}/></td>
                <td title="extraTraining"><TextInputUnc value={props.extraTraining} type="number" min="0" max="40" onChange={props.onExtraTrainingChange}/></td>
                <td title="tripleTierTrouble"><TextInputUnc value={props.tripleTierTrouble} type="number" min="0" max="1" onChange={props.onTripleTierTroubleChange}/></td>
                <td />
                <td></td>
                </tr>
            <tr data-row="13" />
            <tr data-row="14" />
            <tr data-row="15">
                <th>Storm Rider Percentage</th>
                <td><TextInputUnc type="number" min="0" step="0.05" max="10" id="stormRiderPercentage" debug={true} value={props.stormRiderPercentage} onChange={props.onStormRiderPercentageChange} /></td>
                <td><RaritySelect gearTypes={props.referenceData.gearTypes} includeGoldens={true}
                                    onChange={val => props.onStormRiderPercentageChange(inspect(getStormRiderPercentageFromRarity(val),'getStormRiderPercentageFromRarity', val))} /></td>
            </tr>
            <tr data-row="16" />
            <tr data-row="17">
                <th colSpan="5">Talents</th>
                <th colSpan="2">Idols Spent on DPS Talents:</th>
                <td></td>
                <td />
                <th />
                {/*<th>Total Idols:</th>*/}
                </tr>
            <tr data-row="18">
                <th><h3>Passive Criticals</h3></th>
                <td />
                <td colSpan="2" />
                <th>current dps buff</th>
                <th>next level dps buff</th>
                <th>percent improvement</th>
                <th>Score(larger is better)</th>
                <td></td>
                {/*<td><TextInputUnc value={props.idols} onChange={props.onIdolsChange} /></td>*/}
                <td />
            </tr>
            <TalentInput dataRow="passiveCriticals" value={props.passiveCriticals} getDps={x => props.critChance < 1 ? "no crit chance entered":props.critChance * x / 100} max="50" costForNextLevel={getNextCost("passiveCriticals")} onChange={props.onPassiveCriticalsChange} />
                <tr>
                    <td>Cost for Next Level</td><td>{props.talents.passiveCriticals.costs[props.passiveCriticals + 1]}</td>
                </tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("passiveCriticals")}</td></tr>
            {/* this was on index 22 : td5={<td>Unspent Idols:</td>}*/}
            <TalentHeaderRow index="22" title="Surplus Cooldown"   />
            <TalentInput value={props.surplusCooldown} dataRow="surplusCooldown" getDps={x => (cooldown - 0.5 )*x/4}  max="50" costForNextLevel={getNextCost("surplusCooldown")} onChange={props.onSurplusCooldownChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("surplusCooldown")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("surplusCooldown")}</td></tr>
            <TalentHeaderRow index="27" title="Overenchanted" />
            <TalentInput value={props.overenchanted} dataRow="overenchanted" getDps={getOverDps}  max="50" costForNextLevel={getNextCost("overenchanted")} onChange={props.onOverenchantedChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("overenchanted")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("overenchanted")}</td></tr>
            <TalentHeaderRow index="31" title="Set Bonus" />
            <TalentInput value={props.setBonus} getDps={x => x * 0.2}  max="50" costForNextLevel={getNextCost("setBonus")} onChange={props.onSetBonusChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("setBonus")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("setBonus")}</td></tr>
            <TalentHeaderRow index="35" title="Sharing is Caring" td2={(<td title="C36-Current enchant lvl">Current EffectiveEP</td>)} td3={(<td title="E36-next level enchant">Next lvl EffectiveEP</td>)} />
            <TalentInput    value={props.sharingIsCaring}
                            max="14"
                            getDps={getSharingDps}
                            costForNextLevel={getNextCost("sharingIsCaring")}
                            onChange={props.onSharingIsCaringChange}
                            td1={<td>{effectiveEP}</td>}
                            td2={<td>{calcEffectiveEP(props.sharingIsCaring + 1, props.mainDpsEP, props.dpsSlotEP)}</td>}
                            />
            <tr><th>Cost for next level</th><td>{getNextCost("sharingIsCaring")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("sharingIsCaring")}</td></tr>
            <TalentHeaderRow index="40" title="Fast Learners" td2={(<td title="C40-Time per XP">Time per XP</td>)} td3={(<td title="D36-Time per XP at next level">Time per XP at next level</td>)} />
            <TalentInput    value={props.fastLearners}
                            getDps={getFastLearnersDps}
                            max="18"
                            costForNextLevel={getNextCost("fastLearners")}
                            onChange={props.onFastLearnersChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("fastLearners")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("fastLearners")}</td></tr>
            <TalentHeaderRow index="44" title="Well Equipped" />
            <TalentInput    value={props.wellEquipped}
                            getDps={getWellEquippedDps}
                            max="50"
                            costForNextLevel={getNextCost("wellEquipped")}
                            onChange={props.onWellEquippedChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("wellEquipped")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("wellEquipped")}</td></tr>
            <TalentHeaderRow index="48" title="Swap Day" />
            <TalentInput    value={props.swapDay}
                            getDps={getSwapDayDps}
                            max="50"
                            costForNextLevel={getNextCost("swapDay")}
                            onChange={props.onSwapDayChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("swapDay")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("swapDay")}</td></tr>
            <TalentHeaderRow index="53" title="Ride The Storm" />
            <TalentInput    value={props.rideTheStorm}
                            getDps={getRideTheStormMagnifiedDps}
                            max="25"
                            costForNextLevel={getNextCost("rideTheStorm")}
                            onChange={props.onRideTheStormChange}
                            td1={(<td>{currentStormRider}</td>)}
                            td2={(<td>{nextStormRider}</td>)}
                            />
            <tr><th>Cost for next level</th><td>{getNextCost("rideTheStorm")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("rideTheStorm")}</td></tr>
            <TalentHeaderRow index="58" title="Storms Building" />
            <TalentInput    value={props.stormsBuilding}
                            getDps={getStormsBuildingDps}
                            max="15"
                            costForNextLevel={getNextCost("stormsBuilding")}
                            onChange={props.onStormsBuildingChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("stormsBuilding")}</td></tr>
            <tr><td>Cumulative Cost</td><td>{getCumulativeCost("stormsBuilding")}</td></tr>
        </tbody>
        </table>
        );
};
app.Inputs.displayName = 'Inputs';
app.Inputs.propTypes = {
    onCritChanceChange: React.PropTypes.func.isRequired,
    critChance:React.PropTypes.number.isRequired,
    // hero may not be selected, and don't put on required, that's an implementation detail this component can handle
    mainDpsEP:React.PropTypes.number,
    // hero may not be selected
    selectedHeroId:React.PropTypes.string,
    // hero may not be selected yet
    heroDpsId:React.PropTypes.string,
    // hero may not be selected yet
    dpsSlotOtherEP:React.PropTypes.number,
    coolDownCommon:React.PropTypes.number,
    cooldownUncommon:React.PropTypes.number,
    cooldownRare:React.PropTypes.number,
    cooldownEpic:React.PropTypes.number,
    onCooldownCommonChange: React.PropTypes.func.isRequired,
    onCooldownUncommonChange: React.PropTypes.func.isRequired,
    onCooldownRareChange: React.PropTypes.func.isRequired,
    onCooldownEpicChange: React.PropTypes.func.isRequired,
    crusaders:React.PropTypes.array.isRequired
};

var talentCalc = props =>{

        var crusaders = props.referenceData.crusaders;

        var talentSelectedCrusader = props.saved.talentCalcHeroId ? {cru : crusaders.find(cru => cru.id == props.saved.talentCalcHeroId), mainDpsEpics:0, dpsSlotEpics:0,mainDpsEP:0} : null;
        if(talentSelectedCrusader && !(talentSelectedCrusader.cru != null))
            talentSelectedCrusader = null;
        if(talentSelectedCrusader){
            var cru = talentSelectedCrusader.cru;
            var savedGear = props.saved.crusaderGear || [];
            var cruRarities = Loot.getSlotRarities(savedGear[cru.id], talentSelectedCrusader.cru.loot);
            var cruEpicCount = cruRarities.reduce((a,b) => a + (b > 3? 1 : 0),0);
            talentSelectedCrusader.mainDpsEpics = cruEpicCount;
            var slotMates = crusaders.filter(x => x.slot == cru.slot);
            talentSelectedCrusader.dpsSlotEpics =
                slotMates
                .map(x =>
                {
                    var g = savedGear[x.id];
                    var rarities = Loot.getSlotRarities(g,x.loot);
                    return rarities;
                })
                .reduce((a,gearArray) => a.concat(gearArray),[]).reduce((a,b) => a + (b > 3 ? 1 : 0),0);
            talentSelectedCrusader.mainDpsEP = getNumberOrDefault(props.saved.enchantmentPoints[cru.id], 0);
            talentSelectedCrusader.dpsSlotEP = +crusaders.filter(x => x.slot == cru.slot).map(x => props.saved.enchantmentPoints[x.id] || 0).reduce((a,b) => +a + +b,0)
        }
        return (<Inputs {...props}
            crusaders={crusaders}
            mainDpsEpics={talentSelectedCrusader && talentSelectedCrusader.mainDpsEpics}
            dpsSlotEpics={talentSelectedCrusader && talentSelectedCrusader.dpsSlotEpics}
            mainDpsEP={talentSelectedCrusader && talentSelectedCrusader.mainDpsEP}
            dpsSlotEP={talentSelectedCrusader && talentSelectedCrusader.dpsSlotEP}
            talents={props.referenceData.talents}
            critChance={getNumberOrDefault(props.saved.critChance, 0)} onCritChanceChange={val => (props.changeSaveState({critChance: inspect(+val || 0, 'changeSaveState crit')}))}
            idols={props.saved.idols} onIdolsChange={val => props.changeSaveState({idols:val})}
            cooldownCommon={getNumberOrDefault(props.saved.cooldownCommon,0)} onCooldownCommonChange={val => props.changeSaveState({cooldownCommon: +val || 0})}
            cooldownUncommon={getNumberOrDefault(props.saved.cooldownUncommon,0)} onCooldownUncommonChange={val => props.changeSaveState({cooldownUncommon: +val || 0})}
            cooldownRare={getNumberOrDefault(props.saved.cooldownRare,0)} onCooldownRareChange={val => props.changeSaveState({cooldownRare: +val || 0})}
            cooldownEpic={getNumberOrDefault(props.saved.cooldownEpic,0)} onCooldownEpicChange={val => props.changeSaveState({cooldownEpic: +val || 0})}
            selectedHeroId={typeof(props.saved.talentCalcHeroId) ==="string"? props.saved.talentCalcHeroId : undefined} onHeroChange={val => props.changeSaveState({talentCalcHeroId:val})}
            timeORama={getNumberOrDefault(props.saved.timeORama)} ontimeORamaChange={val => props.changeSaveState({timeORama:val})}
            massiveCriticals={getNumberOrDefault(props.saved.massiveCriticals,0)} onMassiveCriticalsChange={val => props.changeSaveState({massiveCriticals:val})}
            speedRunner={getNumberOrDefault(props.saved.speedRunner,0)} onSpeedRunnerChange={val => props.changeSaveState({speedRunner:val})}
            enduranceTraining={getNumberOrDefault(props.saved.enduranceTraining,0)} onEnduranceTrainingChange={val => props.changeSaveState({enduranceTraining:val})}
            goldOSplosion={getNumberOrDefault(props.saved.goldOSplosion,0)} onGoldOSplosionChange={val => props.changeSaveState({goldOSplosion:val})}
            sniper={getNumberOrDefault(props.saved.sniper,0)} onSniperChange={val => props.changeSaveState({sniper:val})}
            everyLastCent={getNumberOrDefault(props.saved.everyLastCent,0)} onEveryLastCentChange={val => props.changeSaveState({everyLastCent:val})}
            spendItAll={getNumberOrDefault(props.saved.spendItAll,0)} onSpendItAllChange={val => props.changeSaveState({spendItAll:val})}
            upgradeThemAll={getNumberOrDefault(props.saved.upgradeThemAll,0)} onUpgradeThemAllChange={val => props.changeSaveState({upgradeThemAll:val})}
            scavenger={getNumberOrDefault(props.saved.scavenger,0)} onScavengerChange={val => props.changeSaveState({scavenger:val})}
            speedLooter={getNumberOrDefault(props.saved.speedLooter,0)} onSpeedLooterChange={val => props.changeSaveState({speedLooter:val})}
            efficientCrusading={getNumberOrDefault(props.saved.efficientCrusading,0)} onEfficientCrusadingChange={val => props.changeSaveState({efficientCrusading:val})}
            doingItAgain={getNumberOrDefault(props.saved.doingItAgain,0)} onDoingItAgainChange={val => props.changeSaveState({doingItAgain:val})}
            deepIdolScavenger={getNumberOrDefault(props.saved.deepIdolScavenger,0)} onDeepIdolScavengerChange={val => props.changeSaveState({deepIdolScavenger:val})}
            extraTraining={getNumberOrDefault(props.saved.extraTraining,0)} onExtraTrainingChange={val => props.changeSaveState({extraTraining:val})}
            tripleTierTrouble={getNumberOrDefault(props.saved.tripleTierTrouble,0)} onTripleTierTroubleChange={val => props.changeSaveState({tripleTierTrouble:val})}
            passiveCriticals={getNumberOrDefault(props.saved.passiveCriticals,0)} onPassiveCriticalsChange={val => props.changeSaveState({passiveCriticals:val})}
            surplusCooldown={getNumberOrDefault(props.saved.surplusCooldown,0)} onSurplusCooldownChange={val => props.changeSaveState({surplusCooldown:val})}
            overenchanted={getNumberOrDefault(props.saved.overenchanted,0)} onOverenchantedChange={val => props.changeSaveState({overenchanted:val})}
            setBonus={getNumberOrDefault(props.saved.setBonus,0)} onSetBonusChange={val => props.changeSaveState({setBonus:val})}
            sharingIsCaring={getNumberOrDefault(props.saved.sharingIsCaring,0)} onSharingIsCaringChange={val => props.changeSaveState({sharingIsCaring:val})}
            fastLearners={getNumberOrDefault(props.saved.fastLearners,0)} onFastLearnersChange={val => props.changeSaveState({fastLearners:val})}
            wellEquipped={getNumberOrDefault(props.saved.wellEquipped,0)} onWellEquippedChange={val => props.changeSaveState({wellEquipped:val})}
            swapDay={getNumberOrDefault(props.saved.swapDay,0)} onSwapDayChange={val => props.changeSaveState({swapDay:val})}
            rideTheStorm={getNumberOrDefault(props.saved.rideTheStorm,0)} onRideTheStormChange={val => props.changeSaveState({rideTheStorm:val})}
            stormRiderPercentage={getNumberOrDefault(props.saved.stormRiderPercentage,0)} onStormRiderPercentageChange={val => props.changeSaveState({stormRiderPercentage:val})}
            stormsBuilding={getNumberOrDefault(props.saved.stormsBuilding,0)} onStormsBuildingChange={val => props.changeSaveState({stormsBuilding:val})}
         />);
};
talentCalc.displayName = 'TalentCalc';
app.TalentCalc = talentCalc;
})(typeof global !== 'undefined' ? global : window);