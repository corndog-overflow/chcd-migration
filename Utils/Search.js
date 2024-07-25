// QUERY TO FETCH RESULTS FOR SEARCH ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function fetchSearch() {
    if (this.state.search !== "") {
        this.setState({content: "loading"})
        const session = this.driver.session();
        const searchProp = this.state.search.replace(/[\(\)\[\]\{\}\.\\\/\-\_\^\~\`\|\^\*\^\"\"/'/']/g, " ");
        searchProp.split('').map((char) => {
            if (conversion[char]) {
                searchProp = searchProp.replace(char, conversion[char])
            }
        });

        const query = `SELECT DISTINCT *
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

        session
            .run(query)
            .then((results) => {
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

                const nodeArray = results.records.map((record) => record.get('Nodes'));
                if (nodeArray.length === 0) {
                    this.setState({noresults: "noresults"});
                    this.setState({content: "loaded"});
                    this.setState({searchSet: this.state.search})
                } else {
                    // TODO: Convert the query result to JSON format
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
                session.close()
            })
    } else {
    }
}
