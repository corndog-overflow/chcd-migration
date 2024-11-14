import pandas as pd
from py2neo import Graph
import pandas as pd

# Connect to the neo4j database
graph = Graph("neo4j+s://portal.chcdatabase.com:7687", auth=("developer", "3umm5rd3v"))

# N_20074: Fu Jen University, 115 people 
# N_20139: SSpS Sisters in Jining, 37 people 
# N_20101: SSpS Clinic in Jining, 5 people 
# N_02556: Ku Ching Ying, 0 people
# N_04761: Taiyuan Mission (SA), 21 people
# N_04660: Ta T'ung Fu Central Corps, 55 people 
# C_001098: Hunan Mission (PN), 133 people
# C_000019: American Presbyterians (North), 2803 people (w/o CE link) 2835 (w/ CE link)        this query takes a long time to load

start_id = 'C_000019'

entities_to_test = [start_id]
final_entities = set()

while entities_to_test:
    new_entities = set()
    final_entities.update(entities_to_test)
    
    for entity_id in entities_to_test:
        # Query to find connected entities
        df = graph.run(
            """
            MATCH (i {id: $id})<-[]-(d)
            WHERE d:Institution OR d:Publication OR d:Event OR d:CorporateEntity
            RETURN d.id as id
            """,
            id=entity_id
        ).to_data_frame()
        
        # Add new entities to the set, avoiding duplicates
        if not df.empty and 'id' in df.columns:
            new_entities.update(df['id'].tolist())
    
    # Filter out already processed entities
    entities_to_test = list(new_entities - final_entities)

print((final_entities))

all_people=set()

for entity_id in final_entities:
    # Query to find all connected people
    df = graph.run(
        """
        MATCH (p:Person)-[]->(i {id: $id})
        RETURN p.id as person_id
        """,
        id=entity_id
    ).to_data_frame()
    
   # Add the person IDs to the all_people set if there are any results
    if not df.empty and 'person_id' in df.columns:
        all_people.update(df['person_id'].tolist())

# print(all_people)
print(len(all_people))