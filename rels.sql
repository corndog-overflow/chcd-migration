INSERT INTO CorporateEntities_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'CorporateEntity'
WHERE r.rel_type = 'PartOf';

INSERT INTO People_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';


INSERT INTO Institutions_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO Events_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO People_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO CorporateEntities_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO People_PresentAt_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Event'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_PresentAt_Institutions (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Institution'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_PresentAt_GeneralAreas (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'GeneralArea'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_RelatedTo_People (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Person'
WHERE r.type = 'RELATED_TO';

INSERT INTO Institutions_LinkedTo_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Event'
WHERE r.type = 'LINKED_TO';

INSERT INTO Events_LinkedTo_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Event'
WHERE r.type = 'LINKED_TO';

INSERT INTO Institutions_LinkedTo_Institutions (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Institution'
WHERE r.type = 'LINKED_TO';

INSERT INTO CorporateEntities_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Publications_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Publication'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Events_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Institutions_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Publications_InvolvedWith_GeneralAreas (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT nf.chcd_id, nt.chcd_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.neo4j_id AND nf.label = 'Publication'
         JOIN temp_nodes nt ON r.end_id = nt.neo4j_id AND nt.label = 'GeneralArea'
WHERE r.type = 'INVOLVED_WITH';

-- Update geography_node_id FK based on :LOCATED_IN
INSERT INTO institutions_locatedin (entity_from_id, entity_to_id)
SELECT n.chcd_id, g.chcd_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.neo4j_id AND n.label = 'Institution'
         JOIN temp_nodes g ON r.end_id = g.neo4j_id AND g.label in ('Village', 'Township', 'County', 'Prefecture', 'Province', 'Nation')
WHERE r.type = 'LOCATED_IN';

-- Update geography_node_id FK based on :LOCATED_IN
INSERT INTO events_locatedin (entity_from_id, entity_to_id)
SELECT n.chcd_id, g.chcd_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.neo4j_id AND n.label = 'Event'
         JOIN temp_nodes g ON r.end_id = g.neo4j_id AND g.label in ('Village', 'Township', 'County', 'Prefecture', 'Province', 'Nation')
WHERE r.type = 'LOCATED_IN';

-- Update geography_node_id FK based on :LOCATED_IN
INSERT INTO generalareas_locatedin (entity_from_id, entity_to_id)
SELECT n.chcd_id, g.chcd_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.neo4j_id AND n.label = 'GeneralArea'
         JOIN temp_nodes g ON r.end_id = g.neo4j_id AND g.label in ('Village', 'Township', 'County', 'Prefecture', 'Province', 'Nation')
WHERE r.type = 'LOCATED_IN';


-- Insert its own id as xxx_id FK if it is a xxx
UPDATE GeographyNodes
SET nation_id = id
WHERE id LIKE 'A%';
UPDATE GeographyNodes
SET province_id = id
WHERE id LIKE 'O%';
UPDATE GeographyNodes
SET prefecture_id = id
WHERE id LIKE 'F%';
UPDATE GeographyNodes
SET county_id = id
WHERE id LIKE 'Y%';
UPDATE GeographyNodes
SET township_id = id
WHERE id LIKE 'T%';

-- Update all direct FKs based on temp_relationships
UPDATE GeographyNodes
SET nation_id = CASE WHEN c.label = 'Nation' THEN c.chcd_id ELSE nation_id END,
    province_id = CASE WHEN c.label = 'Province' THEN c.chcd_id ELSE province_id END,
    prefecture_id = CASE WHEN c.label = 'Prefecture' THEN c.chcd_id ELSE prefecture_id END,
    county_id = CASE WHEN c.label = 'County' THEN c.chcd_id ELSE county_id END,
    township_id = CASE WHEN c.label = 'Township' THEN c.chcd_id ELSE township_id END
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.neo4j_id
         JOIN temp_nodes c ON r.end_id = c.neo4j_id
WHERE r.type = 'INSIDE_OF' AND GeographyNodes.id = n.chcd_id;

-- Update all indirect FKs if FK is not NULL
-- Update all nation_id
UPDATE GeographyNodes
SET nation_id = g.nation_id
FROM GeographyNodes g
WHERE GeographyNodes.province_id = g.id;

-- Update all province_id and nation_id
UPDATE GeographyNodes
SET province_id = g.province_id,
    nation_id = g.nation_id
FROM GeographyNodes g
WHERE GeographyNodes.prefecture_id = g.id;

-- Update all prefecture_id, province_id and nation_id
UPDATE GeographyNodes
SET prefecture_id = g.prefecture_id,
    province_id = g.province_id,
    nation_id = g.nation_id
FROM GeographyNodes g
WHERE GeographyNodes.county_id = g.id;

-- Update all county_id, prefecture_id, province_id and nation_id
UPDATE GeographyNodes
SET county_id = g.county_id,
    prefecture_id = g.prefecture_id,
    province_id = g.province_id,
    nation_id = g.nation_id
FROM GeographyNodes g
WHERE GeographyNodes.township_id = g.id;

-- Update all township_id, county_id, prefecture_id, province_id and nation_id
UPDATE GeographyNodes
SET township_id = g.township_id,
    county_id = g.county_id,
    prefecture_id = g.prefecture_id,
    province_id = g.province_id,
    nation_id = g.nation_id
FROM GeographyNodes g
WHERE GeographyNodes.id = g.id;
