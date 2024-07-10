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