INSERT INTO CorporateEntities_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'CorporateEntity'
WHERE r.rel_type = 'PartOf';

INSERT INTO People_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';


INSERT INTO Institutions_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO Events_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO People_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO CorporateEntities_PartOf_CorporateEntities (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'CorporateEntity'
WHERE r.type = 'PART_OF';

INSERT INTO People_PresentAt_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Event'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_PresentAt_Institutions (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Institution'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_PresentAt_GeneralAreas (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'GeneralArea'
WHERE r.type = 'PRESENT_AT';

INSERT INTO People_RelatedTo_People (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Person'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Person'
WHERE r.type = 'RELATED_TO';

INSERT INTO Institutions_LinkedTo_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Event'
WHERE r.type = 'LINKED_TO';

INSERT INTO Events_LinkedTo_Events (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Event'
WHERE r.type = 'LINKED_TO';

INSERT INTO Institutions_LinkedTo_Institutions (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Institution'
WHERE r.type = 'LINKED_TO';

INSERT INTO CorporateEntities_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'CorporateEntity'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Publications_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Publication'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Events_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Event'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Institutions_InvolvedWith_Publications (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Institution'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'Publication'
WHERE r.type = 'INVOLVED_WITH';

INSERT INTO Publications_InvolvedWith_GeneralAreas (entity_from_id, entity_to_id, start_day, start_month, start_year, end_day, end_month, end_year, notes, source)
SELECT r.start_id, r.end_id, r.start_day, r.start_month, r.start_year, r.end_day, r.end_month, r.end_year, r.notes, r.source
FROM temp_relationships r
         JOIN temp_nodes nf ON r.start_id = nf.id AND nf.label = 'Publication'
         JOIN temp_nodes nt ON r.end_id = nt.id AND nt.label = 'GeneralArea'
WHERE r.type = 'INVOLVED_WITH';

-- Update geography_node_id FK based on :LOCATED_IN
UPDATE Institutions
SET geography_node_id = r.end_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.id AND n.label = 'Institution'
         JOIN geographynode g ON r.end_id = g.id
WHERE r.type = 'LOCATED_IN' AND Institutions.id = r.start_id;

UPDATE GeneralAreas
SET geography_node_id = r.end_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.id AND n.label = 'GeneralArea'
         JOIN geographynode g ON r.end_id = g.id
WHERE r.type = 'LOCATED_IN' AND GeneralAreas.id = r.start_id;

UPDATE Events
SET geography_node_id = r.end_id
FROM temp_relationships r
         JOIN temp_nodes n ON r.start_id = n.id AND n.label = 'Event'
         JOIN geographynode g ON r.end_id = g.id
WHERE r.type = 'LOCATED_IN' AND Events.id = r.start_id;
