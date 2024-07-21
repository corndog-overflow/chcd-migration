/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR DATAVIEW /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
export function fetchDBWide() {
    this.setState({ content: "loading" })
    this.setState({ nodeArray: [] })
    this.setState({ node_id: "" })
    this.setState({ selectedOption: "All" });
    this.setState({ nationality: "" });
    this.setState({ nationalityNull: "" });
    this.setState({ totalPeople: "" });
    this.setState({ totalPublications: "" });
    this.setState({ totalRelationships: "" });
    this.setState({ totalInstitutions: "" });
    this.setState({ instTypeList: "" });
    this.setState({ instDateList: "" });
    this.setState({ totalEvents: "" });
    this.setState({ provinces: "" });
    this.setState({ prefectures: "" });
    this.setState({ counties: "" });
    this.setState({ instDateList: "" });
    this.setState({ genderList: "" });
    this.setState({ genders: "" });
    this.setState({ religiousFamily: "" });
    this.setState({ christianTradition: "" });
    this.setState({ inputValue: ' ' });
    this.setState({ append: this.state.append + 1 })

    //QUERY TO FETCH TOTAL PEOPLE
    const session = this.driver.session();
    const query = 'SELECT COUNT(1) FROM people;'
    session.run(query).then((results) => {
        const totalPeople = results.records.map((record) => record.get('Count'));
        this.setState({ totalPeople })
        session.close()
    })

    //QUERY TO FETCH TOTAL INSTITUTIONS
    const session2 = this.driver.session();
    const query2 = 'SELECT COUNT(1) FROM institutions;'
    session2.run(query2).then((results) => {
        const totalInstitutions = results.records.map((record) => record.get('Count'));
        this.setState({ totalInstitutions })
        session2.close()
    })

    //Total Relationships
    const session3 = this.driver.session();
    const query3 = 'SELECT COUNT(1) FROM relationship;'
    session3.run(query3).then((results) => {
        const totalRelationships = results.records.map((record) => record.get('Count'));
        this.setState({ totalRelationships })
        session3.close()
    })

    //QUERY TO FETCH TOTAL EVENTS
    const session4 = this.driver.session();
    const query4 = 'SELECT COUNT(1) FROM events;'
    session4.run(query4).then((results) => {
        const totalEvents = results.records.map((record) => record.get('Count'));
        this.setState({ totalEvents })
        session4.close()
    })

    //QUERY TO FETCH TOTAL PUBLICATIONS
    const session4a = this.driver.session();
    const query4a = 'SELECT COUNT(1) FROM publications;'
    session4a.run(query4a).then((results) => {
        const totalPublications = results.records.map((record) => record.get('Count'));
        this.setState({ totalPublications })
        session4a.close()
    })

    //TOTAL NODE COUNT
    const session5 = this.driver.session();
    const query5 = `SELECT(
        (SELECT COUNT(*) FROM people) +
        (SELECT COUNT(*) FROM institutions) +
        (SELECT COUNT(*) FROM events) +
        (SELECT COUNT(*) FROM publications) +
        (SELECT COUNT(*) FROM corporateentities) +
        (SELECT COUNT(*) FROM generalareas) +
        (SELECT COUNT(*) FROM geographynode)
        ) AS totalNodes;`
    session5.run(query5).then((results) => {
        const totalNodes = results.records.map((record) => record.get('Count'));
        this.setState({ totalNodes })
        session5.close()
    })

    //TOTAL CORP ENT
    const session6 = this.driver.session();
    const query6 = 'SELECT COUNT(1) FROM corporateentities'
    session6.run(query6).then((results) => {
        const totalCorporateEntities = results.records.map((record) => record.get('Count'));
        this.setState({ totalCorporateEntities })
        session6.close()
    })

    //TOTAL GENDER COUNTS
    const session7 = this.driver.session();
    const query7 = `SELECT gender, COUNT(*) AS count FROM people GROUP BY gender;`
    session7.run(query7).then((results) => {
        const genderArray = results.records.map((record) => record.get('List', 'gender'));
        let genders = [];
        for (let i = 0; i < genderArray.length; i++) {
            this.renameProperty(genderArray[i], 'gender', 'key')
            this.renameProperty(genderArray[i], 'count', 'value')
            { genders.push(genderArray[i]) }
        }
        this.setState({ genders })
        session7.close()
    })

    //QUERY TO GET ACTIVITY FOR PROVINCES.
    const session8 = this.driver.session();
    const query8 = `SELECT (SELECT name_zh FROM geographynode WHERE id = geo.province_id) AS province_name,
                            COUNT(DISTINCT peo.id)                                                  AS activity_count
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
                              JOIN geographynode geo ON geo.id = loc.entity_to_id
                     WHERE geo.province_id IS NOT NULL
                     GROUP BY geo.province_id
                     ORDER BY activity_count DESC
                     LIMIT 10;`

    session8.run(query8).then((results) => {
        const provinces = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ provinces })
        session8.close()
    })

    //QUERY TO GET ACTIVITY FOR PREFECTURES.
    const session9 = this.driver.session();
    const query9 = `SELECT (SELECT name_zh FROM geographynode WHERE id = geo.prefecture_id) AS province_name,
                            COUNT(DISTINCT peo.id)                                                    AS activity_count
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
                              JOIN geographynode geo ON geo.id = loc.entity_to_id
                     WHERE geo.prefecture_id IS NOT NULL
                     GROUP BY geo.prefecture_id
                     ORDER BY activity_count DESC
                     LIMIT 10;`

    session9.run(query9).then((results) => {
        const prefectures = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ prefectures })
        session9.close()
    })

    //QUERY TO GET ACTIVITY FOR COUNTIES.
    const session10 = this.driver.session();
    const query10 = `SELECT (SELECT name_zh FROM geographynode WHERE id = geo.county_id) AS province_name,
                            COUNT(DISTINCT peo.id)                                       AS activity_count
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
                              JOIN geographynode geo ON geo.id = loc.entity_to_id
                     WHERE geo.county_id IS NOT NULL
                     GROUP BY geo.county_id
                     ORDER BY activity_count DESC
                     LIMIT 10;`

    session10.run(query10).then((results) => {
        const counties = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ counties })
        session10.close()
    })

    //Query to get Nationality of all people
    const session11 = this.driver.session();
    const query11 = `SELECT nationality, COUNT(1) AS count
        FROM people
        WHERE nationality IS NOT NULL AND nationality <> 'Unknown'
        GROUP BY nationality
        ORDER BY count DESC;
        `
    session11.run(query11).then((results) => {
        const nationalityList = results.records.map((record) => record.get('List', 'info'));
        const nationality = nationalityList.filter(d => d.count >= 50)
        this.setState({ nationality })
        session11.close()
    })

    //Query to get Nationality of all people
    const session12 = this.driver.session();
    const query12 = `SELECT COUNT(1) AS count
        FROM people
        WHERE nationality IS NULL OR nationality = 'Unknown';
        `
    session12.run(query12).then((results) => {
        const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
        this.setState({ nationalityNull })
        session12.close()
    })

    //QUERY TO GET CHRISTIAN TRADITIONS OF ALL NODES
    const session13 = this.driver.session();
    // MATCH (n) WHERE labels(n)[0] = "CorporateEntity" OR labels(n)[0] = "Institution" OR labels(n)[0]="Event"
    const query13 = `
    SELECT christian_tradition, COUNT(1) AS count
    FROM (SELECT christian_tradition FROM corporateentities
          UNION ALL SELECT christian_tradition FROM institutions
          UNION ALL SELECT christian_tradition FROM events) AS nodes
    WHERE christian_tradition IS NOT NULL
    GROUP BY christian_tradition;
    `
    session13.run(query13).then((results) => {
        const christianTraditionList = results.records.map((record) => record.get('List', 'christian_tradition'));
        let christianTradition = [];
        for (let i = 0; i < christianTraditionList.length; i++) {
            this.renameProperty(christianTraditionList[i], 'christian_tradition', 'key')
            this.renameProperty(christianTraditionList[i], 'count', 'value')
            { christianTradition.push(christianTraditionList[i]) }
        }
        this.setState({ christianTradition })
        session13.close()
    })

    //QUERY TO GET RELIGIOUS FAMILIES OF ALL NODES
    const session14 = this.driver.session();
    const query14 = `
    SELECT religious_family, COUNT(1) AS count
    FROM (SELECT religious_family FROM corporateentities
          UNION ALL SELECT religious_family FROM institutions
          UNION ALL SELECT religious_family FROM events) AS nodes
    WHERE religious_family IS NOT NULL
    GROUP BY religious_family;
    `
    session14.run(query14).then((results) => {
        const religiousFamilyList = results.records.map((record) => record.get('List', 'religious_family'));
        const religiousFamilyClean = religiousFamilyList.filter(d => d.count >= 10)
        let religiousFamily = [];
        for (let i = 0; i < religiousFamilyClean.length; i++) {
            this.renameProperty(religiousFamilyClean[i], 'religious_family', 'key')
            this.renameProperty(religiousFamilyClean[i], 'count', 'value')
            { religiousFamily.push(religiousFamilyClean[i]) }
        }
        this.setState({ religiousFamily })
        session14.close()
    })

    //QUERY TO GET CHRISTIAN TRADITIONS OF NULL VALUE
    const session15 = this.driver.session();
    const query15 = `
    SELECT COUNT(1) AS count
    FROM (SELECT christian_tradition FROM corporateentities
          UNION ALL SELECT christian_tradition FROM institutions
          UNION ALL SELECT christian_tradition FROM events) AS nodes
    WHERE christian_tradition IS NULL;
    `
    session15.run(query15).then((results) => {
        const religiousFamilyNullValues = results.records.map((record) => record.get('Count', 'religious_family'));
        this.setState({ religiousFamilyNullValues })
        session.close()
    })

    //QUERY TO GET CHRISTIAN TRADITIONS OF NULL VALUE
    const session16 = this.driver.session();
    const query16 = `
    SELECT COUNT(1) AS count
    FROM (SELECT religious_family FROM corporateentities
          UNION ALL SELECT religious_family FROM institutions
          UNION ALL SELECT religious_family FROM events) AS nodes
    WHERE religious_family IS NULL;
    `
    session16.run(query16).then((results) => {
        const christianTraditionNullValues = results.records.map((record) => record.get('Count', 'christian_tradition'));
        this.setState({ christianTraditionNullValues })
        session16.close()
    })

    this.setState({ content: "loaded" })
}

