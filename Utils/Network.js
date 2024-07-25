//QUERIES FOR NETWORK GRAPH  ////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR NETWORK GRAPH TIME CONFINES
export function fetchNetworkConfines() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        return null
    } else {
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = parseFloat(internalId)
                } else {
                    nodeIdFilter = ""
                }
                const session = this.driver.session();
                const query =
                    ` WITH people_relationships AS (SELECT n.start_year, n.end_year
                                                    FROM people_presentat_institutions n
                                                    WHERE n.entity_from_id = ${nodeIdFilter}
                                                    UNION ALL
                                                    SELECT n.start_year, n.end_year
                                                    FROM people_presentat_events n
                                                    WHERE n.entity_from_id = ${nodeIdFilter}
                                                    UNION ALL
                                                    SELECT n.start_year, n.end_year
                                                    FROM people_involvedwith_publications n
                                                    WHERE n.entity_from_id = ${nodeIdFilter}
                                                    UNION ALL
                                                    SELECT n.start_year, n.end_year
                                                    FROM people_relatedto_people n
                                                    WHERE n.entity_from_id = ${nodeIdFilter}
                                                    UNION ALL
                                                    SELECT n.start_year, n.end_year
                                                    FROM people_partof_corporateentities n
                                                    WHERE n.entity_from_id = ${nodeIdFilter}
                                                    UNION ALL
                                                    SELECT n.start_year, n.end_year
                                                    FROM people_presentat_generalareas n
                                                    WHERE n.entity_from_id = ${nodeIdFilter})
                      SELECT MIN(years) AS start, MAX(years) AS end
                      FROM (SELECT n.birth_year AS years
                            FROM people n
                                     JOIN people_relationships t ON n.id = ${nodeIdFilter}
                            UNION ALL
                            SELECT n.death_year AS years
                            FROM people n
                                     JOIN people_relationships t ON n.id = ${nodeIdFilter}
                            UNION ALL
                            SELECT DISTINCT t.start_year AS years
                            FROM people_relationships t
                                     JOIN people n ON n.id = ${nodeIdFilter}
                            UNION ALL
                            SELECT DISTINCT t.end_year AS years
                            FROM people_relationships t
                                     JOIN people n ON n.id = ${nodeIdFilter}) AS YearList
                    `

                session.run(query).then((results) => {
                    const networkConfines = results.records.map((record) => record.get('Confines'));
                    let start;
                    let end;
                    if (this.state.start_year === "") {
                        start = networkConfines[0].start
                    } else {
                        start = this.state.start_year
                    }
                    if (this.state.end_year === "") {
                        end = networkConfines[0].end
                    } else {
                        end = this.state.end_year
                    }
                    this.setState({start_year: start})
                    this.setState({end_year: end})
                    this.setState({time_disable: false})
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
        this.setState({nosend: "nosend"})
    } else {
        this.setState({content: "loading"});
        this.setState({nodeArray: []});
        this.setState({printArray: []});
        this.setState({append: this.state.append + 1});

        //SET CENTRAL NODE
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = '' + parseFloat(internalId) + ' '
                } else {
                    nodeIdFilter = ""
                }
                ;

                //SET NETWORK CONFINES
                let start;
                let end;

                const session1 = this.driver.session();
                // TODO: Code repetition
                const query2 = `
          MATCH (n)-[t]-(o) WHERE id(n)=` + nodeIdFilter + `
          WITH collect(n.birth_year)+collect(n.death_year)+collect(DISTINCT t.start_year)+collect(DISTINCT t.end_year) as list
          UNWIND list as years
          WITH years ORDER BY years
          WITH (head(collect(distinct years))) as head, (last(collect(distinct years))) as last
          RETURN {start:head, end:last} as Confines
          `
                session1.run(query2).then((results) => {
                    const networkConfines = results.records.map((record) => record.get('Confines'));
                    if (this.state.start_year === "") {
                        start = networkConfines[0].start
                    } else {
                        start = this.state.start_year
                    }
                    if (this.state.end_year === "") {
                        end = networkConfines[0].end
                    } else {
                        end = this.state.end_year
                    }
                    this.setState({start_year: start})
                    this.setState({end_year: end})
                    this.setState({time_disable: false})
                    session1.close()
                });

                //CONSTRUCT FILTERS FROM USER INPUT
                let degreeFilter;
                if (this.state.degree !== 1) {
                    degreeFilter = this.state.degree
                } else {
                    degreeFilter = 1
                }
                ;
                let peopleFilter;
                if (this.state.people_include === true) {
                    peopleFilter = "+"
                } else {
                    peopleFilter = "-"
                }
                let instFilter;
                if (this.state.inst_include === true) {
                    instFilter = "+"
                } else {
                    instFilter = "-"
                }
                let corpFilter;
                if (this.state.corp_include === true) {
                    corpFilter = "+"
                } else {
                    corpFilter = "-"
                }
                let eventFilter;
                if (this.state.event_include === true) {
                    eventFilter = "+"
                } else {
                    eventFilter = "-"
                }
                let pubFilter;
                if (this.state.pub_include === true) {
                    pubFilter = "+"
                } else {
                    pubFilter = "-"
                }
                //CONCAT FILTERS
                const filterStatic = [nodeIdFilter]
                const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

                //CONSTRUCT QUERY WITH VARIABLES
                const session = this.driver.session();

                let startFilter = null;
                let endFilter = null;
                if (this.state.end_year !== "") {
                    endFilter = this.state.end_year
                }
                if (this.state.start_year !== "") {
                    startFilter = this.state.start_year
                }

                const query = `WITH RECURSIVE SubgraphCTE AS (SELECT t.*,
                                                                     1 AS level
                                                              FROM Relationship t
                                                              WHERE (t.entity_from_id = ${nodeIdFilter} OR t.entity_to_id = ${nodeIdFilter})
                                                                AND t.entity_to_id like ${nodeTypeFilter}
                                                                AND (t.start_year >= ${startYearFilter} AND
                                                                     (t.start_year <= ${endYearFilter} OR t.end_year <= ${endYearFilter}))
                                                              UNION ALL
                                                              SELECT t.*,
                                                                     sg.level + 1
                                                              FROM Relationship t
                                                                       JOIN SubgraphCTE sg
                                                                            ON (sg.entity_to_id = t.entity_from_id AND
                                                                                t.entity_from_id like ${nodeTypeFilter})
                                                                                OR (sg.entity_to_id = t.entity_to_id AND
                                                                                    t.entity_to_id like
                                                                                    ${nodeTypeFilter})
                                                              WHERE sg.level < ${degreeFilter}
                                                                AND (t.start_year >= ${startYearFilter} AND
                                                                     (t.start_year <= ${endYearFilter} OR t.end_year <= ${endYearFilter})))
                               SELECT json_build_object(
                                              'nodes', json_agg(DISTINCT jsonb_build_object(
                                               'key', n.id,
                                               'properties', n.*
                                                                         )),
                                              'links', json_agg(DISTINCT jsonb_build_object(
                                               'source', t.entity_from_id,
                                               'target', t.entity_to_id,
                                               'start_year', t.start_year,
                                               'end_year', t.end_year
                                                                         ))
                                      ) AS Graph
                               FROM SubgraphCTE t
                                        JOIN nodes n ON t.entity_from_id = n.id OR t.entity_to_id = n.id;`

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
                            ) {
                                links.push(ulinks[i])
                            }
                        }
                        const nodeArray = [{nodes: newArray[0].nodes, links: links,}]
                        if (nodeArray.length === 0) {
                            this.setState({noresults: "noresults"})
                        } else {
                            this.setState({nodeArray});
                            this.setState({noresults: "noresults hide"})
                            this.setState({content: "loaded"})
                        }
                        session.close()
                    });
            })
            .catch((error) => {
                console.error("Error:", error);
            });

    }
};
