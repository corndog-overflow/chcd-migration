/////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPORTS //////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

import locations from "../../Assets/indexes/location-index.json"
import sql from '../Db/index.js'

/////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN SEARCH & FILTER QUERIES /////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

// QUERY TO FETCH RESULTS FOR SEARCH ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function fetchSearch() {
    if (this.state.search === "") {
        return
    }

    this.setState({content: "loading"})
    let searchProp = this.state.search;

    const results = sql`SELECT DISTINCT *
                        FROM (SELECT 'Person' AS label, p.id, pgroonga_score(tableoid, ctid) AS score
                              FROM People p
                              WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
                                    ('${searchProp}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                                     'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                              UNION ALL
                              SELECT 'Institution' AS label, i.id, pgroonga_score(tableoid, ctid) AS score
                              FROM Institutions i
                              WHERE ARRAY [i.full_text_name_content, i.full_text_search_content] &@~
                                    ('${searchProp}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                                     'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                              UNION ALL
                              SELECT 'CorporateEntity' AS label, c.id, pgroonga_score(tableoid, ctid) AS score
                              FROM CorporateEntities c
                              WHERE ARRAY [c.full_text_name_content, c.full_text_search_content] &@~
                                    ('${searchProp}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                                     'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                              UNION ALL
                              SELECT 'Event' AS label, e.id, pgroonga_score(tableoid, ctid) AS score
                              FROM Events e
                              WHERE ARRAY [e.full_text_name_content, e.full_text_search_content] &@~
                                    ('${searchProp}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                                     'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                              UNION ALL
                              SELECT 'Publication' AS label, p.id, pgroonga_score(tableoid, ctid) AS score
                              FROM Publications p
                              WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
                                    ('${searchProp}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                                     'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers) as unioned
                        ORDER BY score DESC
                        LIMIT 1000;`

    this.setState({
        nodeArray: [],
        filterArray: [],
        genderList: [],
        nationalityList: [],
        labelList: [],
        relFamList: [],
        christTradList: [],
        instCatList: [],
        instSubCatList: [],
        corpCatList: [],
        corpSubCatList: [],
        eventCatList: [],
        eventSubCatList: [],
        pubCatList: [],
        pubSubCatList: [],
        affList: []
    });
    this.setState({
        label: "",
        nationality: "",
        gender: "",
        religious_family: "",
        christian_tradition: "",
        institution_category: "",
        institution_subcategory: "",
        corporate_entity_category: "",
        corporate_entity_subcategory: "",
        event_category: "",
        event_subcategory: "",
        name_western: "",
        inst_name_western: ""
    });

    const nodeArray = results;
    if (nodeArray.length === 0) {
        this.setState({noresults: "noresults"});
        this.setState({content: "loaded"});
        this.setState({searchSet: this.state.search})
    } else {
        let filterArray = nodeArray;
        let labelList = [...new Set(nodeArray.map(item => item.label))];
        let genderList = [...new Set(nodeArray.map(item => item.properties.gender))];
        let nationalityList = [...new Set(nodeArray.map(item => item.properties.nationality))];
        let relFamList = [...new Set(nodeArray.map(item => item.other.religious_family))];
        let christTradList = [...new Set(nodeArray.map(item => item.other.christian_tradition))];
        let instCatList = [...new Set(nodeArray.map(item => item.properties.institution_category))];
        let instSubCatList = [...new Set(nodeArray.map(item => item.properties.institution_subcategory))];
        let corpCatList = [...new Set(nodeArray.map(item => item.properties.corporate_entity_category))];
        let corpSubCatList = [...new Set(nodeArray.map(item => item.properties.corporate_entity_subcategory))];
        let eventCatList = [...new Set(nodeArray.map(item => item.properties.event_category))];
        let eventSubCatList = [...new Set(nodeArray.map(item => item.properties.event_subcategory))];
        let pubCatList = [...new Set(nodeArray.map(item => item.properties.publication_category))];
        let pubSubCatList = [...new Set(nodeArray.map(item => item.properties.publication_subcategory))];
        let affList = [...new Set(nodeArray.map(item => {
            if (item.label === "Person") {
                return item.other.name_western
            }
        }))];
        let instList = [...new Set(nodeArray.map(item => {
            if (item.label === "Institution" && item.other.corporate_entity_category) {
                return item.other.name_western
            }
        }))];

        this.setState({noResults: "no_results hide", content: "loaded"});
        this.setState({nodeArray, filterArray});
        this.setState({
            instList,
            affList,
            genderList,
            nationalityList,
            labelList,
            relFamList,
            christTradList,
            instCatList,
            instSubCatList,
            corpCatList,
            corpSubCatList,
            eventCatList,
            eventSubCatList,
            pubCatList,
            pubSubCatList
        });
        this.setState({searchSet: this.state.search})
    }
}


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
        this.setState({nosend: "nosend"})
    } else {
        this.setState({append: this.state.append + 1})
        this.setState({content: "loading"})
        this.setState({printArray: [],})

        let internalId = this.state.sent_id
        //CONSTRUCT FILTERS FROM USER INPUT
        let personNameFilter;
        if (this.state.family_name_western === "" && this.state.given_name_western === "") {
            personNameFilter = sql``
        } else if (this.state.family_name_western !== "" && this.state.given_name_western === "") {
            personNameFilter = '(toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")'
        } else if (this.state.family_name_western === "" && this.state.given_name_western !== "") {
            personNameFilter = '(toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")'
        } else if (this.state.family_name_western !== "" && this.state.given_name_western !== "") {
            personNameFilter = '(toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.family_name_western)=~ "(?i)' + this.state.family_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*") AND (toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(n.given_name_western)=~ "(?i)' + this.state.given_name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")'
        }

        let personNameFilter2;
        if (this.state.sent_id !== "init" && this.state.kind === "People") {
            personNameFilter2 = sql`AND
            ${personNameFilter}`
        } else if (this.state.start_year !== "" | this.state.end_year !== "" && personNameFilter !== "") {
            personNameFilter2 = sql`AND
            ${personNameFilter}`
        } else if (personNameFilter === "") {
            personNameFilter2 = sql``
        } else {
            personNameFilter2 = sql`WHERE
            ${personNameFilter}`
        }

        let nameFilter2;
        if (this.state.name_western !== "") {
            nameFilter2 = 'AND (toLower(r.name_western)= "(?i)' + this.state.name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '" OR toLower(r.name_western)=~ "(?i)' + this.state.name_western.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.") + '.*")'
        } else {
            nameFilter2 = sql``
        }

        let icatFilter;
        if (this.state.institution_category === "All") {
            icatFilter = sql``
        } else if (this.state.institution_category !== "All" || this.state.institution_category !== "") {
            icatFilter = sql`institution_category =
            ${this.state.institution_category}`
        } else {
            icatFilter = sql``
        }

        let isubcatFilter;
        if (this.state.institution_subcategory === "All") {
            isubcatFilter = sql``
        } else if (this.state.institution_subcategory !== "All" || this.state.institution_subcategory !== "") {
            isubcatFilter = sql`institution_subcategory =
            ${this.state.institution_subcategory}`
        } else {
            isubcatFilter = sql``
        }

        let genderFilter;
        if (this.state.gender !== "All") {
            genderFilter = sql`gender =
            ${this.state.gender}`
        } else {
            genderFilter = sql``
        }

        let nationalityFilter;
        if (this.state.nationality === "All") {
            nationalityFilter = sql``
        } else if (this.state.nationality !== "") {
            nationalityFilter = sql`nationality =
            ${this.state.nationality}`
        } else {
            nationalityFilter = sql``
        }

        let affFilter;
        if (this.state.affiliation === "All") {
            affFilter = sql``
        } else if (this.state.affiliation !== "All" || this.state.affiliation !== "") {
            affFilter = sql`name_western =
            ${this.state.affiliation}`
        } else {
            affFilter = sql``
        }
        let relFamFilter
        if (this.state.religious_family !== "All") {
            relFamFilter = sql`religious_family =
            ${this.state.religious_family}`
        } else {
            relFamFilter = sql``
        }

        let locatArray = [];
        for (let i = 0; i < locations.length; i++) {
            if (locations[i].name_zh === this.state.location) {
                locatArray = '"' + locations[i].contains.join('", "') + '"'
            }
        }

        let locatFilter;
        if (locatArray.length >= 1) {
            locatFilter = sql`AND l.id IN
            ${locatArray}`
        } else {
            locatFilter = sql``
        }

        let timeFilter;
        if (this.state.start_year !== "" && this.state.end_year !== "") {
            timeFilter = sql`WHERE
            ((t.start_year IS NOT NULL) AND (t.start_year >= ${this.state.start_year}) AND (t.start_year <= ${this.state.end_year}))
            OR
            ((t.end_year IS NOT NULL) AND (t.end_year >= ${this.state.start_year}) AND (t.end_year <= ${this.state.end_year}))
            OR
            ((t.start_year IS NOT NULL) AND (t.start_year < ${this.state.start_year}) AND (t.end_year IS NOT NULL) AND (t.end_year > ${this.state.end_year}))`
        } else if (this.state.start_year === "" && this.state.end_year !== "") {
            timeFilter = sql`WHERE
                (t.start_year <= ${this.state.end_year})
                OR (t.end_year <=
                ${this.state.end_year}
                )`
        } else if (this.state.start_year !== "" && this.state.end_year === "") {
            timeFilter = sql`WHERE
                (t.start_year >= ${this.state.start_year})
                OR (t.end_year >=
                ${this.state.start_year}
                )`
        } else {
            timeFilter = sql``
        }
        let timeFilter_t2;
        timeFilter_t2 = timeFilter.replace(/t\./g, 't[0].'); // Adjust the timeFilter for t*2

        let keyFilter;
        if (this.state.sent_id !== "init" && this.state.kind === "People") {
            if (timeFilter !== "") {
                keyFilter = sql`AND n.ID =
                ${internalId}`
            } else {
                keyFilter = sql`WHERE n.ID =
                ${internalId}`
            }
        } else if (this.state.sent_id !== "init" && this.state.kind === "Institutions" && this.state.affiliation === "All") {
            if (timeFilter !== "") {
                keyFilter = sql`AND r.ID =
                ${internalId}`
            } else {
                keyFilter = sql`WHERE r.ID =
                ${internalId}`
            }
        } else {
            keyFilter = sql``
        }

        //CONCAT & CLEAN FILTERS
        const filterStatic = [genderFilter, nationalityFilter]
        const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

        const corpFilterStatic = [relFamFilter, affFilter]
        const corpFilterStaticClean = corpFilterStatic.filter(value => value.length > 1).join();
        const instFilterStatic = [icatFilter, isubcatFilter]
        const instFilterStaticClean = instFilterStatic.filter(value => value.length > 1).join();

        let unAffFilter;
        if (this.state.sent_id !== "init" && this.state.kind === "People" && this.state.affiliation === "All") {
            unAffFilter = sql`UNION MATCH (n:Person {` + filterStaticClean + `})-[t]-(r:Institution)` + timeFilter + keyFilter + personNameFilter2 + `
      WITH n,r,t
      MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province) ` + locatFilter + `
      RETURN {key:n.id,
        properties:properties(n),inst:properties(r),aff:properties(r),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes`
        } else {
            unAffFilter = sql``
        }

        //CONSTRUCT QUERY WITH VARIABLES
        if (this.state.kind === "People") {
            const results = sql`
                MATCH
                    (n:Person {` + filterStaticClean + `})-[t]-(r)-[]-(e:CorporateEntity {` + affFilter + `})` + timeFilter + keyFilter + personNameFilter2 + `
          WITH n,r,e,t
          MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + `
          RETURN {key:n.id,properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          ` + unAffFilter + `
          UNION MATCH (e:CorporateEntity {` + affFilter + `})-[]-(n:Person {` + filterStaticClean + `})-[t]-(r)` + timeFilter + keyFilter + personNameFilter2 + `
          WITH n,r,e,t
          MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + `
          RETURN {key:n.id,properties:properties(n),inst:properties(r),aff:properties(e),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `
            let unfiltArray = results.records.map((record) => record.get('Nodes'));
            let nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude);
            if (nodeArray.length === 0) {
                this.setState({noresults: "noresults"});
                this.setState({content: "loaded"});
            } else {
                const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                this.setState({nodeArray})
                this.setState({mapBounds});
                this.setState({noresults: "noresults hide"});
                this.setState({content: "loaded"});
                this.setState({sent_id: "init"});
            }

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
            MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + `
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
            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
            this.setState({printArray})

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
            let unfiltArray = results.records.map((record) => record.get('Nodes'));
            let nodeArray;
            if (this.state.location !== "All" && this.state.location !== "都") {
                nodeArray = unfiltArray.filter(e => locatFilter[0].includes(e.locat.name_zh)).filter(node => node.locat.latitude && node.locat.longitude)
            } else {
                nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude)
            }
            if (nodeArray.length === 0) {
                this.setState({noresults: "noresults"});
                this.setState({content: "loaded"});
            } else {
                const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                this.setState({nodeArray});
                this.setState({mapBounds});
                this.setState({noresults: "noresults hide"});
                this.setState({content: "loaded"});
                this.setState({sent_id: "init"});
            }

            const query2 = `
            CALL {
              MATCH (r:Institution {` + instFilterStaticClean + `})-[t]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter + keyFilter + `
              WITH t,r,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
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
              UNION MATCH (r:Institution {` + instFilterStaticClean + `})-[t*2]-(e:CorporateEntity {` + corpFilterStaticClean + `})` + timeFilter_t2 + keyFilter + `
              WITH t,r,e MATCH (r)-[]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
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
            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
            this.setState({printArray})


        } else if (this.state.kind === "Events") {
            const query = `
          MATCH (r:Event {` + instFilterStaticClean + `})-[t]-(l)` + timeFilter + keyFilter + `
          WITH r,t,l MATCH (r)-[t]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
          RETURN {key: r.id,
          properties:properties(r),locat:properties(l),rel:properties(t),locat_name:properties(l).name_wes} AS Nodes
          `
            let unfiltArray = results.records.map((record) => record.get('Nodes'));
            let nodeArray = unfiltArray.filter(node => node.locat.latitude && node.locat.longitude);
            if (nodeArray.length === 0) {
                this.setState({noresults: "noresults"});
                this.setState({content: "loaded"});
            } else {
                const mapBounds = nodeArray.map(node => ([node.locat.latitude, node.locat.longitude]));
                this.setState({nodeArray});
                this.setState({mapBounds});
                this.setState({noresults: "noresults hide"});
                this.setState({content: "loaded"});
                this.setState({sent_id: "init"});
            }

            const query2 = `
            MATCH (r:Event {` + instFilterStaticClean + `})-[t]-(l)` + timeFilter + keyFilter + `
            WITH r,t,l MATCH (r)-[t]->(l) WHERE (l:Township OR l:Village OR l:County OR l:Prefecture OR l:Province)` + locatFilter + nameFilter2 + `
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
            let unfiltArrayPrint = results.records.map((record) => record.get('Nodes'));
            let printArray = unfiltArrayPrint.filter(i => i.latitude && i.longitude);
            this.setState({printArray})

        }
    }
}


