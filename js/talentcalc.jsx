(app => {
// app.reactClasses = app.reactClasses || {};
app.HeroSelect = props =>
{
    var crusaders = props.crusaders.slice(0);
    crusaders.sort((a,b)=> {
        if(a.tags.includes("dps") && !b.tags.includes("dps"))
            return -1;
        if(!a.tags.includes("dps") && b.tags.includes("dps"))
            return 1;
        if(a.slot < b.slot)
            return -1;
        if(a.slot > b.slot)
            return 1;

        return 0;
    });
    var options = crusaders
        .map(cru =>
        <option key={cru.id} className={cru.tags.includes("dps")? "dps" : ""} value={cru.id}>{cru.displayName}</option>
    );
    var selectedCrusader = crusaders.find(cru => cru.id === props.selectedHeroId);
    console.log('HeroSelect',props.selectedHeroId, selectedCrusader);
    return(
    <select value={props.selectedHeroId || "0"} className={selectedCrusader && selectedCrusader.tags && selectedCrusader.tags.includes("dps") ? "dps" : "" } onChange={e => props.onHeroChange(e.target.value)}>
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
app.getCooldown = (c,u,r,e) => (c * 0.5 + u + r * 1.5 + e * 2) / 100;

app.TalentHeaderRow = props =>{
    return (            <tr data-row={props.index}>
                <th>{props.title}</th>
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
    var dpsBuff = props.getDps(props.value);
    var nextDps = props.getDps(props.value + 1);
    // (F19+1)-(E19+1)/(E19+1)
    var impr = (nextDps - dpsBuff)/(dpsBuff + 1);
    //=IFERROR(IF(and(B$13 >= 1,B20<=$J$23), G19/B20*100000, 0),0)
    var score = impr / props.costForNextLevel * 100000;
    console.log('TalentInput', props.value, dpsBuff, nextDps, impr, score);
    return (<tr data-row={props.dataRow? props.dataRow: undefined}>
        <th>Current level</th>
        <td><TextInputUnc value={props.value} onChange={props.onChange} /></td>
        {props.getTd1 ? props.getTd1(): <td />}
        {props.getTd2 ? props.getTd2(): <td />}
        <td className="textcenter">{dpsBuff}</td>
        <td className="textcenter">{nextDps}</td>
        <td className="textcenter">{(impr * 100).toFixed(2)}%</td>
        <td className="textcenter">{score ? score.toFixed(2) + '%' : null}</td>
    </tr>)
};

app.Inputs = props =>
{
    var cooldown = (app.getCooldown(props.cooldownCommon, props.cooldownUncommon, props.cooldownRare, props.cooldownEpic) * 100);
    var dpsHero = props.crusaders.find(cru => cru.id === props.selectedHeroId);
    var effectiveEP = calcEffectiveEP(props.sharingIsCaringLevel, props.mainDpsEP, props.dpsSlotEP);
    // console.log('Inputs mainDpsEP', props.mainDpsEP, typeof(props.mainDpsEP));
    console.log('Inputs passiveCriticals', props.passiveCriticals, props.talents.passiveCriticals.costs.length);
    var getNextCost = name => props[name] != null && props.talents[name].costs != null && props.talents[name].costs.length > props[name] ? props.talents[name].costs[props[name] + 1] : undefined;
    // var passiveCriticalsNextCost = props.passiveCriticals != null && props.talents.passiveCriticals.costs.length > props.passiveCriticals ? props.talents.passiveCriticals.costs[props.passiveCriticals + 1]: undefined;
    var getEnchantBuff = olvl => (olvl * 0.2 + 1) * 0.25;
    var getOverDps = x => ((1 + getEnchantBuff(x)*props.mainDpsEP) - (1 + 0.25*props.mainDpsEP)) / (1 + 0.25 * props.mainDpsEP);
    var currentEnchantBuff = getEnchantBuff(props.overenchanted);
    var getSharingDps = x => effectiveEP*currentEnchantBuff  - currentEnchantBuff + Math.round(props.dpsSlotEP - props.mainDpsEP);
    return (<table>
        <thead>
            </thead>
            <tbody>
            <tr><th>Crit Chance %</th><td><TextInputUnc onChange={val => props.onCritChanceChange(val)} value={props.critChance} /></td><td>%</td><td title="D"></td><th colSpan="5">Horn and Cornucopia Trinkets</th></tr>
            <tr><th>Ability Cooldown %</th><td>{cooldown}</td><td title="C"></td><td></td><th className="rarity1 black">Common:</th><th className="rarity2 black">Uncommon:</th><th className="rarity3 black">Rare:</th><th className="rarity4 black">Epic:</th><th>Total:</th></tr>
            <tr><th>Enchantment Points on main dps</th><td>{effectiveEP}</td><th colSpan="2"></th>
                <td title="E4"><TextInputUnc type="number" value={props.cooldownCommon} onChange={props.onCooldownCommonChange} /></td>
                <td title="F4"><TextInputUnc type="number" value={props.cooldownUncommon} onChange={props.onCooldownUncommonChange} /></td>
                <td><TextInputUnc type="number" value={props.cooldownRare} onChange={props.onCooldownRareChange} /></td>
                <td><TextInputUnc type="number" value={props.cooldownEpic} onChange={props.onCooldownEpicChange} /></td>
                <td>{cooldown.toFixed(2)}</td>
            </tr>
            <tr><th>Main Dps</th><td colSpan="2"><HeroSelect crusaders={props.crusaders} selectedHeroId={props.selectedHeroId} onHeroChange={props.onHeroChange} /></td><th>Slot</th></tr>
            <tr><th>Main Crusader Enchantments</th><td>{props.mainDpsEP}</td><td /><td className="textcenter vcenter">{dpsHero? dpsHero.slot: ""}</td><th colSpan="6">Put your levels for other talents here to calculate how much you've spent.</th></tr>
            <tr><th>Alt Crusader Enchantments</th><td>{props.dpsSlotEP - props.mainDpsEP}</td><td /><td /><th>Time-O-Rama</th><th>Massive Criticals</th><th>Speed Runner</th><th>Endurance Training</th><th>Gold-o-Splosion</th><th>Sniper</th></tr>
            <tr data-row="8"><th colSpan="2" /><th /><th />
                <td title="timeORama"><TextInputUnc value={props.timeORama} onChange={props.ontimeORamaChange}/></td>
                <td title="massiveCriticals"><TextInputUnc value={props.massiveCriticals} onChange={props.onMassiveCriticalsChange}/></td>
                <td title="speedRunner"><TextInputUnc value={props.speedRunner} onChange={props.onSpeedRunnerChange}/></td>
                <td title="enduranceTraining"><TextInputUnc value={props.enduranceTraining} onChange={props.onEnduranceTrainingChange}/></td>
                <td title="goldOSplosion"><TextInputUnc value={props.goldOSplosion} onChange={props.onGoldOSplosionChange}/></td>
                <td title="sniper"><TextInputUnc value={props.sniper} onChange={props.onSniperChange}/></td>
            </tr>
            <tr data-row="9"><th colSpan="4" /><th>Every Last Cent</th><th>Spend it all</th><th>Upgrade them all</th><th>Scavenger</th><th>Speed Looter</th><th>Efficient Crusading</th></tr>
            <tr data-row="10">
                <th colSpan="4" />
                <td title="everyLastCent"><TextInputUnc value={props.everyLastCent} onChange={props.onEveryLastCentChange}/></td>
                <td title="spendItAll"><TextInputUnc value={props.spendItAll} onChange={props.onSpendItAllChange}/></td>
                <td title="upgradeThemAll"><TextInputUnc value={props.upgradeThemAll} onChange={props.onUpgradeThemAllChange}/></td>
                <td title="scavenger"><TextInputUnc value={props.scavenger} onChange={props.onScavengerChange}/></td>
                <td title="speedLooter"><TextInputUnc value={props.speedLooter} onChange={props.onSpeedLooterChange}/></td>
                <td title="efficientCrusading"><TextInputUnc value={props.efficientCrusading} onChange={props.onEfficientCrusadingChange}/></td>
            </tr>
            <tr data-row="11">
                <th>Number of epics/legendaries on DPS</th><td>{props.mainDpsEpics}</td>
                <th colSpan="2" /><th>Doing it Again</th><th>Deep Idol Scavenger</th><th>Extra Training</th><th>Triple Tier Trouble</th><th></th><th>Total:</th>
            </tr>
            <tr data-row="12">
                <th>Number of epics/legendaries on alts</th><td>{props.dpsSlotEpics - props.mainDpsEpics}</td>
                <th colSpan="2" />
                <td title="doingItAgain"><TextInputUnc value={props.doingItAgain} onChange={props.onDoingItAgainChange}/></td>
                <td title="deepIdolScavenger"><TextInputUnc value={props.deepIdolScavenger} onChange={props.onDeepIdolScavengerChange}/></td>
                <td title="extraTraining"><TextInputUnc value={props.extraTraining} onChange={props.onExtraTrainingChange}/></td>
                <td title="tripleTierTrouble"><TextInputUnc value={props.tripleTierTrouble} onChange={props.onTripleTierTroubleChange}/></td>
                <td />
                <td></td>
                </tr>
            <tr data-row="13" />
            <tr data-row="14" />
            <tr data-row="15" />
            <tr data-row="16" />
            <tr data-row="17">
                <th colSpan="5">Talents</th>
                <th colSpan="2">Idols Spent on DPS Talents:</th>
                <td></td>
                <td />
                <th>Total Idols:</th>
                </tr>
            <tr data-row="18">
                <th>Passive Criticals</th>
                <td />
                <td colSpan="2" />
                <th>current dps buff</th>
                <th>next level dps buff</th>
                <th>percent improvement</th>
                <th>Score(larger is better)</th>
                <td></td>
                <td><TextInputUnc value={props.passiveCriticals} onChange={props.onpassiveCriticalsChange} /></td>
            </tr>
            <TalentInput value={props.passiveCriticals} getDps={x => props.critChance * x / 100} costForNextLevel={getNextCost("passiveCriticals")} onChange={props.onPassiveCriticalsChange} />
                <tr>
                    <td>Cost for Next Level</td><td>{props.talents.passiveCriticals.costs[props.passiveCriticals + 1]}</td>
                </tr>
            <tr />
            <TalentHeaderRow index="22" title="Surplus Cooldown" td5={<td>Unspect Idols:</td>}  />
            <TalentInput value={props.surplusCooldown} getDps={x => (cooldown - 0.5 )*x/4} costForNextLevel={getNextCost("surplusCooldown")} onChange={props.onSurplusCooldownChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("surplusCooldown")}</td></tr>
            <TalentHeaderRow index="27" title="Overenchanted" />
            <TalentInput value={props.overenchanted} getDps={getOverDps} costForNextLevel={getNextCost("overenchanted")} onChange={props.onOverenchantedChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("overenchanted")}</td></tr>
            <tr />
            <TalentHeaderRow index="31" title="Set Bonus" />
            <TalentInput value={props.setBonus} getDps={x => x * 0.2} costForNextLevel={getNextCost("setBonus")} onChange={props.onSetBonusChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("setBonus")}</td></tr>
            <tr />
            <TalentHeaderRow index="35" title="Sharing is Caring" />
            <TalentInput value={props.sharingIsCaring} getDps={x => x} costForNextLevel={getNextCost("sharingIsCaring")} onChange={props.onSharingIsCaringChange} />
            <tr><th>Cost for next level</th><td>{getNextCost("sharingIsCaring")}</td></tr>
            <tr />
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


app.TalentCalc = React.createClass({
    render(){
        var props = this.props;
        var crusaders = props.referenceData.crusaders;

        var talentSelectedCrusader = props.saved.talentCalcHeroId ? {cru : crusaders.find(cru => cru.heroId == props.saved.talentCalcHeroId), mainDpsEpics:0, dpsSlotEpics:0,mainDpsEP:0} : null;
        if(talentSelectedCrusader && !(talentSelectedCrusader.cru != null))
            talentSelectedCrusader = null;
        if(talentSelectedCrusader){
            var cru = talentSelectedCrusader.cru;
            var savedGear = props.saved.crusaderGear || [];
            var cruRarities = getSlotRarities(savedGear[cru.id]).reduce((a,b) => a + (b > 3? 1 : 0),0);

            talentSelectedCrusader.mainDpsEpics = cruRarities;
            var slotMates = crusaders.filter(x => x.slot == cru.slot);
            talentSelectedCrusader.dpsSlotEpics = slotMates.map(x => savedGear[x.id]).map(getSlotRarities).reduce((a,gearArray) => a.concat(gearArray),[]).reduce((a,b) => a + (b > 3 ? 1 : 0),0);
            talentSelectedCrusader.mainDpsEP = getNumberOrDefault(props.saved.enchantmentPoints[cru.id], 0);
            talentSelectedCrusader.dpsSlotEP = +crusaders.filter(x => x.slot == cru.slot).map(x => props.saved.enchantmentPoints[x.id] || 0).reduce((a,b) => +a + +b,0)
        }
        console.log('talentSelectedCrusader',talentSelectedCrusader);
        return (<Inputs {...props}
            sharingIsCaringLevel={+props.saved.sharingIsCaringLevel}
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
         />);
    }
});
app.TalentCalc.displayName = 'TalentCalc';
})(window)