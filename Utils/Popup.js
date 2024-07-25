/////////////////////////////////////////////////////////////////////////////////////////////////////
// QUERIES FOR POPUP INFORMATION ////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

//QUERY FOR SELECTED NODE + APPEND BREADCRUMB (CLICK IN POPUP CONTENT)
export function selectSwitchAppend(event) {
    this.setState({nodeSelect: event});
    fetchNeo4jId(event, this.driver)
        .then((internalId) => {
            const session = this.driver.session()
            const selectquery = `
                SELECT
                --     n.id AS key,
                LEFT(n.id, 1) AS select_kind,
                --     n.* AS select_node,
                --     p.id AS key2,
                --     p.* AS node2,
                LEFT(p.id, 1) AS rel_kind,
                t.*           AS rel,
                'none'        AS rel_locat
                FROM Relationship t
                         JOIN
                     Nodes n ON t.entity_from_id = n.id OR t.entity_to_id = n.id
                         JOIN
                     Nodes p ON t.entity_from_id = p.id OR t.entity_to_id = p.id
                WHERE n.id = ${internalId}
                ORDER BY t.start_year;
            `;
            //TODO: IS NULL in original query

            session.run(selectquery).then((results) => {
                const selectArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({selectArray});
                this.breadCrumbChainer();
                session.close()
            });

            const session2 = this.driver.session()
            const selectquery2 = `
    MATCH (n)-[t]-(p) WHERE ID(n) =` + internalId + `
    RETURN {start_id:n.id, 
      start_name_western: CASE WHEN n.name_western IS NOT NULL THEN n.name_western ELSE n.given_name_western + ' ' + toUpper(n.family_name_western) END,
      start_name_chinese: CASE WHEN n.chinese_name_hanzi IS NOT NULL THEN n.chinese_name_hanzi ELSE n.chinese_family_name_hanzi + '' + n.chinese_given_name_hanzi END,
      start_type: labels(n)[0], 
      end_id:p.id,
      end_name_western: CASE WHEN p.name_western IS NOT NULL THEN p.name_western ELSE p.given_name_western + ' ' + toUpper(p.family_name_western) END, 
      end_name_chinese: CASE WHEN p.chinese_name_hanzi IS NOT NULL THEN p.chinese_name_hanzi ELSE p.chinese_family_name_hanzi + '' + p.chinese_given_name_hanzi END, 
      end_type: CASE WHEN size(labels(p)) = 1 THEN labels(p)[0] ELSE "Geography" END,  // Check the number of labels for p
      rel_kind: type(t), rel_type: t.rel_type, start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
      end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
      sources: COALESCE(t.source ,"")+ CASE WHEN p.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(p.source ,""), 
    notes: COALESCE(t.notes ,"") + CASE WHEN p.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(p.notes ,"")
    } as SelectNodes `
            session2.run(selectquery2).then((results) => {
                const printArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({printArray});
                session2.close()
            });

            const session3 = this.driver.session()
            const selectquery3 = `MATCH (n) WHERE ID(n) =` + internalId + ` RETURN n{.*} as SelectNodes `
            session3.run(selectquery3).then((results) => {
                const basicArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({basicArray});
                session3.close()
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
};

//QUERY FOR SELECTED NODE + REDUCE BREADCRUMB (CLICK IN POPUP CONTENT)
export function selectSwitchReduce(event, order) {
    this.setState({nodeSelect: event});
    fetchNeo4jId(event, this.driver)
        .then((internalId) => {
            const session = this.driver.session()
            const selectquery = `
        MATCH (n)-[t]-(p:Person)
        WHERE ID(n) = ${internalId}
        RETURN {
            key: n.id, 
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: labels(p)[0],
            rel: properties(t),
            rel_locat: "none"
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year

        UNION

        MATCH (n)-[t]-(p:Publication)
        WHERE ID(n) = ${internalId}
        RETURN {
            key: n.id,
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: labels(p)[0],
            rel: properties(t),
            rel_locat: "none"
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year

        UNION

        MATCH (n)-[t]-(p:CorporateEntity)
        WHERE ID(n) = ${internalId}
        RETURN {
            key: n.id,
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: labels(p)[0],
            rel: properties(t),
            rel_locat: "none"
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year

        UNION

        MATCH (n)-[t]-(p:Event)
        WHERE ID(n) = ${internalId}
        RETURN {
            key: n.id,
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: labels(p)[0],
            rel: properties(t),
            rel_locat: "none"
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year

        UNION

        MATCH (n)-[t]-(p:Institution)
        WHERE ID(n) = ${internalId}
        RETURN {
            key: n.id,
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: labels(p)[0],
            rel: properties(t),
            rel_locat: "none"
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year

        UNION

        MATCH (n)-[t]-(p:Geography)
        WHERE ID(n) = ${internalId}

        RETURN {
            key: n.id,
            select_kind: labels(n)[0],
            select_node: properties(n),
            key2: p.id,
            node2: properties(p),
            rel_kind: "Geography",
            rel: properties(t),
            rel_locat: t.notes
        } AS SelectNodes
        ORDER BY SelectNodes.rel.start_year IS NULL
        `;
            //TODO: code repetition
            session.run(selectquery).then((results) => {
                const selectArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({selectArray});
                this.breadCrumbReducer(event, order);
                session.close()
            });

            const session2 = this.driver.session()
            const selectquery2 = `
        MATCH (n)-[t]-(p) WHERE ID(n) = ${internalId}
        RETURN {
          start_id:n.id, 
          start_name_western: CASE WHEN n.name_western IS NOT NULL THEN n.name_western ELSE n.given_name_western + ' ' + toUpper(n.family_name_western) END,
          start_name_chinese: CASE WHEN n.chinese_name_hanzi IS NOT NULL THEN n.chinese_name_hanzi ELSE n.chinese_family_name_hanzi + '' + n.chinese_given_name_hanzi END,
          start_type: labels(n)[0], 
          end_id:p.id,
          end_name_western: CASE WHEN p.name_western IS NOT NULL THEN p.name_western ELSE p.given_name_western + ' ' + toUpper(p.family_name_western) END, 
          end_name_chinese: CASE WHEN p.chinese_name_hanzi IS NOT NULL THEN p.chinese_name_hanzi ELSE p.chinese_family_name_hanzi + '' + p.chinese_given_name_hanzi END, 
          end_type: CASE WHEN size(labels(p)) = 1 THEN labels(p)[0] ELSE "Geography" END,  // Check the number of labels for p
          rel_kind: type(t), 
          rel_type: t.rel_type, 
          start_year: CASE WHEN toInteger(t.start_year) > 0 THEN toInteger(t.start_year) ELSE "" END, 
          end_year: CASE WHEN toInteger(t.end_year) > 0 THEN toInteger(t.end_year) ELSE "" END, 
          sources: COALESCE(t.source ,"")+ CASE WHEN p.source IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(p.source ,""), 
          notes: COALESCE(t.notes ,"") + CASE WHEN p.notes IS NOT NULL THEN ' / ' ELSE '' END + COALESCE(p.notes ,"")
        } as SelectNodes `
            session2.run(selectquery2).then((results) => {
                const printArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({printArray});
                session2.close()
            });

            const session3 = this.driver.session()
            const selectquery3 = `MATCH (n) WHERE ID(n) =` + internalId + ` RETURN n{.*} as SelectNodes `
            session3.run(selectquery3).then((results) => {
                const basicArray = results.records.map((record) => record.get('SelectNodes'));
                this.setState({basicArray});
                session3.close()
            });
        })
        .catch((error) => {
            console.error("Error:", error);
        });
};

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
};