// GET CORP ENT DATA FOR DATA DASHBOARD SELECT
export function fetchCorpOptions() {
    const session = this.driver.session();
    const query = `SELECT DISTINCT
    ce.id AS value,
    ce.name_western AS label,
    ce.chinese_name_hanzi AS label_alt,
    'CorporateEntity' AS type
    FROM corporateentities ce
    JOIN people_partof_corporateentities cep ON ce.id = cep.entity_to_id
    JOIN people p ON cep.entity_from_id = p.id
    WHERE ce.corporate_entity_category = 'Religious Body';
    `
    session.run(query).then((results) => {
        const corpOptions = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ corpOptions })
        session.close()
    })
};

// GET INST DATA FOR DATA DASHBOARD SELECT
export function fetchInstOptions() {
    const session = this.driver.session();
    const query = `SELECT DISTINCT
    ce.id AS value,
    ce.name_western AS label,
    ce.chinese_name_hanzi AS label_alt,
    'Institution' AS type
    FROM institutions ce
    JOIN people_presentat_institutions cep ON ce.id = cep.entity_to_id
    JOIN people p ON cep.entity_from_id = p.id
    WHERE ce.institution_subcategory <> 'General Work';
    `
    session.run(query).then((results) => {
        const corpOptions = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ corpOptions })
        session.close()
    })
}

