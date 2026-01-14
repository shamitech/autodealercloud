import requests
import json
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

response = requests.post(
    'https://api.autodealercloud.com/api/platform/login',
    json={'email': 'admin@autodealercloud.com', 'password': 'password'},
    verify=False
)
print(json.dumps(response.json(), indent=2))