//QUERIES FOR NETWORK GRAPH  ////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR NETWORK GRAPH TIME CONFINES
export function fetchNetworkConfines() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        return null
    }
    let nodeIdFilter = this.state.node_id;
    const results =
        sql` WITH people_relationships AS (SELECT n.start_year, n.end_year
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
             SELECT MIN(years) AS head, MAX(years) AS last
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

    if (this.state.start_year === "") {
        this.setState({start_year: results[0]['head']})
    }
    if (this.state.end_year === "") {
        this.setState({end_year: results[0]['last']})
    }
    this.setState({time_disable: false})
}

//QUERY FOR NETWORK GRAPH RESULTS
export function fetchNetworkResults() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({nosend: "nosend"})
    } else {
        this.setState({content: "loading"});
        this.setState({nodeArray: []});
        this.setState({printArray: []});
        this.setState({append: this.state.append + 1});

        let nodeIdFilter = this.state.node_id;
        let results =
            sql` WITH people_relationships AS (SELECT n.start_year, n.end_year
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
                 SELECT MIN(years) AS head, MAX(years) AS last
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

        if (this.state.start_year === "") {
            this.setState({start_year: results[0]['head']})
        }
        if (this.state.end_year === "") {
            this.setState({end_year: results[0]['last']})
        }
        this.setState({time_disable: false})


        //CONSTRUCT FILTERS FROM USER INPUT
        let degreeFilter;
        if (this.state.degree !== 1) {
            degreeFilter = this.state.degree
        } else {
            degreeFilter = 1
        }


        let peopleFilter = false
        if (this.state.people_include === true) {
            peopleFilter = true
        }

        let instFilter = false
        if (this.state.inst_include === true) {
            instFilter = true
        }
        let corpFilter = false
        if (this.state.corp_include === true) {
            corpFilter = true
        }
        let eventFilter = false
        if (this.state.event_include === true) {
            eventFilter = true
        }
        let pubFilter;
        if (this.state.pub_include === true) {
            pubFilter = true
        }

        let nodeTypeFilter;
        nodeTypeFilter = sql`AND t.entity_to_id
        ${
            peopleFilter
                ? sql`LIKE P% OR t.entity_to_id`
                : sql``}
        ${instFilter
            ? sql`LIKE N% OR t.entity_to_id`
            : sql``}
        ${corpFilter
            ? sql`LIKE C% OR t.entity_to_id`
            : sql``}
        ${eventFilter
            ? sql`LIKE E% OR t.entity_to_id`
            : sql``}
        ${pubFilter
            ? sql`LIKE B% OR t.entity_to_id`
            : sql``}
        =""`

        //CONCAT FILTERS
        const filterStatic = [nodeIdFilter]
        const filterStaticClean = filterStatic.filter(value => value.length > 1).join();

        //CONSTRUCT QUERY WITH VARIABLES
        let startYearFilter = null;
        let endYearFilter = null;
        if (this.state.end_year !== "") {
            endYearFilter = this.state.end_year
        }
        if (this.state.start_year !== "") {
            startYearFilter = this.state.start_year
        }

        results = sql`WITH RECURSIVE SubgraphCTE AS (SELECT t.*,
                                                            1 AS level
                                                     FROM Relationship t
                                                     WHERE (t.entity_from_id = ${nodeIdFilter} OR t.entity_to_id = ${nodeIdFilter}) ${nodeTypeFilter}
                                                       AND (t.start_year >= ${startYearFilter}
                                                       AND
                                                         (t.start_year <= ${endYearFilter}
                                                        OR t.end_year <= ${endYearFilter}))
                                                     UNION ALL
                                                     SELECT t.*, sg.level + 1
                                                     FROM Relationship t
                                                         JOIN SubgraphCTE sg
                                                     ON (sg.entity_to_id = t.entity_from_id AND
                                                         t.entity_from_id like ${nodeTypeFilter})
                                                         OR (sg.entity_to_id = t.entity_to_id
                                                         ${nodeTypeFilter})
                                                     WHERE sg.level
                                                         < ${degreeFilter}
                                                       AND (t.start_year >= ${startYearFilter}
                                                       AND
                                                         (t.start_year <= ${endYearFilter}
                                                        OR t.end_year <= ${endYearFilter})))
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

        let ulinks = results[0].links;
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
        const nodeArray = [{nodes: results[0].nodes, links: links,}]
        if (nodeArray.length === 0) {
            this.setState({noresults: "noresults"})
        } else {
            this.setState({nodeArray});
            this.setState({noresults: "noresults hide"})
            this.setState({content: "loaded"})
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR POPUP INFORMATION ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR SELECTED NODE + APPEND/REDUCE BREADCRUMB (CLICK IN POPUP CONTENT)
export function selectSwitch(event, actionType, order = null) {
    this.setState({nodeSelect: event});
    const results = sql`
        SELECT
            --     n.id AS key,
            LEFT(n.id, 1) AS select_kind,
            --     n.* AS select_node,
            --     p.id AS key2,
            --     p.* AS node2,
            LEFT(p.id, 1) AS rel_kind,
            -- t.*           AS rel,
            'none'        AS rel_locat
        FROM Relationship t
                 JOIN
             Nodes n ON t.entity_from_id = n.id OR t.entity_to_id = n.id
                 JOIN
             Nodes p ON t.entity_from_id = p.id OR t.entity_to_id = p.id
        WHERE n.id = ${event}
        ORDER BY t.start_year;
    `;
    // IS NULL in original query

    const selectArray = results.records.map((record) => record.get('SelectNodes'));
    this.setState({selectArray});

    if (actionType === 'append') {
        this.breadCrumbChainer();
    } else if (actionType === 'reduce') {
        this.breadCrumbReducer(event, order);
    }

    const result2 = sql`SELECT n.id                               AS start_id,
                               CASE
                                   WHEN i.name_western IS NOT NULL THEN i.name_western
                                   ELSE pe.given_name_western || ' ' || UPPER(pe.family_name_western)
                                   END                            AS start_name_western,
                               CASE
                                   WHEN i.chinese_name_hanzi IS NOT NULL THEN i.chinese_name_hanzi
                                   ELSE pe.chinese_family_name_hanzi || '' || pe.chinese_given_name_hanzi
                                   END                            AS start_name_chinese,
--                                     labels(n)[1] AS start_type,
                               p.id                               AS end_id,
                               CASE
                                   WHEN i.name_western IS NOT NULL THEN i.name_western
                                   ELSE pe.given_name_western || ' ' || UPPER(pe.family_name_western)
                                   END                            AS end_name_western,
                               CASE
                                   WHEN i.chinese_name_hanzi IS NOT NULL THEN i.chinese_name_hanzi
                                   ELSE pe.chinese_family_name_hanzi || '' || pe.chinese_given_name_hanzi
                                   END                            AS end_name_chinese,
--                                     CASE
--                                         WHEN array_length(labels(p), 1) = 1 THEN labels(p)[1]
--                                         ELSE 'Geography'
--                                         END AS end_type,
--                                     type(t) AS rel_kind,
                               t.rel_type                         AS rel_type,
--                                     CASE
--                                         WHEN CAST(t.start_year AS integer) > 0 THEN CAST(t.start_year AS integer)
--                                         ELSE ''
--                                         END AS start_year,
--                                     CASE
--                                         WHEN CAST(t.end_year AS integer) > 0 THEN CAST(t.end_year AS integer)
--                                         ELSE ''
--                                         END AS end_year,
                               COALESCE(t.source, '') || CASE
                                                             WHEN pe.source IS NOT NULL THEN ' / '
                                                             ELSE ''
                                   END || COALESCE(pe.source, '') AS sources,
                               COALESCE(t.notes, '') || CASE
                                                            WHEN pe.notes IS NOT NULL THEN ' / '
                                                            ELSE ''
                                   END || COALESCE(pe.notes, '')  AS notes
                        FROM Nodes n
                                 JOIN Relationship t ON n.id = t.entity_from_id OR n.id = t.entity_to_id
                                 JOIN Nodes p ON t.entity_from_id = p.id OR t.entity_to_id = p.id
                                 LEFT JOIN People pe ON n.id = pe.id OR p.id = pe.id
                                 LEFT JOIN Events e ON n.id = e.id OR p.id = e.id
                                 LEFT JOIN Publications pu ON n.id = pu.id OR p.id = pu.id
                                 LEFT JOIN CorporateEntities ce ON n.id = ce.id OR p.id = ce.id
                                 LEFT JOIN Institutions i ON n.id = i.id OR p.id = i.id
                        WHERE pe.id = ${event};`

    const printArray = result2;
    this.setState({printArray});

    const result3 = sql`SELECT *
                        FROM Nodes
                        WHERE id = ${event};`
    const basicArray = result3;
    this.setState({basicArray});
}

//QUERY FOR SELECTED NODE + APPEND BREADCRUMB + OPEN POPUP (CLICK IN CHILD VIEW)
export function selectSwitchInitial(event) {
    this.selectSwitchAppend(event)
    if (this.state.filterDisplay === "filter_container") {
        this.setState({popupcontainer: "popupcontainer"})
    }
    if (this.state.filterDisplay === "filter_container2") {
        this.setState({popupcontainer: "popupcontainer-full"})
    }
    if (this.state.filterDisplay === "filter_data_container") {
        this.setState({popupcontainer: "popupcontainer-full2"})
    } else if (this.state.filterDisplay === "filter_data_container hide") {
        this.setState({popupcontainer: "popupcontainer-full2"})
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR FETCHING FILTER INDEXES ON LOAD //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
//QUERY TO FETCH LISTS FOR NETWORK SELECTS
export async function fetchNetworkIndexes() {
    if (this.state.inputValue === '') {
        return null
    }
    let value = this.state.inputValue.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");

    let nodeType = this.state.selectedOption
    if (nodeType === "Person") {
        const results = await sql
            `SELECT DISTINCT 'person'                                             AS type,
                             CONCAT(given_name_western, ' ', family_name_western) AS label,
                             id                                                   AS value
             FROM People p
             WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
                   (${value}, ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                    'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
            `
    } else {
        const results = await sql
            `SELECT DISTINCT 'institution' AS type, name_western AS label, id AS value
             FROM CorporateEntities ce
             WHERE ARRAY [ce.full_text_name_content, ce.full_text_search_content] &@~
                   (${value}, ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                    'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
            `


    }
    const nodeData = results;
    const netPersonIndex = nodeData.map(i => ({label: i.label, value: i.value, type: "node_id"}));
    this.setState({netPersonIndex})
    return (this.state.netPersonIndex)

}

//TODO: PERSON AFFILIATION INDEX
export async function fetchPAffIndex() {
}

//INSTITUTION AFFILIATION INDEX
export async function fetchAffIndex() {
    if (this.state.inputValuePAff === '') {
        return null
    }
    let value = this.state.inputValuePAff.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");

    const results = await sql
        `SELECT DISTINCT 'affiliation'      AS type,
                         name_western       AS value,
                         name_western       AS label,
                         chinese_name_hanzi AS zh
         FROM CorporateEntities ce
         WHERE corporate_entity_category = 'Religious Body'
           AND ARRAY [ce.full_text_name_content, ce.full_text_search_content] &@~
               (${value}, ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
        `
    const resultIndex5 = results;
    const addAll5 = [{value: "All", en: "All", zh: "全部", tw: "全部"}];
    const pAffIndexPrep = addAll5.concat(resultIndex5);
    const pAffIndex = pAffIndexPrep.map(i => ({
        label: i.value + ` ` + i.zh,
        value: i.value,
        zh: i.zh,
        tw: i.zh,
        en: i.value,
        type: "affiliation"
    }));
    this.setState({pAffIndex});
    return (this.state.pAffIndex)
}

//PERSON NATIONALITY INDEX
export async function fetchNatIndex() {
    if (this.state.inputValueNat === '') {
        return null
    }

    let value = this.state.inputValueNat.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");

    const results = await sql
        `SELECT DISTINCT 'affiliation' AS type, nationality AS value, nationality AS label
         FROM People p
         WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
               (${value}, ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
        `

    const resultIndex5 = results;
    const addAll5 = [{value: "All"}];
    const natIndexPrep = addAll5.concat(resultIndex5);
    const natIndex = natIndexPrep.map(i => ({label: i.value, value: i.value, type: "nationality"}));
    this.setState({natIndex});
    return (this.state.natIndex)
}

//QUERY TO FETCH LISTS FOR MAP SELECTS
export async function fetchMapIndexes() {

    //GET CATEGORY AND SUBCATEGORY LISTS
    let results = sql`SELECT institution_category                        AS category,
                             ARRAY_AGG(DISTINCT institution_subcategory) AS subcategory
                      FROM institutions
                      WHERE institution_category != 'General Area'
                        AND institution_category IS NOT NULL
                        AND institution_subcategory != 'null'
                      GROUP BY institution_category;`
    let resultIndex = results;
    let addAll = [{category: "All", subcategory: ["All"]}];
    let test = addAll.concat(resultIndex);
    const instCatsIndex = test.map((i) => [i.category, i.subcategory]);
    this.setState({instCatsIndex});

    //GET RELIGIOUS FAMILY LIST
    results = sql`SELECT DISTINCT religious_family AS value
                  FROM corporateentities
                           JOIN institutions_partof_corporateentities
                                ON corporateentities.id = institutions_partof_corporateentities.entity_to_id
                  WHERE religious_family IS NOT NULL;`

    const resultIndex3 = results.records.map((record) => record.get('List'));
    const addAll3 = [{value: "All"}];
    const relFamIndexPrep = addAll3.concat(resultIndex3);
    const relFamIndex = relFamIndexPrep.map(i => ({value: i.value, type: "religious_family"}));
    this.setState({relFamIndex});

    //GET CATEGORY AND SUBCATEGORY LISTS
    results = await sql
        `SELECT event_category                        AS category,
                ARRAY_AGG(DISTINCT event_subcategory) AS subcategory
         FROM events
                  JOIN events_locatedin ON events.id = events_locatedin.entity_from_id
         WHERE event_category IS NOT NULL

         GROUP BY event_category;`

    resultIndex = results;
    addAll = [{category: "All", subcategory: ["All"]}];
    test = addAll.concat(resultIndex);
    const eventsCatsIndex = test.map((i) => [i.category, i.subcategory]);
    this.setState({eventsCatsIndex});
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR DATAVIEW /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function fetchDBWide() {
    this.setState({content: "loading"})
    this.setState({nodeArray: []})
    this.setState({node_id: ""})
    this.setState({selectedOption: "All"});
    this.setState({nationality: ""});
    this.setState({nationalityNull: ""});
    this.setState({totalPeople: ""});
    this.setState({totalPublications: ""});
    this.setState({totalRelationships: ""});
    this.setState({totalInstitutions: ""});
    this.setState({instTypeList: ""});
    this.setState({instDateList: ""});
    this.setState({totalEvents: ""});
    this.setState({provinces: ""});
    this.setState({prefectures: ""});
    this.setState({counties: ""});
    this.setState({instDateList: ""});
    this.setState({genderList: ""});
    this.setState({genders: ""});
    this.setState({religiousFamily: ""});
    this.setState({christianTradition: ""});
    this.setState({inputValue: ' '});
    this.setState({append: this.state.append + 1})

    fetchTotalPeople();
    fetchTotalInstitutions();
    fetchTotalRelationships();
    fetchTotalEvents();
    fetchTotalPublications();
    fetchTotalNodes();
    fetchTotalCorporateEntities();
    fetchGenders();
    fetchProvinces();
    fetchPrefectures();
    fetchCounties();
    fetchNationality();
    fetchNationalityNull();
    fetchChristianTradition();
    fetchReligiousFamilies();
    fetchChristianTraditionNullValues();
    fetchReligiousFamilyNullValues();

    this.setState({content: "loaded"})
}

/// QUERY FUNCTIONS

//TOTAL PEOPLE
export async function fetchTotalPeople() {
    const results = await sql`SELECT COUNT(1)
                              FROM people;`
    const totalPeople = results[0]["count"];
    this.setState({totalPeople})
}

//TOTAL INSTITUTIONS
export async function fetchTotalInstitutions() {
    const results = await sql`SELECT COUNT(1)
                              FROM institutions;`
    const totalInstitutions = results[0]["count"];
    this.setState({totalInstitutions})
}

//TOTAL RELATIONSHIPS
export async function fetchTotalRelationships() {
    const results = await sql`SELECT COUNT(1)
                              FROM relationship;`
    const totalRelationships = results[0]["count"];
    this.setState({totalRelationships})
}

//TOTAL EVENTS
export async function fetchTotalEvents() {
    const results = await sql`SELECT COUNT(1)
                              FROM events;`
    const totalEvents = results[0]["count"];
    this.setState({totalEvents})
}

//TOTAL PUBLICATIONS
export async function fetchTotalPublications() {
    const results = await sql`SELECT COUNT(1)
                              FROM publications;`
    const totalPublications = results[0]["count"];
    this.setState({totalPublications})
}

//TOTAL NODE COUNT
export async function fetchTotalNodes() {
    const results = await sql`SELECT(
                                        (SELECT COUNT(*) FROM people) +
                                        (SELECT COUNT(*) FROM institutions) +
                                        (SELECT COUNT(*) FROM events) +
                                        (SELECT COUNT(*) FROM publications) +
                                        (SELECT COUNT(*) FROM corporateentities) +
                                        (SELECT COUNT(*) FROM generalareas) +
                                        (SELECT COUNT(*) FROM geographynodes)
                                        ) AS totalNodes;`
    const totalNodes = results[0]["totalNodes"];
    this.setState({totalNodes})
}

//TOTAL CORPORATE ENTITIES
export async function fetchTotalCorporateEntities() {
    const results = await sql`SELECT COUNT(1)
                              FROM corporateentities;`
    const totalCorporateEntities = results[0]["count"];
    this.setState({totalCorporateEntities})
}

//TOTAL GENDER COUNTS
export async function fetchGenders() {
    const results = await sql`SELECT gender, COUNT(*) AS count
                              FROM people
                              GROUP BY gender;`
    const genders = results[0]["count"];
    this.setState({genders})
}

//GET PROVINCE ACTIVITY
export async function fetchProvinces() {
    const results = await sql`SELECT (SELECT name_zh FROM geographynodes WHERE id = geo.province_id) AS province_name,
                                     COUNT(DISTINCT peo.id)                                          AS activity_count
                              FROM people AS peo
                                       JOIN presentat AS pre ON pre.entity_from_id = peo.id
                                       JOIN (SELECT id, entity_to_id
                                             FROM events e
                                                      JOIN events_locatedin l ON e.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM institutions i
                                                      JOIN institutions_locatedin l ON i.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM generalareas g
                                                      JOIN generalareas_locatedin l ON g.id = l.entity_from_id)
                                  AS loc ON loc.id = pre.entity_to_id
                                       JOIN geographynodes geo ON geo.id = loc.entity_to_id
                              WHERE geo.province_id IS NOT NULL
                              GROUP BY geo.province_id
                              ORDER BY activity_count DESC
                              LIMIT 10;`
    const provinces = results;
    this.setState({provinces})
}

//GET PREFECTURE ACTIVITY
export async function fetchPrefectures() {
    const results = await sql`SELECT (SELECT name_zh FROM geographynodes WHERE id = geo.prefecture_id) AS province_name,
                                     COUNT(DISTINCT peo.id)                                            AS activity_count
                              FROM people AS peo
                                       JOIN presentat AS pre ON pre.entity_from_id = peo.id
                                       JOIN (SELECT id, entity_to_id
                                             FROM events e
                                                      JOIN events_locatedin l ON e.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM institutions i
                                                      JOIN institutions_locatedin l ON i.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM generalareas g
                                                      JOIN generalareas_locatedin l ON g.id = l.entity_from_id)
                                  AS loc ON loc.id = pre.entity_to_id
                                       JOIN geographynodes geo ON geo.id = loc.entity_to_id
                              WHERE geo.prefecture_id IS NOT NULL
                              GROUP BY geo.prefecture_id
                              ORDER BY activity_count DESC
                              LIMIT 10;`
    const prefectures = results;
    this.setState({prefectures})
}

//GET COUNTY ACTIVITY
export async function fetchCounties() {
    const results = await sql`SELECT (SELECT name_zh FROM geographynodes WHERE id = geo.county_id) AS province_name,
                                     COUNT(DISTINCT peo.id)                                        AS activity_count
                              FROM people AS peo
                                       JOIN presentat AS pre ON pre.entity_from_id = peo.id
                                       JOIN (SELECT id, entity_to_id
                                             FROM events e
                                                      JOIN events_locatedin l ON e.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM institutions i
                                                      JOIN institutions_locatedin l ON i.id = l.entity_from_id
                                             UNION ALL
                                             SELECT id, entity_to_id
                                             FROM generalareas g
                                                      JOIN generalareas_locatedin l ON g.id = l.entity_from_id)
                                  AS loc ON loc.id = pre.entity_to_id
                                       JOIN geographynodes geo ON geo.id = loc.entity_to_id
                              WHERE geo.county_id IS NOT NULL
                              GROUP BY geo.county_id
                              ORDER BY activity_count DESC
                              LIMIT 10;`
    const counties = results;
    this.setState({counties})
}

//GET NATIONALITY OF ALL PEOPLE
export async function fetchNationality() {
    const results = await sql`SELECT nationality, COUNT(1) AS count
                              FROM people
                              WHERE nationality IS NOT NULL
                                AND nationality <> 'Unknown'
                              GROUP BY nationality
                              ORDER BY count DESC;
    `
    const nationality = results;
    this.setState({nationality})
}

//GET COUNT OF PEOPLE WITH NULL NATIONALITY
export async function fetchNationalityNull() {
    const results = await sql`SELECT COUNT(1) AS count
                              FROM people
                              WHERE nationality IS NULL
                                 OR nationality = 'Unknown';
    `
    const nationalityNull = results;
    this.setState({nationalityNull})
}

//GET CHRISTIAN TRADITION OF ALL NODES
export async function fetchChristianTradition() {
    const results = await sql`
        SELECT christian_tradition, COUNT(1) AS count
        FROM (SELECT christian_tradition
              FROM corporateentities
              UNION ALL
              SELECT christian_tradition
              FROM institutions
              UNION ALL
              SELECT christian_tradition
              FROM events) AS nodes
        WHERE christian_tradition IS NOT NULL
        GROUP BY christian_tradition;
    `
    const christianTradition = results;
    this.setState({christianTradition})
}

//GET RELIGIOUS FAMILIES OF ALL NODES
export async function fetchReligiousFamilies() {
    const results = await sql`
        SELECT religious_family, COUNT(1) AS count
        FROM (SELECT religious_family
              FROM corporateentities
              UNION ALL
              SELECT religious_family
              FROM institutions
              UNION ALL
              SELECT religious_family
              FROM events) AS nodes
        WHERE religious_family IS NOT NULL
        GROUP BY religious_family;
    `
    const religiousFamilies = results;
    this.setState({religiousFamilies})
}

//GET CHRISTIAN TRADITIONS OF NULL VALUE
export async function fetchChristianTraditionNullValues() {
    const results = await sql`
        SELECT COUNT(1) AS count
        FROM (SELECT christian_tradition
              FROM corporateentities
              UNION ALL
              SELECT christian_tradition
              FROM institutions
              UNION ALL
              SELECT christian_tradition
              FROM events) AS nodes
        WHERE christian_tradition IS NULL;
    `
    const christianTraditionNullValues = results
    this.setState({christianTraditionNullValues})
}

//GET RELIGIOUS FAMILIES OF NULL VALUE
export async function fetchReligiousFamilyNullValues() {
    const results = await sql`SELECT COUNT(1) AS count
                              FROM (SELECT religious_family
                                    FROM corporateentities
                                    UNION ALL
                                    SELECT religious_family
                                    FROM institutions
                                    UNION ALL
                                    SELECT religious_family
                                    FROM events) AS nodes
                              WHERE religious_family IS NULL;
    `
    const religiousFamilyNullValues = results
    this.setState({religiousFamilyNullValues})
}

//////////////////////////

// GET CORP ENT DATA FOR DATA DASHBOARD SELECT
export async function fetchCorpOptions() {
    const results = await sql`SELECT DISTINCT ce.id                 AS value,
                                              ce.name_western       AS label,
                                              ce.chinese_name_hanzi AS label_alt,
                                              'CorporateEntity'     AS type
                              FROM corporateentities ce
                                       JOIN people_partof_corporateentities cep ON ce.id = cep.entity_to_id
                                       JOIN people p ON cep.entity_from_id = p.id
                              WHERE ce.corporate_entity_category = 'Religious Body';
    `
    const corpOptions = results;
    this.setState({corpOptions})
}

// GET INST DATA FOR DATA DASHBOARD SELECT
export async function fetchInstOptions() {
    const results = await sql`SELECT DISTINCT ce.id                 AS value,
                                              ce.name_western       AS label,
                                              ce.chinese_name_hanzi AS label_alt,
                                              'Institution'         AS type
                              FROM institutions ce
                                       JOIN people_presentat_institutions cep ON ce.id = cep.entity_to_id
                                       JOIN people p ON cep.entity_from_id = p.id
                              WHERE ce.institution_subcategory <> 'General Work';
    `
    const instOptions = results;
    this.setState({instOptions})
}

// GET GEO DATA FOR DATA DASHBOARD SELECT
export async function fetchGeoOptions() {
    const results = await sql`SELECT DISTINCT g.id       AS value,
                                              g.name_wes AS label,
                                              g.name_zh  AS label_alt
                              FROM geographynodes g
                              WHERE g.id in
                                    (SELECT entity_to_id
                                     FROM events e
                                              JOIN events_locatedin l ON e.id = l.entity_from_id
                                     UNION ALL
                                     SELECT entity_to_id
                                     FROM institutions i
                                              JOIN institutions_locatedin l ON i.id = l.entity_from_id);
    `
    const GeoOptions = results;
    this.setState({GeoOptions})
}

//QUERY TO GET DATA FOR INST DATA VIEWS
export function fetchInstitutionsData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({nosend: "nosend"})
    } else {
        this.setState({content: "loading"})
        let selectedOption = "Institution"
        this.setState({selectedOption});
        this.setState({nationality: ""});
        this.setState({nationalityNull: ""});
        this.setState({totalPeople: ""});
        this.setState({totalRelationships: ""});
        this.setState({totalInstitutions: ""});
        this.setState({totalEvents: ""});
        this.setState({provinces: ""});
        this.setState({instDateList: ""});
        this.setState({genderList: ""});
        this.setState({genders: ""});
        this.setState({religiousFamily: ""});
        this.setState({christianTradition: ""});
        this.setState({inputValue: ' '});
        this.setState({append: this.state.append + 1})

        //SET CENTRAL NODE
        let nodeIdFilter = this.state.node_id

        //FETCH COUNTS
        const result1 = sql`
            SELECT n.id                                     AS node,
                   (SELECT COUNT(DISTINCT p.id)
                    FROM People p
                             JOIN Relationship r ON p.id = r.entity_from_id OR p.id = r.entity_to_id
                    WHERE r.entity_from_id = ${nodeIdFilter}
                       OR r.entity_to_id = ${nodeIdFilter}) AS count,
                   (SELECT COUNT(DISTINCT e.id)
                    FROM Events e
                             JOIN Relationship r ON e.id = r.entity_from_id OR e.id = r.entity_to_id
                    WHERE r.entity_from_id = ${nodeIdFilter}
                       OR r.entity_to_id = ${nodeIdFilter}) AS eventcount,
                   (SELECT COUNT(DISTINCT t.id)
                    FROM CorporateEntities t
                             JOIN Relationship r ON t.id = r.entity_from_id OR t.id = r.entity_to_id
                    WHERE r.entity_from_id = ${nodeIdFilter}
                       OR r.entity_to_id = ${nodeIdFilter}) AS corpcount
            FROM Nodes n
            WHERE n.id = ${nodeIdFilter};
        `

        const nodeArray = result1[0];
        const totalPeople = nodeArray['count'];
        const totalInstitutions = 1
        const totalCorporateEntities = nodeArray['corpcount'];
        const totalEvents = nodeArray['eventcount'];
        if (nodeArray.length === 0) {
            this.setState({noresults: "noresults"})
        } else {
            this.setState({nodeArray});
            this.setState({totalPeople})
            this.setState({totalInstitutions})
            this.setState({totalCorporateEntities})
            this.setState({totalEvents})
            this.setState({noresults: "noresults hide"})
            this.setState({content: "loaded"})
        }

        //FETCH (AND CLEAN) GENDER COUNTS
        const result2 = sql`
            SELECT p.gender AS gender,
                   COUNT(*) AS count
            FROM People p
                     JOIN
                 Relationship r ON p.id = r.entity_from_id OR p.id = r.entity_to_id
            WHERE r.entity_from_id = ${nodeIdFilter}
               OR r.entity_to_id = ${nodeIdFilter}
            GROUP BY p.gender;`

        const genderArray = result2[0].map(row => ({
            key: row[0],
            value: row[1]
        }));
        let genders = [];
        for (let i = 0; i < genderArray.length; i++) {
            genders.push(genderArray[i])
        }
        this.setState({genders});

        // FETCH GENDER ACTIVITY
        const result2b = sql`
            WITH RECURSIVE
                related_institutions AS (
                    -- Base case: Start with the base institution
                    SELECT i.id AS institution_id
                    FROM institutions i
                    WHERE i.id = ${nodeIdFilter}
                    UNION ALL
                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                    SELECT r.entity_from_id AS institution_id
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                    WHERE r.entity_from_id IS NOT NULL
                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                ),
                data AS (SELECT DISTINCT p.id AS person_id,
                                         p.gender,
                                         r.start_year,
                                         r.end_year
                         FROM People p
                                  JOIN Relationship r ON (p.id = r.entity_from_id)
                             OR (p.id = r.entity_to_id)
                                  JOIN related_institutions ri ON (r.entity_from_id = ri.institution_id)
                             OR (r.entity_to_id = ri.institution_id)
                         WHERE p.gender IS NOT NULL
                           AND r.start_year IS NOT NULL
                           AND r.end_year IS NOT NULL -- Exclude records where end_year is NULL
                ),
                ranges AS (SELECT person_id,
                                  gender,
                                  generate_series(start_year, end_year) AS year
                           FROM data),
                yearly_counts AS (SELECT year,
                                         gender,
                                         COUNT(DISTINCT person_id) AS count
                                  FROM ranges
                                  GROUP BY year,
                                           gender),
                gender_year_counts AS (SELECT year,
                                              SUM(
                                                      CASE
                                                          WHEN gender = 'Male' THEN count
                                                          ELSE 0
                                                          END
                                              ) AS male,
                                              SUM(
                                                      CASE
                                                          WHEN gender = 'Female' THEN count
                                                          ELSE 0
                                                          END
                                              ) AS female,
                                              SUM(
                                                      CASE
                                                          WHEN gender IS NULL
                                                              OR gender NOT IN ('Male', 'Female') THEN count
                                                          ELSE 0
                                                          END
                                              ) AS unknown
                                       FROM yearly_counts
                                       GROUP BY year)
            SELECT year                 AS info,
                   COALESCE(female, 0)  AS female,
                   COALESCE(male, 0)    AS male,
                   COALESCE(unknown, 0) AS unknown
            FROM gender_year_counts
            ORDER BY year;`
        const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
        const genderList = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
        this.setState({genderList})

        //FETCH NATIONALITY
        const result3 = sql`WITH RECURSIVE
                                related_institutions AS (
                                    -- Base case: Start with the base institution
                                    SELECT i.id AS institution_id
                                    FROM institutions i
                                    WHERE i.id = ${nodeIdFilter}
                                    UNION ALL
                                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                                    SELECT r.entity_from_id AS institution_id
                                    FROM related_institutions ri
                                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                                    WHERE r.entity_from_id IS NOT NULL
                                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                                ),
                                relevant_people AS (
                                    -- Find all distinct people related to any of the related institutions
                                    SELECT DISTINCT p.id,
                                                    p.nationality
                                    FROM related_institutions ri
                                             JOIN Relationship r ON ri.institution_id = r.entity_from_id
                                        OR ri.institution_id = r.entity_to_id
                                             JOIN People p ON (p.id = r.entity_from_id)
                                        OR (p.id = r.entity_to_id)
                                    WHERE p.nationality <> 'Unknown'
                                      AND p.id IS NOT NULL)
                            SELECT rp.nationality,
                                   COUNT(*) AS count
                            FROM relevant_people rp
                            GROUP BY rp.nationality
                            ORDER BY count DESC;`
        const nationalityList = results.records.map((record) => record.get('List', 'info'));
        const nationality = nationalityList.filter(d => d.count >= 1)
        this.setState({nationality})

        //FETCH NATIONALITY (NULL)
        const result4 = sql`WITH RECURSIVE
                                related_institutions AS (
                                    -- Base case: Start with the base institution
                                    SELECT i.id AS institution_id
                                    FROM institutions i
                                    WHERE i.id = ${nodeIdFilter}
                                    UNION ALL
                                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                                    SELECT r.entity_from_id AS institution_id
                                    FROM related_institutions ri
                                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                                    WHERE r.entity_from_id IS NOT NULL
                                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                                ),
                                relevant_people AS (
                                    -- Find all distinct people related to any of the related institutions
                                    SELECT DISTINCT p.id,
                                                    p.nationality
                                    FROM related_institutions ri
                                             JOIN Relationship r ON ri.institution_id = r.entity_from_id
                                        OR ri.institution_id = r.entity_to_id
                                             JOIN People p ON (p.id = r.entity_from_id)
                                        OR (p.id = r.entity_to_id)
                                    WHERE (
                                        p.nationality = 'Unknown'
                                            OR p.nationality IS NULL
                                        )
                                      AND p.id IS NOT NULL)
                            SELECT rp.nationality,
                                   COUNT(*) AS count
                            FROM relevant_people rp
                            GROUP BY rp.nationality
                            ORDER BY count DESC;`
        const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
        this.setState({nationalityNull})

        //FETCH PEOPLE PRESENT BY YEAR
        const result8 = sql`
            WITH RECURSIVE
                related_institutions AS (
                    -- Base case: Start with the base institution
                    SELECT i.id AS institution_id
                    FROM institutions i
                    WHERE i.id = ${nodeIdFilter}
                    UNION ALL
                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                    SELECT r.entity_from_id AS institution_id
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                    WHERE r.entity_from_id IS NOT NULL
                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                ),
                data AS (
                    -- Find people related to any of the related institutions
                    SELECT DISTINCT p.id AS person_id,
                                    r.start_year,
                                    r.end_year
                    FROM People p
                             JOIN Relationship r ON (p.id = r.entity_from_id)
                        OR (p.id = r.entity_to_id)
                             JOIN related_institutions ri ON (r.entity_from_id = ri.institution_id)
                        OR (r.entity_to_id = ri.institution_id)
                    WHERE p.id IS NOT NULL
                      AND r.start_year IS NOT NULL
                      AND r.end_year IS NOT NULL -- Exclude records where end_year is NULL
                ),
                ranges AS (
                    -- Generate years for each person based on the start and end years
                    SELECT person_id,
                           generate_series(start_year, end_year) AS year
                    FROM data),
                yearly_counts AS (
                    -- Count distinct people per year
                    SELECT year,
                           COUNT(DISTINCT person_id) AS total_count
                    FROM ranges
                    GROUP BY year)
            SELECT year AS info,
                   total_count
            FROM yearly_counts
            ORDER BY year;`
        const instList = results.records.map((record) => record.get('List', 'info'));
        const instDateList = instList.filter(d => (d.count >= 1 && d.info >= 1550 && d.info <= 1950))
        this.setState({instDateList})

        //FETCH CHRISTIAN_TRADITION
        const result9 = sql`
            WITH RECURSIVE
                related_institutions AS (
                    -- Base case: Start with the base institution
                    SELECT i.id AS institution_id
                    FROM institutions i
                    WHERE i.id = ${nodeIdFilter}
                    UNION ALL
                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                    SELECT r.entity_from_id AS institution_id
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                    WHERE r.entity_from_id IS NOT NULL
                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions
                ),
                relevant_people AS (
                    -- Find all distinct people related to any of the related institutions
                    SELECT DISTINCT p.id,
                                    p.christian_tradition
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_from_id
                        OR ri.institution_id = r.entity_to_id
                             JOIN People p ON (p.id = r.entity_from_id)
                        OR (p.id = r.entity_to_id)
                    WHERE p.christian_tradition IS NOT NULL
                      AND p.id IS NOT NULL)
            SELECT rp.christian_tradition,
                   COUNT(*) AS count
            FROM relevant_people rp
            GROUP BY rp.christian_tradition
            ORDER BY count DESC;
        `
        const christianTraditionList = results.records.map((record) => record.get('List', 'christian_tradition'));
        let christianTradition = [];
        for (let i = 0; i < christianTraditionList.length; i++) {
            this.renameProperty(christianTraditionList[i], 'christian_tradition', 'key')
            this.renameProperty(christianTraditionList[i], 'count', 'value')
            {
                christianTradition.push(christianTraditionList[i])
            }
        }
        this.setState({christianTradition})

        //FETCH RELIGIOUS_FAMILY
        const result10 = sql`
            WITH RECURSIVE
                related_institutions AS (
                    -- Base case: Start with the base institution
                    SELECT i.id AS institution_id
                    FROM institutions i
                    WHERE i.id = ${nodeIdFilter}
                    UNION ALL
                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                    SELECT r.entity_from_id AS institution_id
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                    WHERE r.entity_from_id IS NOT NULL
                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions
                ),
                relevant_people AS (
                    -- Find all distinct people related to any of the related institutions
                    SELECT DISTINCT p.id,
                                    p.religious_family
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_from_id
                        OR ri.institution_id = r.entity_to_id
                             JOIN People p ON (p.id = r.entity_from_id)
                        OR (p.id = r.entity_to_id)
                    WHERE p.religious_family IS NOT NULL
                      AND p.id IS NOT NULL)
            SELECT rp.religious_family,
                   COUNT(*) AS count
            FROM relevant_people rp
            GROUP BY rp.religious_family
            ORDER BY count DESC;`
        const religiousFamilyList = results.records.map((record) => record.get('List', 'religious_family'));
        const religiousFamilyClean = religiousFamilyList.filter(d => d.count >= 0)
        let religiousFamily = [];
        for (let i = 0; i < religiousFamilyClean.length; i++) {
            this.renameProperty(religiousFamilyClean[i], 'religious_family', 'key')
            this.renameProperty(religiousFamilyClean[i], 'count', 'value')
            {
                religiousFamily.push(religiousFamilyClean[i])
            }
        }
        this.setState({religiousFamily})

        //FETCH RELIGIOUS_FAMILY NULL
        const result11 = sql`WITH RECURSIVE
                                 related_institutions AS (
                                     -- Base case: Start with the base institution
                                     SELECT i.id AS institution_id
                                     FROM institutions i
                                     WHERE i.id = ${nodeIdFilter}
                                     UNION ALL
                                     -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                                     SELECT r.entity_from_id AS institution_id
                                     FROM related_institutions ri
                                              JOIN Relationship r ON ri.institution_id = r.entity_to_id
                                              JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                                     WHERE r.entity_from_id IS NOT NULL
                                       AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                                 ),
                                 relevant_people AS (
                                     -- Find all distinct people related to any of the related institutions
                                     SELECT DISTINCT p.id,
                                                     p.religious_family
                                     FROM related_institutions ri
                                              JOIN Relationship r ON ri.institution_id = r.entity_from_id
                                         OR ri.institution_id = r.entity_to_id
                                              JOIN People p ON (p.id = r.entity_from_id)
                                         OR (p.id = r.entity_to_id)
                                     WHERE (
                                         p.religious_family = 'Unknown'
                                             OR p.religious_family IS NULL
                                         )
                                       AND p.id IS NOT NULL)
                             SELECT rp.religious_family,
                                    COUNT(*) AS count
                             FROM relevant_people rp
                             GROUP BY rp.religious_family
                             ORDER BY count DESC;`
        const religiousFamilyNullValues = result11[0]["count"];
        this.setState({religiousFamilyNullValues})


        //FETCH CHRISTIAN TRADITION NULL
        const result12 = sql`
            WITH RECURSIVE
                related_institutions AS (
                    -- Base case: Start with the base institution
                    SELECT i.id AS institution_id
                    FROM institutions i
                    WHERE i.id = ${nodeIdFilter}
                    UNION ALL
                    -- Recursive case: Find institutions where the current institution is the "to" and another institution is the "from"
                    SELECT r.entity_from_id AS institution_id
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_to_id
                             JOIN institutions i ON r.entity_from_id = i.id -- Ensure we're only joining to institutions
                    WHERE r.entity_from_id IS NOT NULL
                      AND r.entity_from_id LIKE 'N%' -- Filter to only include institutions (IDs starting with "N")
                ),
                relevant_people AS (
                    -- Find all distinct people related to any of the related institutions
                    SELECT DISTINCT p.id,
                                    p.christian_tradition
                    FROM related_institutions ri
                             JOIN Relationship r ON ri.institution_id = r.entity_from_id
                        OR ri.institution_id = r.entity_to_id
                             JOIN People p ON (p.id = r.entity_from_id)
                        OR (p.id = r.entity_to_id)
                    WHERE (
                        p.christian_tradition = 'Unknown'
                            OR p.christian_tradition IS NULL
                        )
                      AND p.id IS NOT NULL)
            SELECT rp.christian_tradition,
                   COUNT(*) AS count
            FROM relevant_people rp
            GROUP BY rp.christian_tradition
            ORDER BY count DESC;`

        const christianTraditionNullValues = result12[0]["count"];
        this.setState({christianTraditionNullValues})
    }
}

//QUERY TO GET DATA FOR CORPORATE DATA VIEWS
export function fetchCorporateEntitiesData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({nosend: "nosend"})
    } else {
        this.setState({content: "loading"})
        let selectedOption = "CorporateEntity"
        this.setState({selectedOption});
        this.setState({nationality: ""});
        this.setState({nationalityNull: ""});
        this.setState({totalPeople: ""});
        this.setState({totalRelationships: ""});
        this.setState({totalInstitutions: ""});
        this.setState({totalEvents: ""});
        this.setState({prefectures: ""});
        this.setState({provinces: ""});
        this.setState({counties: ""});
        this.setState({instDateList: ""});
        this.setState({instTypeList: ""});
        this.setState({genderList: ""});
        this.setState({genders: ""});
        this.setState({religiousFamily: ""});
        this.setState({christianTradition: ""});
        this.setState({christianTradition: ""});
        this.setState({inputValue: ' '});
        this.setState({append: this.state.append + 1})

        //SET CENTRAL NODE
        let nodeIdFilter;
        if (this.state.node_id !== "") {
            nodeIdFilter = this.state.node_id
        } else {
            nodeIdFilter = ""
        }

        //FETCH COUNTS
        const results = `
      MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      WITH n
      CALL {
        WITH n
        MATCH (n)--(q:Institution)-[t]-(p:Person) 
        OPTIONAL MATCH (n)--(p:Person)--(q)
        RETURN count(DISTINCT p) as person
      }
      CALL {
        WITH n
        MATCH (n)--(:Person)-[t]-(p:Institution) 
        OPTIONAL MATCH (n)--(p:Institution)
        RETURN count(DISTINCT p) as instcount
      }
      CALL {
        WITH n
        MATCH (n)--(:Person)-[t]-(p:Event)
        OPTIONAL MATCH (n)--(p:Event)
        RETURN count(DISTINCT p) as eventcount
      }
      CALL apoc.cypher.run('MATCH (t:CorporateEntity)-[]-(p) WHERE id(p)=` + nodeIdFilter + ` WITH DISTINCT t RETURN count(*) as count',{}) YIELD value as corp
      RETURN n as node, person as count, instcount, eventcount, corp.count as corpcount`
        const newArray = results.records.map((record) => record.get('node'));
        const nodeArray = newArray[0];
        const totalPeople = results.records.map((record) => record.get('count'));
        const totalInstitutions = results.records.map((record) => record.get('instcount'));
        const totalCorporateEntities = results.records.map((record) => record.get('corpcount'));
        const totalEvents = results.records.map((record) => record.get('eventcount'));
        if (nodeArray.length === 0) {
            this.setState({noresults: "noresults"})
        } else {
            this.setState({nodeArray});
            this.setState({totalPeople});
            this.setState({totalInstitutions});
            this.setState({totalCorporateEntities});
            this.setState({totalEvents});
            this.setState({noresults: "noresults hide"})
            this.setState({content: "loaded"})
        }

        //FETCH (AND CLEAN) GENDER COUNTS
        const result2 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      CALL {
          WITH n
          MATCH (n)--(p:Person)--(q) 
          OPTIONAL MATCH (n)--(q:Institution)-[t]-(p:Person)
          RETURN DISTINCT p
      }
      WITH p.gender AS gender, count(*) AS count
      RETURN DISTINCT {gender: gender, count: count} AS List`
        const genderArray = results.records.map((record) => record.get('List', 'gender'));
        let genders = [];
        for (let i = 0; i < genderArray.length; i++) {
            this.renameProperty(genderArray[i], 'gender', 'key')
            this.renameProperty(genderArray[i], 'count', 'value')
            {
                genders.push(genderArray[i])
            }
        }
        this.setState({genders});

        // FETCH GENDER ACTIVITY
        const query2b = `
    MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)-[t]-(p:Person)--(q) WHERE id(n)=` + nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL 
      OPTIONAL MATCH (n)--(q:Institution)-[t]-(p:Person) WHERE id(n)=` + nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL
      WITH p, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN DISTINCT p, p.gender as gender, range(toInteger(min), toInteger(max)) as range
    }
    WITH DISTINCT gender, apoc.coll.flatten(COLLECT(range)) as years
    WITH gender,  apoc.coll.frequencies(years) as freq UNWIND freq as freq_occur
    WITH apoc.map.fromValues([toLower(gender), freq_occur.count]) as gender_count, freq_occur.item as year
    UNWIND keys(gender_count) as key 
    WITH CASE
      WHEN key = "male" THEN {info: year, male: gender_count[key], female: 0, unknown: 0}
      WHEN key = "female" THEN {info: year, male: 0, female: gender_count[key], unknown: 0}
      ELSE {info: year, male: 0, female: 0, unknown: gender_count[key]}
      END as List
    WITH List UNWIND List as item
    WITH {
      info: item.info,
      female:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.female)))),
      male:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.male)))),
      unknown:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.unknown))))
    } as item2 ORDER BY item2.info
    RETURN item2 as List
      `
        const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
        const genderListInitA = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
        const genderListFilter1 = genderListInitA.filter((o, i) => !i || o.female >= (genderListInitA[i - 1].female * .25));
        const genderListFilter2 = genderListFilter1.filter((o, i) => !i || o.female >= (genderListFilter1[i - 1].female * .25));
        const genderListFilter3 = genderListFilter2.filter((o, i) => !i || o.male >= (genderListFilter2[i - 1].male * .25));
        const genderList = genderListFilter3.filter((o, i) => !i || o.male >= (genderListFilter3[i - 1].male * .25));
        this.setState({genderList})

        //FETCH NATIONALITY
        const query3 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(p:Person) WHERE p.nationality <> "Unknown"
      OPTIONAL MATCH (n)--(:Institution)-[t]-(p:Person) WHERE p.nationality <> "Unknown"
      RETURN DISTINCT p
    }
    WITH p.nationality AS nationality, count(*) AS count
    RETURN DISTINCT {info: nationality, count: count} AS List ORDER BY List.count`

        const nationalityList = results.records.map((record) => record.get('List', 'info'));
        const nationality = nationalityList.filter(d => d.count >= 1)
        this.setState({nationality})

        //FETCH NATIONALITY (NULL)
        const query4 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
        WITH n
        MATCH (n)--(p:Person) WHERE p.nationality IS NULL OR p.nationality = "Unknown"
        OPTIONAL MATCH (n)--(:Institution)-[t]-(p:Person) WHERE p.nationality IS NULL OR p.nationality = "Unknown"
        RETURN DISTINCT p
    }
    RETURN count(p) as Count`
        const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
        this.setState({nationalityNull})

        // FETCH COUNTY ACTIVITY
        const query5 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=` + nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
    WITH count(distinct p) as count, o
    CALL apoc.path.subgraphAll(o, {
      relationshipFilter: "INSIDE_OF>",
        labelFilter:'/County',
        maxLevel: 4
    })
    YIELD nodes, relationships
    WITH count, 
    CASE labels(o)[0] WHEN "Province" THEN NULL WHEN "Prefecture" THEN NULL
    ELSE 
      CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_wes ELSE nodes[0].name_wes END
    END AS prov,
    CASE labels(o)[0] WHEN "Province" THEN NULL WHEN "Prefecture" THEN NULL
    ELSE 
      CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_zh ELSE nodes[0].name_zh END
    END AS provzh
    WITH {County: {en: prov, zh: provzh, tw: provzh}, Activity: sum(count)} AS Lister ORDER BY Lister.Activity DESC
    WITH [prov in COLLECT(Lister) WHERE prov.County IS NOT NULL] as filter1 UNWIND filter1 as List
    RETURN List LIMIT 10`

        const counties1 = results.records.map((record) => record.get('List', 'Activity'));
        const counties = counties1.filter(d => (d.County.en !== null))
        this.setState({counties})

        // FETCH PREFECTURE ACTIVITY
        const query6 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=` + nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
    WITH count(distinct p) as count, o
    CALL apoc.path.subgraphAll(o, {
      relationshipFilter: "INSIDE_OF>",
        labelFilter:'/Prefecture',
        maxLevel: 4
    })
    YIELD nodes, relationships
    WITH count, 
    CASE labels(o)[0] WHEN "Province" THEN NULL ELSE 
      CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_wes ELSE nodes[0].name_wes END
    END AS prov,
    CASE labels(o)[0] WHEN "Province" THEN NULL ELSE 
      CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_zh ELSE nodes[0].name_zh END
    END AS provzh
    WITH {Prefecture: {en: prov, zh: provzh, tw: provzh}, Activity: sum(count)} AS Lister ORDER BY Lister.Activity DESC
    WITH [prov in COLLECT(Lister) WHERE prov.Prefecture IS NOT NULL] as filter1 UNWIND filter1 as List
    RETURN List LIMIT 10`

        const prefectures1 = results.records.map((record) => record.get('List', 'Activity'));
        const prefectures = prefectures1.filter(d => (d.Prefecture.en !== null))
        this.setState({prefectures})

        // FETCH PROVINCE ACTIVITY
        const query7 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=` + nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
    WITH count(distinct p) as count, o
    CALL apoc.path.subgraphAll(o, {
      relationshipFilter: "INSIDE_OF>",
        labelFilter:'/Province',
        maxLevel: 4
    })
    YIELD nodes, relationships
    WITH count, 
    CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_wes ELSE nodes[0].name_wes END as prov,
    CASE labels(nodes[0])[0]  WHEN NULL THEN o.name_zh ELSE nodes[0].name_zh END as provzh
    RETURN DISTINCT {Province: {en: prov, zh: provzh, tw: provzh}, Activity: sum(count)} AS List ORDER BY List.Activity DESC LIMIT 10`

        const provinces1 = results.records.map((record) => record.get('List', 'Activity'));
        const provinces = provinces1.filter(d => (d.Province.en !== null))
        this.setState({provinces})

        //FETCH INSTITUTIONS BY YEAR
        const query8 = `
    MATCH (p) WHERE id(p)=` + nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)--(q:Person)-[t]-(i:Institution) WHERE t.start_year IS NOT NULL
      OPTIONAL MATCH (p)--(i:Institution)-[t]-(q:Person) WHERE t.start_year IS NOT NULL
      OPTIONAL MATCH (p)-[t]-(i:Institution) WHERE t.start_year IS NOT NULL
      WITH DISTINCT i, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN i.name_western as name, range(toInteger(min), toInteger(max)) as years
      }
    WITH name, apoc.coll.flatten(collect(years)) as year_list
    UNWIND year_list as all_years
    RETURN {info: toInteger(all_years), count: toInteger(count(distinct name))} as List  ORDER BY List.info`
        const instList = results.records.map((record) => record.get('List', 'info'));
        const filteredInstList = instList.filter(d => (d.count > 0 && d.info >= 1550 && d.info <= 1950))
        const instDateList1 = filteredInstList.filter((o, i) => !i || o.count > (filteredInstList[i - 1].count * .25));
        const instDateList2 = instDateList1.filter((o, i) => !i || o.count > (instDateList1[i - 1].count * .25));
        const instDateList3 = instDateList2.filter((o, i) => !i || o.count > (instDateList2[i - 1].count * .25));
        const instDateList = instDateList3.filter((o, i) => !i || o.count > (instDateList3[i - 1].count * .25));
        this.setState({instDateList})

        //FETCH INSTITUTIONS TYPES
        const query9 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      CALL {
          WITH n
          MATCH (n)--(:Person)--(i:Institution) 
          OPTIONAL MATCH (n)--(i:Institution)
          RETURN DISTINCT i
      }
    WITH CASE i.institution_category
      WHEN NULL THEN "N/A" 
      ELSE i.institution_category END AS type, count(*) AS count
    RETURN DISTINCT {type: type, count: count} AS List`
        const instArray = results.records.map((record) => record.get('List', 'type'));
        let instTypeList = [];
        for (let i = 0; i < instArray.length; i++) {
            this.renameProperty(instArray[i], 'type', 'key')
            this.renameProperty(instArray[i], 'count', 'value')
            {
                instTypeList.push(instArray[i])
            }
        }
        this.setState({instTypeList});
    }
}