// GET GEO DATA FOR DATA DASHBOARD SELECT
export function fetchGeoOptions() {
    const session = this.driver.session();
    const query = `SELECT DISTINCT g.id       AS value,
                                   g.name_wes AS label,
                                   g.name_zh  AS label_alt
                   FROM geographynode g
                   WHERE g.id in
                         (SELECT entity_to_id
                          FROM events e
                                   JOIN events_locatedin l ON e.id = l.entity_from_id
                          UNION ALL
                          SELECT entity_to_id
                          FROM institutions i
                                   JOIN institutions_locatedin l ON i.id = l.entity_from_id);
    `
    session.run(query).then((results) => {
        const corpOptions = results.records.map((record) => record.get('List', 'Activity'));
        this.setState({ corpOptions })
        session.close()
    })
}

//QUERY TO GET DATA FOR INST DATA VIEWS
export function fetchInstitutionsData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({ nosend: "nosend" })
    }
    else {
        this.setState({ content: "loading" })
        let selectedOption = "Institution"
        this.setState({ selectedOption });
        this.setState({ nationality: "" });
        this.setState({ nationalityNull: "" });
        this.setState({ totalPeople: "" });
        this.setState({ totalRelationships: "" });
        this.setState({ totalInstitutions: "" });
        this.setState({ totalEvents: "" });
        this.setState({ provinces: "" });
        this.setState({ instDateList: "" });
        this.setState({ genderList: "" });
        this.setState({ genders: "" });
        this.setState({ religiousFamily: "" });
        this.setState({ christianTradition: "" });
        this.setState({ inputValue: ' ' });
        this.setState({ append: this.state.append + 1 })

        //SET CENTRAL NODE
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = '' + parseFloat(internalId) + ' '
                } else { nodeIdFilter = "" };

                //FETCH COUNTS
                const session = this.driver.session();
                const query = `
      MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
      WITH n
      CALL {
        WITH n
        MATCH (n)--(p:Person)
        RETURN count(DISTINCT p) as person
      }
      CALL {
        WITH n
        MATCH (n)--(p:Event)
        RETURN count(DISTINCT p) as eventcount
      }
      CALL apoc.cypher.run('MATCH (t:CorporateEntity)-[]-(p) wHERE id(p)=`+ nodeIdFilter + ` WITH DISTINCT t RETURN count(*) as count',{}) YIELD value as corp
      RETURN n as node, person as count, eventcount, corp.count as corpcount`
                session
                    .run(query)
                    .then((results) => {
                        const newArray = results.records.map((record) => record.get('node'));
                        const nodeArray = newArray[0];
                        const totalPeople = results.records.map((record) => record.get('count'));
                        const totalInstitutions = 1
                        const totalCorporateEntities = results.records.map((record) => record.get('corpcount'));
                        const totalEvents = results.records.map((record) => record.get('eventcount'));
                        if (nodeArray.length === 0) { this.setState({ noresults: "noresults" }) }
                        else {
                            this.setState({ nodeArray });
                            this.setState({ totalPeople })
                            this.setState({ totalInstitutions })
                            this.setState({ totalCorporateEntities })
                            this.setState({ totalEvents })
                            this.setState({ noresults: "noresults hide" })
                            this.setState({ content: "loaded" })
                        }
                        session.close()
                    });
                //FETCH (AND CLEAN) GENDER COUNTS
                const session2 = this.driver.session();
                const query2 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      CALL {
          WITH n
          MATCH (n)--(p:Person)
          RETURN DISTINCT p
      }
      WITH p.gender AS gender, count(*) AS count
      RETURN DISTINCT {gender: gender, count: count} AS List`
                session2.run(query2).then((results) => {
                    const genderArray = results.records.map((record) => record.get('List', 'gender'));
                    let genders = [];
                    for (let i = 0; i < genderArray.length; i++) {
                        this.renameProperty(genderArray[i], 'gender', 'key')
                        this.renameProperty(genderArray[i], 'count', 'value')
                        { genders.push(genderArray[i]) }
                    }
                    this.setState({ genders });
                    session2.close()
                })

                // FETCH GENDER ACTIVITY
                const session2b = this.driver.session();
                const query2b = `
    MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)-[t]-(p:Person) WHERE p.gender IS NOT NULL AND t.start_year IS NOT NULL
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
                session2b.run(query2b).then((results) => {
                    const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
                    const genderList = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
                    this.setState({ genderList })
                    session2b.close()
                })

                //FETCH NATIONALITY
                const session3 = this.driver.session();
                const query3 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(p:Person) WHERE p.nationality <> "Unknown"
      RETURN DISTINCT p
    }
    WITH p.nationality AS nationality, count(*) AS count
    RETURN DISTINCT {info: nationality, count: count} AS List ORDER BY List.count`
                session3.run(query3).then((results) => {
                    const nationalityList = results.records.map((record) => record.get('List', 'info'));
                    const nationality = nationalityList.filter(d => d.count >= 1)
                    this.setState({ nationality })
                    session3.close()
                })

                //FETCH NATIONALITY (NULL)
                const session4 = this.driver.session();
                const query4 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
        WITH n
        MATCH (n)--(p:Person) WHERE p.nationality IS NULL OR p.nationality = "Unknown"
        RETURN DISTINCT p
    }
    RETURN count(p) as Count`
                session4.run(query4).then((results) => {
                    const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
                    this.setState({ nationalityNull })
                    session4.close()
                })

                //FETCH PEOPLE PRESENT BY YEAR
                const session8 = this.driver.session();
                const query8 = `
    MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)-[t]-(q:Person) WHERE t.start_year IS NOT NULL
      WITH DISTINCT q, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN q.id as name, range(toInteger(min), toInteger(max)) as years
      }
    WITH name, apoc.coll.flatten(collect(years)) as year_list
    UNWIND year_list as all_years
    RETURN {info: toInteger(all_years), count: toInteger(count(distinct name))} as List  ORDER BY List.info`
                session8.run(query8).then((results) => {
                    const instList = results.records.map((record) => record.get('List', 'info'));
                    const instDateList = instList.filter(d => (d.count >= 1 && d.info >= 1550 && d.info <= 1950))
                    this.setState({ instDateList })
                    session8.close()
                })

                //FETCH CHRISTIAN_TRADITION
                const session9 = this.driver.session();
                const query9 = `
    MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)--(n:Person)--(t:CorporateEntity) WHERE EXISTS(t.christian_tradition)
      WITH DISTINCT t.christian_tradition as name, count(DISTINCT n) AS count
      RETURN name, count AS Count
    }
    RETURN DISTINCT {christian_tradition: name, count: Count} AS List
    `
                session9.run(query9).then((results) => {
                    const christianTraditionList = results.records.map((record) => record.get('List', 'christian_tradition'));
                    let christianTradition = [];
                    for (let i = 0; i < christianTraditionList.length; i++) {
                        this.renameProperty(christianTraditionList[i], 'christian_tradition', 'key')
                        this.renameProperty(christianTraditionList[i], 'count', 'value')
                        { christianTradition.push(christianTraditionList[i]) }
                    }
                    this.setState({ christianTradition })
                    session9.close()
                })

                //FETCH RELIGIOUS_FAMILY
                const session10 = this.driver.session();
                const query10 = `
    MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)--(n:Person)--(t:CorporateEntity)
      WITH DISTINCT CASE t.religious_family 
      WHEN NULL THEN "Unknown"
      ELSE t.religious_family END AS  name, count(DISTINCT n) AS count
      RETURN name, count AS Count
    }
    RETURN DISTINCT {religious_family: name, count: Count} AS List
    `
                session10.run(query10).then((results) => {
                    const religiousFamilyList = results.records.map((record) => record.get('List', 'religious_family'));
                    const religiousFamilyClean = religiousFamilyList.filter(d => d.count >= 0)
                    let religiousFamily = [];
                    for (let i = 0; i < religiousFamilyClean.length; i++) {
                        this.renameProperty(religiousFamilyClean[i], 'religious_family', 'key')
                        this.renameProperty(religiousFamilyClean[i], 'count', 'value')
                        { religiousFamily.push(religiousFamilyClean[i]) }
                    }
                    this.setState({ religiousFamily })
                    session10.close()
                })

                //FETCH RELIGIOUS_FAMILY NULL
                const session11 = this.driver.session();
                const query11 = `
        MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
        CALL {
          WITH p
          MATCH (p)--(n:Person)--(t:CorporateEntity) WHERE t.religious_family IS NULL
          RETURN count(DISTINCT n) AS count
        }
        RETURN count AS Count
        `
                session11.run(query11).then((results) => {
                    const religiousFamilyNullValues = results.records.map((record) => record.get('Count', 'religious_family'));
                    this.setState({ religiousFamilyNullValues })
                    session11.close()
                })

                //FETCH CHRISTIAN TRADITION NULL
                const session12 = this.driver.session();
                const query12 = `
        MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
        CALL {
          WITH p
          MATCH (p)--(n:Person)--(t:CorporateEntity) WHERE t.christian_tradition IS NULL
          RETURN count(DISTINCT n) AS count
        }
        RETURN count AS Count
      `
                session12.run(query12).then((results) => {
                    const christianTraditionNullValues = results.records.map((record) => record.get('Count', 'christian_tradition'));
                    this.setState({ christianTraditionNullValues })
                    session12.close()
                })
            })
            .catch((error) => {
                console.error("Error:", error);
            });

    };
}
//QUERY TO GET DATA FOR CORPORATE DATA VIEWS
export function fetchCorporateEntitiesData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({ nosend: "nosend" })
    }
    else {
        this.setState({ content: "loading" })
        let selectedOption = "CorporateEntity"
        this.setState({ selectedOption });
        this.setState({ nationality: "" });
        this.setState({ nationalityNull: "" });
        this.setState({ totalPeople: "" });
        this.setState({ totalRelationships: "" });
        this.setState({ totalInstitutions: "" });
        this.setState({ totalEvents: "" });
        this.setState({ prefectures: "" });
        this.setState({ provinces: "" });
        this.setState({ counties: "" });
        this.setState({ instDateList: "" });
        this.setState({ instTypeList: "" });
        this.setState({ genderList: "" });
        this.setState({ genders: "" });
        this.setState({ religiousFamily: "" });
        this.setState({ christianTradition: "" });
        this.setState({ christianTradition: "" });
        this.setState({ inputValue: ' ' });
        this.setState({ append: this.state.append + 1 })

        //SET CENTRAL NODE
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = '' + parseFloat(internalId) + ' '
                } else { nodeIdFilter = "" };

                //FETCH COUNTS
                const session = this.driver.session();
                const query = `
      MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
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
      CALL apoc.cypher.run('MATCH (t:CorporateEntity)-[]-(p) WHERE id(p)=`+ nodeIdFilter + ` WITH DISTINCT t RETURN count(*) as count',{}) YIELD value as corp
      RETURN n as node, person as count, instcount, eventcount, corp.count as corpcount`
                console.log(query)
                session
                    .run(query)
                    .then((results) => {
                        const newArray = results.records.map((record) => record.get('node'));
                        const nodeArray = newArray[0];
                        const totalPeople = results.records.map((record) => record.get('count'));
                        const totalInstitutions = results.records.map((record) => record.get('instcount'));
                        const totalCorporateEntities = results.records.map((record) => record.get('corpcount'));
                        const totalEvents = results.records.map((record) => record.get('eventcount'));
                        if (nodeArray.length === 0) { this.setState({ noresults: "noresults" }) }
                        else {
                            this.setState({ nodeArray });
                            this.setState({ totalPeople });
                            this.setState({ totalInstitutions });
                            this.setState({ totalCorporateEntities });
                            this.setState({ totalEvents });
                            this.setState({ noresults: "noresults hide" })
                            this.setState({ content: "loaded" })
                        }
                        session.close()
                    });

                //FETCH (AND CLEAN) GENDER COUNTS
                const session2 = this.driver.session();
                const query2 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
      CALL {
          WITH n
          MATCH (n)--(p:Person)--(q) 
          OPTIONAL MATCH (n)--(q:Institution)-[t]-(p:Person)
          RETURN DISTINCT p
      }
      WITH p.gender AS gender, count(*) AS count
      RETURN DISTINCT {gender: gender, count: count} AS List`
                console.log(query2)
                session2.run(query2).then((results) => {
                    const genderArray = results.records.map((record) => record.get('List', 'gender'));
                    let genders = [];
                    for (let i = 0; i < genderArray.length; i++) {
                        this.renameProperty(genderArray[i], 'gender', 'key')
                        this.renameProperty(genderArray[i], 'count', 'value')
                        { genders.push(genderArray[i]) }
                    }
                    this.setState({ genders });
                    session2.close()
                })

                // FETCH GENDER ACTIVITY
                const session2b = this.driver.session();
                const query2b = `
    MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)-[t]-(p:Person)--(q) WHERE id(n)=`+ nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL 
      OPTIONAL MATCH (n)--(q:Institution)-[t]-(p:Person) WHERE id(n)=`+ nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL
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
                session2b.run(query2b).then((results) => {
                    const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
                    const genderListInitA = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
                    const genderListFilter1 = genderListInitA.filter((o, i) => !i || o.female >= (genderListInitA[i - 1].female * .25));
                    const genderListFilter2 = genderListFilter1.filter((o, i) => !i || o.female >= (genderListFilter1[i - 1].female * .25));
                    const genderListFilter3 = genderListFilter2.filter((o, i) => !i || o.male >= (genderListFilter2[i - 1].male * .25));
                    const genderList = genderListFilter3.filter((o, i) => !i || o.male >= (genderListFilter3[i - 1].male * .25));
                    this.setState({ genderList })
                    session2b.close()
                })

                //FETCH NATIONALITY
                const session3 = this.driver.session();
                const query3 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(p:Person) WHERE p.nationality <> "Unknown"
      OPTIONAL MATCH (n)--(:Institution)-[t]-(p:Person) WHERE p.nationality <> "Unknown"
      RETURN DISTINCT p
    }
    WITH p.nationality AS nationality, count(*) AS count
    RETURN DISTINCT {info: nationality, count: count} AS List ORDER BY List.count`
                session3.run(query3).then((results) => {
                    const nationalityList = results.records.map((record) => record.get('List', 'info'));
                    const nationality = nationalityList.filter(d => d.count >= 1)
                    this.setState({ nationality })
                    session3.close()
                })

                //FETCH NATIONALITY (NULL)
                const session4 = this.driver.session();
                const query4 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
        WITH n
        MATCH (n)--(p:Person) WHERE p.nationality IS NULL OR p.nationality = "Unknown"
        OPTIONAL MATCH (n)--(:Institution)-[t]-(p:Person) WHERE p.nationality IS NULL OR p.nationality = "Unknown"
        RETURN DISTINCT p
    }
    RETURN count(p) as Count`
                session4.run(query4).then((results) => {
                    const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
                    this.setState({ nationalityNull })
                    session4.close()
                })

                // FETCH COUNTY ACTIVITY
                const session5 = this.driver.session();
                const query5 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=`+ nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
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

                session5.run(query5).then((results) => {
                    const counties1 = results.records.map((record) => record.get('List', 'Activity'));
                    const counties = counties1.filter(d => (d.County.en !== null))
                    this.setState({ counties })
                    session5.close()
                })

                // FETCH PREFECTURE ACTIVITY
                const session6 = this.driver.session();
                const query6 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=`+ nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
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

                session6.run(query6).then((results) => {
                    const prefectures1 = results.records.map((record) => record.get('List', 'Activity'));
                    const prefectures = prefectures1.filter(d => (d.Prefecture.en !== null))
                    this.setState({ prefectures })
                    session6.close()
                })

                // FETCH PROVINCE ACTIVITY
                const session7 = this.driver.session();
                const query7 = `MATCH (e)--(p:Person)--(i:Institution)--(o) 
    WHERE id(e)=`+ nodeIdFilter + ` AND (o:Village OR o:Township OR o:County OR o:Prefecture OR o:Province)
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

                session7.run(query7).then((results) => {
                    const provinces1 = results.records.map((record) => record.get('List', 'Activity'));
                    const provinces = provinces1.filter(d => (d.Province.en !== null))
                    this.setState({ provinces })
                    session7.close()
                })

                //FETCH INSTITUTIONS BY YEAR
                const session8 = this.driver.session();
                const query8 = `
    MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
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
                session8.run(query8).then((results) => {
                    const instList = results.records.map((record) => record.get('List', 'info'));
                    const filteredInstList = instList.filter(d => (d.count > 0 && d.info >= 1550 && d.info <= 1950))
                    const instDateList1 = filteredInstList.filter((o, i) => !i || o.count > (filteredInstList[i - 1].count * .25));
                    const instDateList2 = instDateList1.filter((o, i) => !i || o.count > (instDateList1[i - 1].count * .25));
                    const instDateList3 = instDateList2.filter((o, i) => !i || o.count > (instDateList2[i - 1].count * .25));
                    const instDateList = instDateList3.filter((o, i) => !i || o.count > (instDateList3[i - 1].count * .25));
                    this.setState({ instDateList })
                    session8.close()
                })

                //FETCH INSTITUTIONS TYPES
                const session9 = this.driver.session();
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
                session9.run(query9).then((results) => {
                    const instArray = results.records.map((record) => record.get('List', 'type'));
                    let instTypeList = [];
                    for (let i = 0; i < instArray.length; i++) {
                        this.renameProperty(instArray[i], 'type', 'key')
                        this.renameProperty(instArray[i], 'count', 'value')
                        { instTypeList.push(instArray[i]) }
                    }
                    this.setState({ instTypeList });
                    session9.close()
                })
            })
            .catch((error) => {
                console.error("Error:", error);
            });

    }
};

