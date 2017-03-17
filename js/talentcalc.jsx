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
app.getCooldown = (c,u,r,e) =>
(c * 0.5 + u + r * 1.5 + e * 2) / 100;

app.Inputs = props =>
{
    var cooldown = (app.getCooldown(props.cooldownCommon, props.cooldownUncommon, props.cooldownRare, props.cooldownEpic) * 100);
    var dpsHero = props.crusaders.find(cru => cru.id === props.selectedHeroId);
    var effectiveEP = calcEffectiveEP(props.sharingIsCaringLevel, props.mainDpsEP, props.dpsSlotEP);
    console.log('Inputs mainDpsEP', props.mainDpsEP, typeof(props.mainDpsEP));
    return (<table>
        <thead>
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
            <tr>
                </tr>
            <tr>
                <td title="z"><TextInputUnc value={props.z} onChange={props.onz}/></td>
                </tr>
        </thead>
        <tbody>
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


app.TalentCalc = props =>
(<Inputs {...props} />);
app.TalentCalc.displayName = 'TalentCalc';
})(window)