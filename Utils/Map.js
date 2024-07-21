// QUERY TO FETCH RESULTS FOR MAP ///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function fetchResults() {
    if (
        this.state.family_name_western === "" &&
        this.state.given_name_western === "" &&
        this.state.name_western === "" &&
        this.state.institution_category === "All" &&
        this.state.institution_subcategory === "All" &&
        this.state.event_category === "All" &&
        this.state.event_subcategory === "All" &&
        this.state.gender === "All" &&
        this.state.nationality === "All" &&
        this.state.affiliation === "All" &&
        this.state.religious_family === "All" &&
        this.state.start_year === "" &&
        this.state.end_year === "") {
        this.setState({ nosend: "nosend" })
    } else {
        this.setState({ append: this.state.append + 1 })
        this.setState({ content: "loading" })
        this.setState({ printArray: [], })
        const session = this.driver.session();

        //CONSTRUCT FILTERS FROM USER INPUT
        fetchNeo4jId(this.state.sent_id, this.driver)
            .then((internalId) => {
                let personNameFilter;
                if (this.state.family_name_western === "" && this.state.given_name_western === "") { personNameFilter = "" }
                else if (this.state.family_name_western !== "" && this.state.given_name_western === "") { personNameFilter = '(toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")' }
                else if (this.state.family_name_western === "" && this.state.given_name_western !== "") { personNameFilter = '(toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")' }
                else if (this.state.family_name_western !== "" && this.state.given_name_western !== "") { personNameFilter = '(toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*") AND (toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")' }

                let personNameFilter2;
                if (this.state.sent_id !== "init" && this.state.kind === "People") { personNameFilter2 = " AND " + personNameFilter }
                else if (this.state.start_year !== "" | this.state.end_year !== "" && personNameFilter !== "") { personNameFilter2 = " AND " + personNameFilter }
                else if (personNameFilter === "") { personNameFilter2 = "" }
                else { personNameFilter2 = " WHERE " + personNameFilter }

                let nameFilter2;
                if (this.state.name_western !== "") { nameFilter2 = 'AND (toLower(r.name_western)= "(?i)' + this.state.name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(r.name_western)=~ "(?i)' + this.state.name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")' }
                else { nameFilter2 = "" };

                let icatFilter; if (this.state.institution_category === "All") { icatFilter = "" } else if (this.state.institution_category !== "All" || this.state.institution_category !== "") { icatFilter = 'institution_category: "' + this.state.institution_category + '"' } else { icatFilter = "" };

                let isubcatFilter; if (this.state.institution_subcategory === "All") { isubcatFilter = "" } else if (this.state.institution_subcategory !== "All" || this.state.institution_subcategory !== "") { isubcatFilter = 'institution_subcategory: "' + this.state.institution_subcategory + '"' } else { isubcatFilter = "" };

                let genderFilter; if (this.state.gender !== "All") { genderFilter = 'gender: "' + this.state.gender + '"' } else { genderFilter = "" };

                let nationalityFilter; if (this.state.nationality === "All") { nationalityFilter = "" } else if (this.state.nationality !== "") { nationalityFilter = 'nationality: "' + this.state.nationality + '"' } else { nationalityFilter = "" };

                let affFilter; if (this.state.affiliation === "All") { affFilter = "" } else if (this.state.affiliation !== "All" || this.state.affiliation !== "") { affFilter = 'name_western: "' + this.state.affiliation + '"' } else { affFilter = "" };
                let relFamFilter; if (this.state.religious_family !== "All") { relFamFilter = 'religious_family: "' + this.state.religious_family + '"' } else { relFamFilter = "" };

                let locatArray = [];
                for (let i = 0; i < locations.length; i++) {
                    if (locations[i].name_zh === this.state.location) {
                        locatArray = '"' + locations[i].contains.join('", "') + '"'
                    }
                }

                let locatFilter;
                if (locatArray.length >= 1) { locatFilter = ' AND l.id IN [' + locatArray + ']' }
                else { locatFilter = " " }


                let timeFilter;
                if (this.state.start_year !== "" && this.state.end_year !== "") {
                    timeFilter = ` WHERE ((t.start_year IS NOT NULL) AND (t.start_year >= ${this.state.start_year}) AND (t.start_year <= ${this.state.end_year})) OR
          ((t.end_year IS NOT NULL) AND (t.end_year >= ${this.state.start_year}) AND (t.end_year <= ${this.state.end_year})) OR
          ((t.start_year IS NOT NULL) AND (t.start_year < ${this.state.start_year}) AND (t.end_year IS NOT NULL) AND (t.end_year > ${this.state.end_year}))`
                }
                else if (this.state.start_year === "" && this.state.end_year !== "") {
                    timeFilter = ` WHERE (t.start_year <= ${this.state.end_year}) OR (t.end_year <= ${this.state.end_year})`
                }
                else if (this.state.start_year !== "" && this.state.end_year === "") {
                    timeFilter = ` WHERE (t.start_year >= ${this.state.start_year}) OR (t.end_year >= ${this.state.start_year})`
                }


                else { timeFilter = "" };
                let timeFilter_t2;
                timeFilter_t2 = timeFilter.replace(/t\./g, 't[0].'); // Adjust the timeFilter for t*2

                let keyFilter;
                if (this.state.sent_id !== "init" && this.state.kind === "People") {
                    if (timeFilter !== "") { keyFilter = ' AND ID(n)=' + internalId }
                    else { keyFilter = ' WHERE ID(n)=' + internalId }
                }
                else if (this.state.sent_id !== "init" && this.state.kind === "Institutions" && this.state.affiliation === "All") {
                    if (timeFilter !== "") { keyFilter = ' AND ID(r)=' + internalId }
                    else { keyFilter = ' WHERE ID(r)=' + internalId }
                }
                else { keyFilter = "" }

                //CONCAT & CLEAN FILTERS
                const filterStatic = [genderFilter, nationalityFilter]
                const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

                const corpFilterStatic = [relFamFilter, affFilter]
                const corpFilterStaticClean = corpFilterStatic.filter(value => value.length > 1).join();
                const instFilterStatic = [icatFilter, isubcatFilter]
                const instFilterStaticClean = instFilterStatic.filter(value => value.length > 1).join();

                let unAffFilter;
                if (this.state.sent_id !== "init" && this.state.kind === "People" && this.state.affiliation === "All") {
                    unAffFilter = `UNION MATCH (n:Person {` + filterStaticClean + `})-[t]-(r:Institution)` + timeFilter + keyFilter + personNameFilter2 + `
      WITH n,r,t
      MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province) `+ locatFilter + `
      RETURN {key:n.id,
        properties:properties(n),inst:properties(r),aff:properties(r),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes`
                }
                else { unAffFilter = "" }

                //CONSTRUCT QUERY WITH VARIABLES
                let query;
                if (this.state.kind === "People") {
                    const query = `
          MATCH (n:Person {`+ filterStaticClean + `})-[t]-(r)-[]-(e:CorporateEntity {` + affFilter + `})` + timeFilter + keyFilter + personNameFilter2 + `
          WITH n,r,e,t
          MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + `
          RETURN {key:n.id,properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `+ unAffFilter + `
          UNION MATCH (e:CorporateEntity {`+ affFilter + `})-[]-(n:Person {` + filterStaticClean + `})-[t]-(r)` + timeFilter + keyFilter + personNameFilter2 + `
          WITH n,r,e,t
          MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + `
          RETURN {key:n.id,properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `
                    session
                        .run(query)
                        .then((results) => {
                            let unfiltArray = results.records.map((record) => record.get('Nodes'));
                            let nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude);
                            if (nodeArray.length === 0) {
                                this.setState({ noresults: "noresults" });
                                this.setState({ content: "loaded" });
                            }
                            else {
                                const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                                this.setState({ nodeArray })
                                this.setState({ mapBounds });
                                this.setState({ noresults: "noresults hide" });
                                this.setState({ content: "loaded" });
                                this.setState({ sent_id: "init" });
                                session.close()
                            }
                        })

                    const session2 = this.driver.session()
                    const query2 = `
            CALL {
            MATCH (n:Person {${filterStaticClean}})-[t]-(r:Institution)-[]-(e:CorporateEntity {${affFilter}}) ${timeFilter} ${keyFilter} ${personNameFilter2}
            WITH n,r,e,t
            MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province) ${locatFilter}
            RETURN {
              person_id:n.id, 
              person_name_western: CASE WHEN n.name_western IS NOT NULL THEN n.name_western ELSE n.given_name_western + ' ' + toUpper(n.family_name_western) END,
              person_name_chinese: CASE WHEN n.chinese_name_hanzi IS NOT NULL THEN n.chinese_name_hanzi ELSE n.chinese_family_name_hanzi + '' + n.chinese_given_name_hanzi END, 
              inst_id:r.id,
              inst_name_western: CASE WHEN r.name_western IS NOT NULL THEN r.name_western ELSE r.given_name_western + ' ' + toUpper(r.family_name_western) END, 
              inst_name_chinese: CASE WHEN r.chinese_name_hanzi IS NOT NULL THEN r.chinese_name_hanzi ELSE r.chinese_family_name_hanzi + '' + r.chinese_given_name_hanzi END, 
              location_name_western: l.name_wes,
              location_name_chinese: l.name_zh,
              longitude: l.longitude,
              latitude: l.latitude,
              rel_type: t.rel_type, 
              start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
              end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
              sources: COALESCE(t.source ,"")+ CASE WHEN r.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.source ,""), 
              notes: COALESCE(t.notes ,"") + CASE WHEN r.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.notes ,"")} AS Nodes
            ${unAffFilter}
            UNION MATCH (e:CorporateEntity {${affFilter}})-[]-(n:Person {${filterStaticClean}})-[t]-(r:Institution) ${timeFilter} ${keyFilter} ${personNameFilter2}
            WITH n,r,e,t
            MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + `
            RETURN {
              key: n.id,
              person_id:n.id, 
              person_name_western: CASE WHEN n.name_western IS NOT NULL THEN n.name_western ELSE n.given_name_western + ' ' + toUpper(n.family_name_western) END,
              person_name_chinese: CASE WHEN n.chinese_name_hanzi IS NOT NULL THEN n.chinese_name_hanzi ELSE n.chinese_family_name_hanzi + '' + n.chinese_given_name_hanzi END, 
              inst_id:r.id,
              inst_name_western: CASE WHEN r.name_western IS NOT NULL THEN r.name_western ELSE r.given_name_western + ' ' + toUpper(r.family_name_western) END, 
              inst_name_chinese: CASE WHEN r.chinese_name_hanzi IS NOT NULL THEN r.chinese_name_hanzi ELSE r.chinese_family_name_hanzi + '' + r.chinese_given_name_hanzi END, 
              location_name_western: l.name_wes,
              location_name_chinese: l.name_zh,
              longitude: l.longitude,
              latitude: l.latitude,
              rel_type: t.rel_type, 
              start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
              end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
              sources: COALESCE(t.source ,"")+ CASE WHEN r.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.source ,""), 
              notes: COALESCE(t.notes ,"") + CASE WHEN r.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.notes ,"")} AS Nodes
            }
            RETURN DISTINCT Nodes
            `
                    session2
                        .run(query2)
                        .then((results) => {
                            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
                            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
                            this.setState({ printArray })
                            session2.close()
                        })

                } else if (this.state.kind === "Institutions") {
                    const query = `
      MATCH (r:Institution {` + instFilterStaticClean + `})-[t]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter + keyFilter + `
      WITH t, r, e
      MATCH (r)-[]->(l)
      WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
      RETURN {
        key: r.id,
        properties: properties(r),
        aff: properties(e),
        locat: properties(l),
        rel: properties(t),
        locat_name: properties(l).name_wes
      } AS Nodes
      UNION
      MATCH (r:Institution {` + instFilterStaticClean + `})-[t*2]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter_t2 + keyFilter + `
      WITH t, r, e
      MATCH (r)-[]->(l)
      WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
      RETURN {
        key: r.id,
        properties: properties(r),
        aff: properties(e),
        locat: properties(l),
        rel: properties(t[1]),
        locat_name: properties(l).name_wes
      } AS Nodes
      `
                    session.run(query).then((results) => {
                        let unfiltArray = results.records.map((record) => record.get('Nodes'));
                        let nodeArray;
                        if (this.state.location !== "All" && this.state.location !== "都") { nodeArray = unfiltArray.filter(e => locatFilter[0].includes(e.locat.name_zh)).filter(node => node.locat.latitude && node.locat.longitude) }
                        else { nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude) };
                        if (nodeArray.length === 0) {
                            this.setState({ noresults: "noresults" });
                            this.setState({ content: "loaded" });
                        }
                        else {
                            const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                            this.setState({ nodeArray });
                            this.setState({ mapBounds });
                            this.setState({ noresults: "noresults hide" });
                            this.setState({ content: "loaded" });
                            this.setState({ sent_id: "init" });
                        }
                        session.close()
                    })

                    const session2 = this.driver.session()
                    const query2 = `
            CALL {
              MATCH (r:Institution {`+ instFilterStaticClean + `})-[t]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter + keyFilter + `
              WITH t,r,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + nameFilter2 + `
              RETURN {
                key: r.id,
                inst_id:r.id,
                inst_name_western: r.name_western,
                inst_name_chinese: r.chinese_name_hanzi,
                corp_id:e.id,
                corp_name_western: e.name_western,
                corp_name_chinese: e.chinese_name_hanzi,
                location_name_western: l.name_wes,
                location_name_chinese: l.name_zh,
                longitude: l.longitude,
                latitude: l.latitude,
                rel_type: t.rel_type, 
                start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
                end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
                sources: COALESCE(t.source ,"")+ CASE WHEN r.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.source ,""), 
                notes: COALESCE(t.notes ,"") + CASE WHEN r.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.notes ,"")
              } AS Nodes
              UNION MATCH (r:Institution {`+ instFilterStaticClean + `})-[t*2]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter_t2 + keyFilter + `
              WITH t,r,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + nameFilter2 + `
              RETURN {
                key: r.id,
                inst_id:r.id,
                inst_name_western: r.name_western,
                inst_name_chinese: r.chinese_name_hanzi,
                corp_id:e.id,
                corp_name_western: e.name_western,
                corp_name_chinese: e.chinese_name_hanzi,
                location_name_western: l.name_wes,
                location_name_chinese: l.name_zh,
                longitude: l.longitude,
                latitude: l.latitude,
                rel_type: t[1].rel_type, 
                start_year: CASE WHEN toInteger(t[1].start_year) > 0 THEN toInteger(t[1].start_year) ELSE "" END, 
                end_year: CASE WHEN toInteger(t[1].end_year) > 0 THEN toInteger(t[1].end_year) ELSE "" END, 
                sources: COALESCE(t[1].source ,"")+ CASE WHEN r.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.source ,""), 
                notes: COALESCE(t[1].notes ,"") + CASE WHEN r.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.notes ,"")
              } AS Nodes
            }
            RETURN DISTINCT Nodes
            `
                    session2
                        .run(query2)
                        .then((results) => {
                            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
                            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
                            this.setState({ printArray })
                            session2.close()
                        })


                } else if (this.state.kind === "Events") {
                    const query = `
          MATCH (r:Event {`+ instFilterStaticClean + `})-[t]-(l)` + timeFilter + keyFilter + `
          WITH r,t,l MATCH (r)-[t]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + nameFilter2 + `
          RETURN {key: r.id,
          properties:properties(r),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `
                    session.run(query).then((results) => {
                        let unfiltArray = results.records.map((record) => record.get('Nodes'));
                        let nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude);
                        if (nodeArray.length === 0) {
                            this.setState({ noresults: "noresults" });
                            this.setState({ content: "loaded" });
                        }
                        else {
                            const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                            this.setState({ nodeArray });
                            this.setState({ mapBounds });
                            this.setState({ noresults: "noresults hide" });
                            this.setState({ content: "loaded" });
                            this.setState({ sent_id: "init" });
                        }
                        session.close()
                    })

                    const session2 = this.driver.session()
                    const query2 = `
            MATCH (r:Event {`+ instFilterStaticClean + `})-[t]-(l)` + timeFilter + keyFilter + `
            WITH r,t,l MATCH (r)-[t]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)`+ locatFilter + nameFilter2 + `
            RETURN {
              key: r.id,
              event_id:r.id,
              event_name_western: r.name_western,
              event_name_chinese: r.chinese_name_hanzi,
              location_name_western: l.name_wes,
              location_name_chinese: l.name_zh,
              longitude: l.longitude,
              latitude: l.latitude,
              rel_type: t.rel_type, 
              start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
              end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
              sources: COALESCE(t.source ,"")+ CASE WHEN r.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.source ,""), 
              notes: COALESCE(t.notes ,"") + CASE WHEN r.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(r.notes ,"")
            } AS Nodes
            `
                    session2
                        .run(query2)
                        .then((results) => {
                            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
                            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
                            this.setState({ printArray })
                            session2.close()
                        })

                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
};