//QUERY TO GET DATA FOR GEO DATA VIEWS
export function fetchGeographyData() {
    if (this.state.node_id === "" && this.state.nodeSelect === "") {
        this.setState({ nosend: "nosend" })
    }
    else {
        let selectedOption = "Geography"
        this.setState({ content: "loading" })
        this.setState({ selectedOption });
        this.setState({ nationality: "" });
        this.setState({ nationalityNull: "" });
        this.setState({ totalPeople: "" });
        this.setState({ totalRelationships: "" });
        this.setState({ totalInstitutions: "" });
        this.setState({ instTypeList: "" });
        this.setState({ instDateList: "" });
        this.setState({ totalEvents: "" });
        this.setState({ provinces: "" });
        this.setState({ prefectures: "" });
        this.setState({ counties: "" });
        this.setState({ instDateList: "" });
        this.setState({ genderList: "" });
        this.setState({ genders: "" });
        this.setState({ religiousFamily: "" });
        this.setState({ christianTradition: "" });
        this.setState({ inputValue: ' ' })
        this.setState({ append: this.state.append + 1 })


        //SET CENTRAL NODE
        let nodeIdFilter;
        fetchNeo4jId(this.state.node_id, this.driver)
            .then((internalId) => {
                if (this.state.node_id !== "") {
                    nodeIdFilter = '' + parseFloat(internalId) + ' '
                } else { nodeIdFilter = "" };

                //FETCH COUNTS
                const session = this.driver.session();
                const query = `
      MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
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
                session
                    .run(query)
                    .then((results) => {
                        const newArray = results.records.map((record) => record.get('node'));
                        const nodeArray = newArray[0];
                        const totalPeople = results.records.map((record) => record.get('count'));
                        const totalInstitutions = results.records.map((record) => record.get('instcount'));
                        const totalCorporateEntities = results.records.map((record) => record.get('corpcount'));
                        const totalEvents = results.records.map((record) => record.get('eventcount'));
                        if (nodeArray.length === 0) { this.setState({ noresults: "noresults" }) }
                        else {
                            this.setState({ nodeArray });
                            this.setState({ totalPeople });
                            this.setState({ totalInstitutions });
                            this.setState({ totalCorporateEntities });
                            this.setState({ totalEvents });
                            this.setState({ noresults: "noresults hide" })
                            this.setState({ content: "loaded" })
                        }
                        session.close()
                    });

                //FETCH (AND CLEAN) GENDER COUNTS
                const session2 = this.driver.session();
                const query2 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution
      RETURN DISTINCT p
    }
    WITH p.gender AS gender, count(*) AS count
    RETURN DISTINCT {gender: gender, count: count} AS List`
                session2.run(query2).then((results) => {
                    const genderArray = results.records.map((record) => record.get('List', 'gender'));
                    let genders = [];
                    for (let i = 0; i < genderArray.length; i++) {
                        this.renameProperty(genderArray[i], 'gender', 'key')
                        this.renameProperty(genderArray[i], 'count', 'value')
                        { genders.push(genderArray[i]) }
                    }
                    this.setState({ genders })
                    session2.close()
                })

                // FETCH GENDER ACTIVITY
                const session2b = this.driver.session();
                const query2b = `
    MATCH (n) WHERE id(n)=`+ nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(q)-[t]-(p:Person) WHERE q:Event or q:Institution AND id(n)=`+ nodeIdFilter + ` AND p.gender IS NOT NULL AND t.start_year IS NOT NULL
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
                session2b.run(query2b).then((results) => {
                    const genderListInit = results.records.map((record) => record.get('List', 'Activity'));
                    const genderListInitA = genderListInit.filter(d => (d.info >= 1550 && d.info <= 1950))
                    const genderListFilter1 = genderListInitA.filter((o, i) => !i || o.female >= (genderListInitA[i - 1].female * .25));
                    const genderListFilter2 = genderListFilter1.filter((o, i) => !i || o.female >= (genderListFilter1[i - 1].female * .25));
                    const genderListFilter3 = genderListFilter2.filter((o, i) => !i || o.male >= (genderListFilter2[i - 1].male * .25));
                    const genderList = genderListFilter3.filter((o, i) => !i || o.male >= (genderListFilter3[i - 1].male * .25));
                    this.setState({ genderList })
                    session2b.close()
                })

                //FETCH NATIONALITY
                const session3 = this.driver.session();
                const query3 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
      WITH n
      MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution AND p.nationality <> "Unknown"
      RETURN DISTINCT p
    }
    WITH p.nationality AS nationality, count(*) AS count
    RETURN DISTINCT {info: nationality, count: count} AS List ORDER BY List.count`
                session3.run(query3).then((results) => {
                    const nationalityList = results.records.map((record) => record.get('List', 'info'));
                    const nationality = nationalityList.filter(d => d.count >= 1)
                    this.setState({ nationality })
                    session3.close()
                })

                //FETCH NATIONALITY (NULL)
                const session4 = this.driver.session();
                const query4 = `MATCH (n) WHERE id(n)=` + nodeIdFilter + `
    CALL {
        WITH n
        MATCH (n)--(t)--(p:Person) WHERE t:Event or t:Institution AND p.nationality IS NULL OR p.nationality = "Unknown"
        RETURN DISTINCT p
    }
    RETURN count(p) as Count`
                session4.run(query4).then((results) => {
                    const nationalityNull = results.records.map((record) => record.get('Count', 'info'));
                    this.setState({ nationalityNull })
                    session4.close()
                })

                // FETCH GEO-INSTITUTITONAL ACTIVITY
                const session7 = this.driver.session();
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
                session7.run(query7).then((results) => {
                    const provinces = results.records.map((record) => record.get('List', 'count'));
                    this.setState({ provinces })
                    session7.close()
                })

                // FETCH GEO-PERSON ACTIVITY
                const session6 = this.driver.session();
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
                session6.run(query6).then((results) => {
                    const counties = results.records.map((record) => record.get('List', 'count'));
                    this.setState({ counties })
                    session6.close()
                })

                //FETCH INSTITUTIONS BY YEAR
                const session8 = this.driver.session();
                const query8 = `
    MATCH (p) WHERE id(p)=`+ nodeIdFilter + `
    CALL {
      WITH p
      MATCH (p)--(i:Institution)-[t]-(q:Person) WHERE t.start_year IS NOT NULL
      WITH DISTINCT i, t.start_year as min, CASE WHEN t.end_year IS NOT NULL THEN t.end_year ELSE t.start_year END as max
      RETURN i.name_western as name, range(toInteger(min), toInteger(max)) as years
      }
    WITH name, apoc.coll.flatten(collect(years)) as year_list
    UNWIND year_list as all_years
    RETURN {info: toInteger(all_years), count: toInteger(count(name))} as List  ORDER BY List.info`
                session8.run(query8).then((results) => {
                    const instList = results.records.map((record) => record.get('List', 'info'));
                    const filteredInstList = instList.filter(d => (d.count > 0 && d.info >= 1550 && d.info <= 1950))
                    const instDateList1 = filteredInstList.filter((o, i) => !i || o.count > (filteredInstList[i - 1].count * .25));
                    const instDateList2 = instDateList1.filter((o, i) => !i || o.count > (instDateList1[i - 1].count * .25));
                    const instDateList3 = instDateList2.filter((o, i) => !i || o.count > (instDateList2[i - 1].count * .25));
                    const instDateList = instDateList3.filter((o, i) => !i || o.count > (instDateList3[i - 1].count * .25));
                    this.setState({ instDateList })
                    session8.close()
                })

                //FETCH INSTITUTIONS TYPES
                const session9 = this.driver.session();
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
                session9.run(query9).then((results) => {
                    const instArray = results.records.map((record) => record.get('List', 'type'));
                    let instTypeList = [];
                    for (let i = 0; i < instArray.length; i++) {
                        this.renameProperty(instArray[i], 'type', 'key')
                        this.renameProperty(instArray[i], 'count', 'value')
                        { instTypeList.push(instArray[i]) }
                    }
                    this.setState({ instTypeList });
                    session9.close()
                })
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }
};

