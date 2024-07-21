//QUERY TO FETCH LISTS FOR NETWORK SELECTS
export function fetchNetworkIndexes() {
    if (this.state.inputValue !== '') {
        let value = this.state.inputValue.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");
        ;
        let nodeType = this.state.selectedOption
        if (nodeType === "Person") {
            const session = this.driver.session();
            const query =
                `SELECT DISTINCT 'person'                                             AS type,
                                 CONCAT(given_name_western, ' ', family_name_western) AS label,
                                 id                                                   AS value
                 FROM People p
                 WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
                       ('${value}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                        'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                `

            session.run(query).then((results) => {
                const nodeData = results.records.map((record) => record.get('List'));
                const netPersonIndex = nodeData.map(i => ({label: i.label, value: i.value, type: "node_id"}));
                this.setState({netPersonIndex})
                return (this.state.netPersonIndex)
                session.close()
            });
        } else {
            const session = this.driver.session();
            const query =
                `SELECT DISTINCT 'institution' AS type, name_western AS label, id AS value
                 FROM CorporateEntities ce
                 WHERE ARRAY [ce.full_text_name_content, ce.full_text_search_content] &@~
                       ('${value}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                        'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
                `

            session.run(query).then((results) => {
                const nodeData = results.records.map((record) => record.get('List'));
                const netPersonIndex = nodeData.map(i => ({label: i.label, value: i.value, type: "node_id"}));
                this.setState({netPersonIndex})
                return (this.state.netPersonIndex)
                session.close()
            });
        }
        ;
    } else {
        return null
    }
    return (this.state.netPersonIndex)

};

//PERSON AFFILIATION INDEX
export function fetchPAffIndex() {
    if (this.state.inputValuePAff !== '') {
        let value = this.state.inputValuePAff.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");
        ;
        const session5 = this.driver.session();
        const query5 =
            `SELECT DISTINCT 'affiliation'      AS type,
                             name_western       AS value,
                             name_western       AS label,
                             chinese_name_hanzi AS zh
             FROM CorporateEntities ce
             WHERE corporate_entity_category = 'Religious Body'
               AND ARRAY [ce.full_text_name_content, ce.full_text_search_content] &@~
                   ('${value}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                    'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
            `
        session5.run(query5).then((results) => {
            const resultIndex5 = results.records.map((record) => record.get('List'));
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
            session5.close()
        });
    } else {
        return null
    }
    return (this.state.pAffIndex)
};

//INSTITUTION AFFILIATION INDEX
export function fetchAffIndex() {
    if (this.state.inputValueAff !== '') {
        let value = this.state.inputValueAff.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");
        ;
        const session5 = this.driver.session();
        const query5 =
            // TODO: code repetition
            `SELECT DISTINCT 'affiliation'      AS type,
                             name_western       AS value,
                             name_western       AS label,
                             chinese_name_hanzi AS zh
             FROM CorporateEntities ce
             WHERE corporate_entity_category = 'Religious Body'
               AND ARRAY [ce.full_text_name_content, ce.full_text_search_content] &@~
                   ('${value}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                    'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
            `

        session5.run(query5).then((results) => {
            const resultIndex5 = results.records.map((record) => record.get('List'));
            const addAll5 = [{value: "All", en: "All", zh: "全部", tw: "全部"}];
            const affIndexPrep = addAll5.concat(resultIndex5);
            const affIndex = affIndexPrep.map(i => ({
                label: i.value + ` ` + i.zh,
                value: i.value,
                zh: i.zh,
                tw: i.zh,
                en: i.value,
                type: "affiliation"
            }));
            this.setState({affIndex});
            return (this.state.affIndex)
            session5.close()
        });
    } else {
        return null
    }
    return (this.state.affIndex)
};

//PERSON NATIONALITY INDEX
export function fetchNatIndex() {
    if (this.state.inputValueNat !== '') {
        let value = this.state.inputValueNat.replace("(", "\\(").replace(")", "\\)").replace("[", "\\[").replace("]", "\\]").replace(".", "\\.");
        ;
        const session5 = this.driver.session();
        const query5 =
            `SELECT DISTINCT 'affiliation' AS type, nationality AS value, nationality AS label
             FROM People p
             WHERE ARRAY [p.full_text_name_content, p.full_text_search_content] &@~
                   ('${value}', ARRAY [5, 1], ARRAY [NULL, 'scorer_tf_at_most($index, 0.5)'],
                    'pgroonga_memos_index')::pgroonga_full_text_search_condition_with_scorers
            `

        session5.run(query5).then((results) => {
            const resultIndex5 = results.records.map((record) => record.get('List'));
            const addAll5 = [{value: "All"}];
            const natIndexPrep = addAll5.concat(resultIndex5);
            const natIndex = natIndexPrep.map(i => ({label: i.value, value: i.value, type: "nationality"}));
            this.setState({natIndex});
            return (this.state.natIndex)
            session5.close()
        });
    } else {
        return null
    }
    return (this.state.natIndex)
};

//QUERY TO FETCH LISTS FOR MAP SELECTS
export function fetchMapIndexes() {

    //GET CATEGORY AND SUBCATEGORY LISTS
    const session = this.driver.session();
    const query = `SELECT institution_category                        AS category,
                          ARRAY_AGG(DISTINCT institution_subcategory) AS subcategory
                   FROM institutions
                   WHERE institution_category != 'General Area'
                     AND institution_category IS NOT NULL
                     AND institution_subcategory != 'null'
                   GROUP BY institution_category;`
    session.run(query).then((results) => {
        const resultIndex = results.records.map((record) => record.get('List'));
        const addAll = [{category: "All", subcategory: ["All"]}];
        const test = addAll.concat(resultIndex);
        const instCatsIndex = test.map((i) => [i.category, i.subcategory]);
        this.setState({instCatsIndex});
        session.close()
    });

    //GET RELIGIOUS FAMILY LIST
    const session3 = this.driver.session();
    const query3 = `SELECT DISTINCT religious_family AS value
                    FROM corporateentities
                             JOIN institutions_partof_corporateentities
                                  ON corporateentities.id = institutions_partof_corporateentities.entity_to_id
                    WHERE religious_family IS NOT NULL;`

    session3.run(query3).then((results) => {
        const resultIndex3 = results.records.map((record) => record.get('List'));
        const addAll3 = [{value: "All"}];
        const relFamIndexPrep = addAll3.concat(resultIndex3);
        const relFamIndex = relFamIndexPrep.map(i => ({value: i.value, type: "religious_family"}));
        this.setState({relFamIndex});
        session3.close()
    });

    //GET CATEGORY AND SUBCATEGORY LISTS
    const session6 = this.driver.session();
    const query6 =
        `SELECT event_category                        AS category,
                ARRAY_AGG(DISTINCT event_subcategory) AS subcategory
         FROM events
                  JOIN events_locatedin ON events.id = events_locatedin.entity_from_id
         WHERE event_category IS NOT NULL

         GROUP BY event_category;`

    session6.run(query6).then((results) => {
        const resultIndex = results.records.map((record) => record.get('List'));
        const addAll = [{category: "All", subcategory: ["All"]}];
        const test = addAll.concat(resultIndex);
        const eventsCatsIndex = test.map((i) => [i.category, i.subcategory]);
        this.setState({eventsCatsIndex});
        session.close()
    });

};

