//QUERIES FOR NETWORK GRAPH  ////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR NETWORK GRAPH TIME CONFINES
export function fetchNetworkConfines() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") { return null }
    else {
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = 'WHERE id(n) =' + parseFloat(internalId) + ' '
                } else { nodeIdFilter = "" };
                const session = this.driver.session();
                const query = `
        MATCH (n)-[t]-(o)`+ nodeIdFilter + `
        WITH collect(n.birth_year)+collect(n.death_year)+collect(DISTINCT t.start_year)+collect(DISTINCT t.end_year) as list
        UNWIND list as years
        WITH years ORDER BY years
        WITH (head(collect(distinct years))) as head, (last(collect(distinct years))) as last
        RETURN {start:head, end:last} as Confines
        `
                session.run(query).then((results) => {
                    const networkConfines = results.records.map((record) => record.get('Confines'));
                    let start;
                    let end;
                    if (this.state.start_year === "") { start = networkConfines[0].start } else { start = this.state.start_year }
                    if (this.state.end_year === "") { end = networkConfines[0].end } else { end = this.state.end_year }
                    this.setState({ start_year: start })
                    this.setState({ end_year: end })
                    this.setState({ time_disable: false })
                    session.close()
                });
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
};

//QUERY FOR NETWORK GRAPH RESULTS
export function fetchNetworkResults() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({ nosend: "nosend" })
    }
    else {
        this.setState({ content: "loading" });
        this.setState({ nodeArray: [] });
        this.setState({ printArray: [] });
        this.setState({ append: this.state.append + 1 });

        //SET CENTRAL NODE
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = '' + parseFloat(internalId) + ' '
                } else { nodeIdFilter = "" };

                //SET NETWORK CONFINES
                let start;
                let end;

                const session1 = this.driver.session();
                const query2 = `
          MATCH (n)-[t]-(o) WHERE id(n)=`+ nodeIdFilter + `
          WITH collect(n.birth_year)+collect(n.death_year)+collect(DISTINCT t.start_year)+collect(DISTINCT t.end_year) as list
          UNWIND list as years
          WITH years ORDER BY years
          WITH (head(collect(distinct years))) as head, (last(collect(distinct years))) as last
          RETURN {start:head, end:last} as Confines
          `
                session1.run(query2).then((results) => {
                    const networkConfines = results.records.map((record) => record.get('Confines'));
                    if (this.state.start_year === "") { start = networkConfines[0].start } else { start = this.state.start_year }
                    if (this.state.end_year === "") { end = networkConfines[0].end } else { end = this.state.end_year }
                    this.setState({ start_year: start })
                    this.setState({ end_year: end })
                    this.setState({ time_disable: false })
                    session1.close()
                });

                //CONSTRUCT FILTERS FROM USER INPUT
                let degreeFilter; if (this.state.degree !== 1) { degreeFilter = this.state.degree } else { degreeFilter = 1 };
                let peopleFilter; if (this.state.people_include === true) { peopleFilter = "+" } else { peopleFilter = "-" }
                let instFilter; if (this.state.inst_include === true) { instFilter = "+" } else { instFilter = "-" }
                let corpFilter; if (this.state.corp_include === true) { corpFilter = "+" } else { corpFilter = "-" }
                let eventFilter; if (this.state.event_include === true) { eventFilter = "+" } else { eventFilter = "-" }
                let pubFilter; if (this.state.pub_include === true) { pubFilter = "+" } else { pubFilter = "-" }
                //CONCAT FILTERS
                const filterStatic = [nodeIdFilter]
                const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

                //CONSTRUCT QUERY WITH VARIABLES
                const session = this.driver.session();

                let startFilter = null;
                let endFilter = null;
                if (this.state.end_year !== "") { endFilter = this.state.end_year }
                if (this.state.start_year !== "") { startFilter = this.state.start_year }

                const query = `MATCH (n)-[t]-(o)
          WHERE id(n) = ` + nodeIdFilter + `
          WITH DISTINCT n, t, o
          CALL apoc.path.subgraphAll(n, {
            maxLevel: `+ degreeFilter + `,
            labelFilter: "` + peopleFilter + `Person|` + instFilter + `Institution|` + corpFilter + `CorporateEntity|` + eventFilter + `Event|` + pubFilter + `Publication|-Village|-Township|-County|-Prefecture|-Province"
          })
          YIELD nodes, relationships
          WITH nodes, relationships
          UNWIND nodes AS ender
          MATCH (ender:Person)-[p]-(q)
          WHERE ( 
            (${endFilter} IS NOT NULL AND p.start_year >= ${endFilter}) OR
            (${startFilter} IS NOT NULL AND p.end_year <= ${startFilter})
          )
          WITH collect(DISTINCT ender) AS endNodes
          MATCH (y)
          WHERE id(y) = `+ nodeIdFilter + `
          CALL apoc.path.subgraphAll(y, {
            maxLevel: `+ degreeFilter + `,
            labelFilter: "` + peopleFilter + `Person|` + instFilter + `Institution|` + corpFilter + `CorporateEntity|` + eventFilter + `Event|` + pubFilter + `Publication|-Village|-Township|-County|-Prefecture|-Province",
            blacklistNodes: endNodes
          })
          YIELD nodes, relationships
          WITH nodes, relationships
          RETURN {
            nodes: [node in nodes | node {key: node.id, label: labels(node)[0], properties: properties(node)}],
            links: [rel in relationships | rel {source: startNode(rel).id, target: endNode(rel).id, start_year: rel.start_year, end_year: rel.end_year}]
          } as Graph`

                session
                    .run(query)
                    .then((results) => {
                        const newArray = results.records.map((record) => record.get('Graph'));
                        let ulinks = newArray[0].links;
                        let links = [];
                        for (let i = 0; i < ulinks.length; i++) {
                            if ((
                                (this.state.start_year !== "" && this.state.end_year !== "") &&
                                (ulinks[i].start_year >= this.state.start_year && ulinks[i].end_year <= this.state.end_year && ulinks[i].start_year <= this.state.end_year || ulinks[i].end_year === null && ulinks[i].start_year === null)
                            ) || (
                                (this.state.start_year === "" && this.state.end_year !== "") &&
                                (ulinks[i].start_year <= this.state.end_year || ulinks[i].end_year <= this.state.end_year || ulinks[i].end_year === null)
                            ) || (
                                (this.state.start_year !== "" && this.state.end_year === "") &&
                                (ulinks[i].start_year >= this.state.state_year || ulinks[i].end_year >= this.state.start_year || ulinks[i].start_year === null)
                            ) || (
                                (this.state.start_year === "" && this.state.end_year === "")
                            )
                            ) { links.push(ulinks[i]) }
                        }
                        const nodeArray = [{ nodes: newArray[0].nodes, links: links, }]
                        if (nodeArray.length === 0) { this.setState({ noresults: "noresults" }) }
                        else {
                            this.setState({ nodeArray });
                            this.setState({ noresults: "noresults hide" })
                            this.setState({ content: "loaded" })
                        }
                        session.close()
                    });
            })
            .catch((error) => {
                console.error("Error:", error);
            });

    }
};
