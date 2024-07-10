// method to look up the neo4j id given the CHCD id
export function fetchNeo4jId(chcd_id, driver) {
    return new Promise((resolve, reject) => {
        if (chcd_id.startsWith("P")) {
            var internalIdQuery = `SELECT *
                                   FROM people
                                   WHERE id = '${chcd_id}'`;
        } else if (chcd_id.startsWith("I")) {
            var internalIdQuery = `SELECT *
                                   FROM institutions
                                   WHERE id = '${chcd_id}'`;
        } else if (chcd_id.startsWith("C")) {
            var internalIdQuery = `SELECT *
                                   FROM corporateentities
                                   WHERE id = '${chcd_id}'`;
        } else if (chcd_id.startsWith("E")) {
            var internalIdQuery = `SELECT *
                                   FROM events
                                   WHERE id = '${chcd_id}'`;
        } else if (chcd_id.startsWith("B")) {
            var internalIdQuery = `SELECT *
                                   FROM publications
                                   WHERE id = '${chcd_id}'`;
        } else {
            var internalIdQuery = `SELECT *
                                   FROM geographynode
                                   WHERE id = '${chcd_id}'`;
        }

        // Execute the internal ID lookup query
        const session = driver.session();

        session.run(internalIdQuery)
            .then((result) => {
                session.close();

                if (result.records.length > 0) {
                    resolve(result.records[0].get('internalId'));
                } else {
                    resolve("init"); // Resolve with null or handle the case where no records are found
                }
            })
            .catch((error) => {
                session.close();
                console.error("Error executing query:", error);
                reject(error);
            });
    });
}

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

        const query = `SELECT 'Person' AS type, id, tsv_content
            FROM people
            WHERE tsv_content @@ plainto_tsquery('english', '${searchProp}')
            UNION
            SELECT 'Institution' AS type, id, tsv_content
            FROM institutions
            WHERE tsv_content @@ plainto_tsquery('english', '${searchProp}')
            UNION
            SELECT 'Corporate Entity' AS type, id, tsv_content
            FROM corporateentities
            WHERE tsv_content @@ plainto_tsquery('english', '${searchProp}')
            UNION
            SELECT 'Event' AS type, id, tsv_content
            FROM events
            WHERE tsv_content @@ plainto_tsquery('english', '${searchProp}')
            UNION
            SELECT 'Publication' AS type, id, tsv_content
            FROM publications
            WHERE tsv_content @@ plainto_tsquery('english', '${searchProp}')`

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

