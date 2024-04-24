#import pandas as pd

# European country ISO three-letter codes
#european_countries = ['ALB', 'AND', 'ARM', 'AUT', 'AZE', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE', 
                      #'DNK', 'EST', 'FIN', 'FRA', 'GEO', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA', 'KAZ', 
                      #'XKX', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MDA', 'MCO', 'MNE', 'NLD', 'MKD', 'NOR', 
                      #'POL', 'PRT', 'ROU', 'RUS', 'SMR', 'SRB', 'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'TUR', 'UKR', 'GBR']

# Load the data
#(data = pd.read_json('../Covid_19.json')

# Check and print column names
#print("Columns in DataFrame:", data.columns)

# Filter for European countries
#data = data[data['countryterritoryCode'].isin(european_countries)]

# Save the filtered data
#data.to_json('../filtered_european_data.json', orient='records', date_format='iso')

#print("Data filtered and saved successfully.")


import pandas as pd
from pandas import json_normalize


# Load the data using the correct relative path
data = pd.read_json('../Covid_19.json')

# Since the data is nested under 'records', use json_normalize to flatten it
if 'records' in data.columns:
    flat_data = json_normalize(data['records'])
else:
    flat_data = data  # If data is already flat, no need to normalize

# Print the first few rows and column names to inspect the new structure
print(flat_data.head())
print("Columns in DataFrame after flattening:", flat_data.columns.tolist())

# European country ISO three-letter codes
european_countries = ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia_and_Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 
      'Denmark', 'Estonia', 'Faroe_Islands', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Guernsey', 'Holy_See', 'Hungary', 
      'Iceland', 'Ireland', 'Isle_of_Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 
      'Monaco', 'Montenegro', 'Netherlands', 'North_Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San_Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United_Kingdom'];

# Filter for European countries
filtered_data = flat_data[flat_data['countriesAndTerritories'].isin(european_countries)]

# Save the filtered data
filtered_data.to_json('../filtered_european_data.json', orient='records', date_format='iso')

print("Data filtered and saved successfully.")
