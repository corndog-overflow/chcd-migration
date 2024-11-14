--     WITH RECURSIVE total_entities AS (
--         SELECT c.id AS c_id
--         FROM CorporateEntities AS c 
--         WHERE c.id = 'C_001098'

--         UNION ALL

--         SELECT r.entity_from_id
--         FROM Relationship r
--         JOIN total_entities t ON r.entity_to_id = t.c_id
--         WHERE r.entity_from_id IS NOT NULL 
--         AND r.entity_from_id NOT LIKE 'P%'
--     ),
    
--     --grab people
--     tot_people AS(
--     SELECT p.entity_from_id
--     FROM Relationship p --adds relationships to grab from
--     JOIN total_entities t on p.entity_to_id = t.c_id--joining higher level inst
--     -- add the institutions if there exists child nodes that point to the higher node.
--     AND p.entity_from_id LIKE 'P%'),

--     --get nationalities
--     nationalities AS(
--         SELECT p.nationality
--         FROM People p 
--         JOIN tot_people b ON b.entity_from_id = p.id
--     ),
--     --associated events; grab events associated with people.
--     ast_events AS (
--         SELECT DISTINCT r.entity_to_id 
--         FROM Relationship r 
--         JOIN tot_people ON r.entity_from_id = tot_people.entity_from_id
--         AND r.entity_to_id LIKE 'E%'
--     ),

--     corpos AS (
--         SELECT DISTINCT *
--         FROM Relationship r
--         JOIN total_entities t ON r.entity_from_id = t.c_id
--         WHERE t.c_id LIKE 'C%'
--     )

--     SELECT * FROM tot_people p LIMIT 10;




SELECT * FROM RELATIONSHIP R
WHERE R.entity_from_id LIKE "P%"


























--     --grab the child nodes if they are people.

--     -- SELECT DISTINCT *
--     -- FROM default_schema.PEOPLE j
--     -- JOIN people p ON j.id = p.entity_from_id


--     -- SELECT * FROM Relationship e 
--     -- WHERE e.entity_from_id LIKE 'Y_1868%' or e.entity_to_id LIKE 'Y_1868%';


--     -- SELECT * FROM Relationship e 
--     -- WHERE e.entity_from_id LIKE 'E_20004%' or e.entity_to_id LIKE 'E_20004%'

--     -- institutions AS(
--     -- SELECT DISTINCT p.entity_from_id
--     -- FROM Relationship p --adds relationships to grab from
--     -- JOIN total_entities t on p.entity_to_id = t.c_id--joining higher level inst
--     -- -- add the institutions if there exists child nodes that point to the higher node.
--     -- AND p.entity_from_id LIKE 'N%')
--     -- --grab the child nodes if they are people.

    

-- -- FROM Relationship r 
-- -- WHERE r.entity_to_id IN ('N_04660', 'N_03695', 'N_05814', 'N_04674', 'N_04677', 'C_001098')
-- -- AND r.entity_from_id LIKE 'N%';

-- -- SELECT *
-- -- FROM Relationship r 
-- -- WHERE r.entity_to_id = 'P_027798'