//QUERY TO GET DATA FOR GEO DATA VIEWS
export function fetchGeographyData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({nosend: "nosend"})
    } else {
        let selectedOption = "Geography"
        this.setState({content: "loading"})
        this.setState({selectedOption});
        this.setState({nationality: ""});
        this.setState({nationalityNull: ""});
        this.setState({totalPeople: ""});
        this.setState({totalRelationships: ""});
        this.setState({totalInstitutions: ""});
        this.setState({instTypeList: ""});
        this.setState({instDateList: ""});
        this.setState({totalEvents: ""});
        this.setState({provinces: ""});
        this.setState({prefectures: ""});
        this.setState({counties: ""});
        this.setState({instDateList: ""});
        this.setState({genderList: ""});
        this.setState({genders: ""});
        this.setState({religiousFamily: ""});
        this.setState({christianTradition: ""});
        this.setState({inputValue: ' '})
        this.setState({append: this.state.append + 1})


        //SET CENTRAL NODE
        let nodeIdFilter;
        if (this.state.node_id !== "") {
            nodeIdFilter = this.state.node_id
        } else {
            nodeIdFilter = ""
        }

        //FETCH COUNTS
        const query = `
      MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      WITH n
      CALL {
        WITH n
        MATCH (n)--(t)--(p:Person) WHERE t:Institution OR t:Event
        RETURN count(DISTINCT p) as person
      }
      CALL {
        WITH n
        MATCH (n)--(p:Institution)
        RETURN count(DISTINCT p) as instcount
      }
      CALL {
        WITH n
        MATCH (n)--(p:Event)
        RETURN count(DISTINCT p) as eventcount
      }
      CALL {
        WITH n
        MATCH (n)-[t*1..2]-(p:CorporateEntity)
        RETURN count(DISTINCT p) as corpcount
      }
      RETURN n as node, person as count, instcount, eventcount, corpcount`
        const newArray = results.records.map((record) => record.get('node'));
        const nodeArray = newArray[0];
        const totalPeople = results.records.map((record) => record.get('count'));
        const totalInstitutions = results.records.map((record) => record.get('instcount'));
        const totalCorporateEntities = results.records.map((record) => record.get('corpcount'));
        const totalEvents = results.records.map((record) => record.get('eventcount'));
        if (nodeArray.length === 0) {
            this.setState({noresults: "noresults"})
        } else {
            this.setState({nodeArray});
            this.setState({totalPeople});
            this.setState({totalInstitutions});
            this.setState({totalCorporateEntities});
            this.setState({totalEvents});
            this.setState({noresults: "noresults hide"})
            this.setState({content: "loaded"})
        }

        //FETCH (AND CLEAN) GENDER COUNTS
        const query2 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution
      RETURN DISTINCT p
    }
    WITH p.gender AS gender, count(*) AS count
    RETURN DISTINCT {gender: gender, count: count} AS List`
        const genderArray = results.records.map((record) => record.get('List', 'gender'));
        let genders = [];
        for (let i = 0; i < genderArray.length; i++) {
            this.renameProperty(genderArray[i], 'gender', 'key')
            this.renameProperty(genderArray[i], 'count', 'value')
            {
                genders.push(genderArray[i])
            }
        }
        this.setState({genders})

        // FETCH GENDER ACTIVITY
        const query2b = `
    MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(q)-[t]-(p:Person) WHERE q:Event or q:Institution AND id(n)=` + nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL
      WITH p, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN DISTINCT p, p.gender as gender, range(toInteger(min), toInteger(max)) as range
    }
    WITH DISTINCT gender, apoc.coll.flatten(COLLECT(range)) as years
    WITH gender,  apoc.coll.frequencies(years) as freq UNWIND freq as freq_occur
    WITH apoc.map.fromValues([toLower(gender), freq_occur.count]) as gender_count, freq_occur.item as year
    UNWIND keys(gender_count) as key 
    WITH CASE
      WHEN key = "male" THEN {info: year, male: gender_count[key], female: 0, unknown: 0}
      WHEN key = "female" THEN {info: year, male: 0, female: gender_count[key], unknown: 0}
      ELSE {info: year, male: 0, female: 0, unknown: gender_count[key]}
      END as List
    WITH List UNWIND List as item
    WITH {
      info: item.info,
      female:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.female)))),
      male:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.male)))),
      unknown:apoc.coll.sumLongs(apoc.coll.toSet(apoc.coll.flatten(collect(item.unknown))))
    } as item2 ORDER BY item2.info
    RETURN item2 as List
      `
        const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
        const genderListInitA = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
        const genderListFilter1 = genderListInitA.filter((o, i) => !i || o.female >= (genderListInitA[i - 1].female * .25));
        const genderListFilter2 = genderListFilter1.filter((o, i) => !i || o.female >= (genderListFilter1[i - 1].female * .25));
        const genderListFilter3 = genderListFilter2.filter((o, i) => !i || o.male >= (genderListFilter2[i - 1].male * .25));
        const genderList = genderListFilter3.filter((o, i) => !i || o.male >= (genderListFilter3[i - 1].male * .25));
        this.setState({genderList})

        //FETCH NATIONALITY
        const query3 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution AND p.nationality <> "Unknown"
      RETURN DISTINCT p
    }
    WITH p.nationality AS nationality, count(*) AS count
    RETURN DISTINCT {info: nationality, count: count} AS List ORDER BY List.count`
        const nationalityList = results.records.map((record) => record.get('List', 'info'));
        const nationality = nationalityList.filter(d => d.count >= 1)
        this.setState({nationality})

        //FETCH NATIONALITY (NULL)
        const query4 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
        WITH n
        MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution AND p.nationality IS NULL OR p.nationality = "Unknown"
        RETURN DISTINCT p
    }
    RETURN count(p) as Count`
        const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
        this.setState({nationalityNull})

        // FETCH GEO-INSTITUTITONAL ACTIVITY
        const query7 = `MATCH (g) WHERE id(g)=` + nodeIdFilter + `
    CALL {
        WITH g
        MATCH (g)--(i:Institution)-[t]-(p:Person) 
        WITH p, COLLECT(DISTINCT t.start_year) as starts, COLLECT(DISTINCT t.end_year) as ends
        WITH p, starts+ends as years UNWIND years as yearlist
        RETURN p, min(yearlist) as min, max(yearlist) as max
    }
    WITH g, p, min, max
    MATCH (g)--(i:Institution)-[t]-(p:Person)-[r]-(c:CorporateEntity) 
        WHERE (t.start_year >= min AND r.start_year >= min AND t.end_year <= max AND r.end_year <= max) 
        OR (t.start_year >= min AND r.start_year >= min AND t.end_year IS NULL AND r.end_year IS NULL)
        RETURN DISTINCT {key : c.name_western, value: count(DISTINCT i)} AS List
        ORDER BY List.count DESC LIMIT 25`
        const provinces = results.records.map((record) => record.get('List', 'count'));
        this.setState({provinces})

        // FETCH GEO-PERSON ACTIVITY
        const query6 = `MATCH (g) WHERE id(g)=` + nodeIdFilter + `
    CALL {
        WITH g
        MATCH (g)--(i:Institution)-[t]-(p:Person) 
        WITH p, COLLECT(DISTINCT t.start_year) as starts, COLLECT(DISTINCT t.end_year) as ends
        WITH p, starts+ends as years UNWIND years as yearlist
        RETURN p, min(yearlist) as min, max(yearlist) as max
    }
    WITH g, p, min, max
    MATCH (g)--(i:Institution)-[t]-(p:Person)-[r]-(c:CorporateEntity) 
        WHERE (t.start_year >= min AND r.start_year >= min AND t.end_year <= max AND r.end_year <= max) 
        OR (t.start_year >= min AND r.start_year >= min AND t.end_year IS NULL AND r.end_year IS NULL)
        RETURN DISTINCT {key : c.name_western, value: count(DISTINCT p)} AS List
        ORDER BY List.count DESC LIMIT 25`
        const counties = results.records.map((record) => record.get('List', 'count'));
        this.setState({counties})

        //FETCH INSTITUTIONS BY YEAR
        const query8 = `
    MATCH (p) WHERE id(p)=` + nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)--(i:Institution)-[t]-(q:Person) WHERE t.start_year IS NOT NULL
      WITH DISTINCT i, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN i.name_western as name, range(toInteger(min), toInteger(max)) as years
      }
    WITH name, apoc.coll.flatten(collect(years)) as year_list
    UNWIND year_list as all_years
    RETURN {info: toInteger(all_years), count: toInteger(count(name))} as List  ORDER BY List.info`
        const instList = results.records.map((record) => record.get('List', 'info'));
        const filteredInstList = instList.filter(d => (d.count > 0 && d.info >= 1550 && d.info <= 1950))
        const instDateList1 = filteredInstList.filter((o, i) => !i || o.count > (filteredInstList[i - 1].count * .25));
        const instDateList2 = instDateList1.filter((o, i) => !i || o.count > (instDateList1[i - 1].count * .25));
        const instDateList3 = instDateList2.filter((o, i) => !i || o.count > (instDateList2[i - 1].count * .25));
        const instDateList = instDateList3.filter((o, i) => !i || o.count > (instDateList3[i - 1].count * .25));

        //FETCH INSTITUTIONS TYPES
        const query9 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
        CALL {
          WITH n
          MATCH (n)--(i:Institution)
          RETURN DISTINCT i
      }
      WITH CASE i.institution_category
        WHEN NULL THEN "N/A" 
        ELSE i.institution_category END AS type, count(*) AS count
      RETURN DISTINCT {type: type, count: count} AS List`
        const instArray = results.records.map((record) => record.get('List', 'type'));
        let instTypeList = [];
        for (let i = 0; i < instArray.length; i++) {
            this.renameProperty(instArray[i], 'type', 'key')
            this.renameProperty(instArray[i], 'count', 'value')
            {
                instTypeList.push(instArray[i])
            }
        }
    }
}