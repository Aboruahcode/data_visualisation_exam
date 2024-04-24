import pandas as pd
import json
from datetime import datetime
from typing import Dict, List
from fhir.resources.observation import Observation
from fhir.resources.quantity import Quantity
from fhir.resources.coding import Coding
from fhir.resources.codeableconcept import CodeableConcept

def create_observation(record: pd.Series) -> Dict:
    """
    Creates an Observation resource for a single record of COVID-19 case data.
    """
    return {
        "resourceType": "Observation",
        "id": f"observation-{record['dateRep']}",
        "status": "final",
        "code": {
            "coding": [
                {"system": "http://loinc.org", "code": "94531-1", "display": "COVID-19 cases reported"}
            ]
        },
        "subject": {
            "reference": f"Country/{record['countryterritoryCode']}"
        },
        "effectiveDateTime": record['dateRep'],
        "valueQuantity": {
            "value": record['cases'],
            "unit": "count",
            "system": "http://unitsofmeasure.org",
            "code": "count"
        }
    }

def create_fhir_bundle(data_path: str, output_path: str):
    """
    Creates a FHIR bundle from a JSON file containing filtered European COVID-19 data.
    """
    data = pd.read_json(data_path)
    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "fullUrl": f"urn:uuid:observation-{row['dateRep']}",
                "resource": create_observation(row)
            } for index, row in data.iterrows()
        ]
    }

    with open(output_path, 'w') as f:
        json.dump(fhir_bundle, f, indent=4)

    print("FHIR bundle created successfully.")

def reverse_fhir_bundle(bundle_path: str) -> List[Dict]:
    """
    Reverses a FHIR bundle back to a list of dictionaries representing the original data.
    """
    with open(bundle_path, 'r') as f:
        fhir_bundle = json.load(f)

    reversed_data = []
    for entry in fhir_bundle.get('entry', []):
        observation = entry.get('resource', {})
        date_rep = observation.get('effectiveDateTime', '')
        try:
            # Attempt to parse the date assuming the format in which it's supposed to be saved
            parsed_date = datetime.strptime(date_rep, "%Y-%m-%d")
        except ValueError:
            # If parsing fails, it might be saved in another expected format
            parsed_date = datetime.strptime(date_rep, "%d/%m/%Y")
        
        date_rep = parsed_date.strftime("%d/%m/%Y")

        cases = next((comp for comp in observation.get('component', []) if comp['code']['coding'][0]['code'] == "94531-1"), {}).get('valueQuantity', {}).get('value', 0)
        
        reversed_entry = {
            'dateRep': date_rep,
            'cases': cases,
            'countryterritoryCode': observation.get('subject', {}).get('reference', '').split('/')[-1]
        }
        reversed_data.append(reversed_entry)

    return reversed_data

# Example usage
if __name__ == "__main__":
    # Creating FHIR Bundle
    create_fhir_bundle('/workspaces/data_visualisation_exam/backend/style/filtered_european_data.json', '/workspaces/data_visualisation_exam/fhir_bundle.json')
    
    # Reversing FHIR Bundle
    reversed_data = reverse_fhir_bundle('/workspaces/data_visualisation_exam/fhir_bundle.json')
    print(reversed_data)
