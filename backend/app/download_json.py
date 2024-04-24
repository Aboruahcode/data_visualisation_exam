# backend/app/download_json.py

import requests

def download_json(url, filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'w') as file:
            file.write(response.text)
        print("File downloaded successfully.")
    else:
        print("Failed to retrieve the file. Status Code:", response.status_code)

if __name__ == "__main__":
    download_json('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/', 'Covid_19.json')
