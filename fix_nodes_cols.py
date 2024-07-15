import pandas as pd

df = pd.read_csv('nodes_fix.csv')

df = df.rename(columns={
    "id": "neo4j_id"
})

new_col_order = ['neo4j_id', 'chcd_id', 'label', 'abbreviation',
       'alternative_chinese_name_hanzi', 'alternative_chinese_name_romanized',
       'alternative_name_western', 'baptism',
       'beatification', 'birth_day', 'birth_month',
       'birth_place', 'birth_year', 'burial_place', 
        'canonization', 'china_start', 'chinese_family_name_hanzi',
       'chinese_family_name_romanized', 'chinese_given_name_hanzi',
       'chinese_given_name_romanized', 'chinese_name_hanzi',
       'chinese_name_romanized', 'christian_tradition', 'circulation',
       'confirmation', 'corporate_entity_category',
       'corporate_entity_subcategory', 'death_day', 'death_month',
       'death_place', 'death_year', 'degree', 'embarkment', 'end_day',
       'end_month', 'end_year', 'event_category', 'event_subcategory',
       'family_name_western', 'format', 'gender', 'gender_served',
       'given_name_western', 'institution_category', 'institution_subcategory',
       'issue_frequency', 'latitude', 'longitude', 'name_rom', 'name_wes',
       'name_western', 'name_zh', 'nationality', 'notes', 'occupation',
       'ordination_archbishop', 'ordination_bishop', 'ordination_deacon',
       'ordination_priest', 'other_abbreviation', 'price',
       'publication_category', 'publication_language',
       'publication_subcategory', 'religious_family', 'source', 'start_day',
       'start_month', 'start_year', 'title', 'vestition']
    
print(df.columns)
for col in ['birth_year', 'birth_day', 'birth_month', 
            'death_year', 'death_day', 'death_month', 
            'start_year', 'start_day', 'start_month', 
            'end_year', 'end_month', 'end_day', 'china_start']:
    df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')

df.to_csv('nodes_greta_fix.csv', index=False)

df = pd.read_csv('rels_fix.csv') #, index="id")
print(df.columns)

df = df.rename(columns={
    "START_ID": "start_id",
    "END_ID": "end_id",
    "TYPE": "type",
})

new_cols = ['start_id', 'end_id', 'type', 
            'end_day', 'end_month', 'end_year',
            'notes', 'rel_type', 'source',
            'start_day', 'start_month', 'start_year']
df = df[new_cols]

# df['start_id'] = df['start_id'].str.split('_').str[1].astype(int)
# df['end_id'] = df['end_id'].str.split('_').str[1].astype(int)

for col in ['start_id', 'end_id',
            'start_year', 'start_day', 'start_month', 
            'end_year', 'end_month', 'end_day']:
    df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')

print(df)
df.to_csv('rels_greta_fix.csv', index=False)