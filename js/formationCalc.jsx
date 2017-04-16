(app =>{
    app.WorldsWake = class WorldsWake extends React.Component{
        render(){
            return (<div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr title="row0"><td title="slot0">
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td> </tr>
                        <tr title="row1"><td title="slot1"/><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td></tr>
                        <tr title="row2"><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td> 
                            <td />
                            <td> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/> </td> 
                        </tr>
                        <tr title="row3"><td /><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td><td /><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td>

                        </tr>
                        <tr title="row4">
                            <td> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/> </td> 
                            <td />
                            <td> <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/> </td> 
                            </tr>
                        <tr title="row5"><td /><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td>
                            </tr>
                        <tr title="row6"><td>
                            <HeroSelect dontSort={true} crusaders={jsonData.crusaders}/>
                            </td> 
                        </tr>
                </tbody>
                </table>
            </div>);
        }
    };
    app.FormationCalc = class FormationCalc extends React.Component{
        constructor(){
            super();
            this.state = {selectedWorld:"World's Wake'"};
        }
        render(){
            var worlds = [
                worldsWake
            ];
            var formation;
            if(this.state.selectedWorld == "World's Wake");
            formation = <WorldsWake />;
            return (<div>
                <select>
                {
                    worlds.map(w => <option key={w.name} value={w.name}>{w.name}</option>)
                    });
                }
                </select>
                {formation}
                </div>
                )
        }
    }
})(window)
