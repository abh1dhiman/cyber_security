import requests
import re
from .payloads import SQLI_PAYLOADS, SQLI_ERROR_PATTERNS

class SQLIScanner:
    def __init__(self):
        self.session = requests.Session()
        self.vulnerabilities = []
    
    def scan_url_params(self, url, params):
        """Test URL parameters for SQL injection"""
        for param_name, param_value in params.items():
            # First test with baseline request
            baseline = self._make_request(url, params)
            
            for payload in SQLI_PAYLOADS:
                test_params = params.copy()
                test_params[param_name] = param_value + payload
                
                try:
                    response = self._make_request(url, test_params)
                    
                    if self._check_sql_injection(response.text, baseline):
                        self.vulnerabilities.append({
                            'type': 'SQL Injection',
                            'url': url,
                            'parameter': param_name,
                            'payload': payload,
                            'method': 'GET',
                            'severity': 'Critical',
                            'evidence': "SQL error pattern detected"
                        })
                        break
                        
                except Exception as e:
                    print(f"Error testing {url}: {str(e)}")
    
    def scan_forms(self, forms):
        """Test forms for SQL injection"""
        for form in forms:
            for input_field in form['inputs']:
                for payload in SQLI_PAYLOADS:
                    if self._test_form_input(form, input_field['name'], payload):
                        self.vulnerabilities.append({
                            'type': 'SQL Injection',
                            'url': form['url'],
                            'form_action': form['action'],
                            'parameter': input_field['name'],
                            'payload': payload,
                            'method': form['method'],
                            'severity': 'Critical',
                            'evidence': "SQL error pattern detected in form submission"
                        })
                        break
    
    def _make_request(self, url, params):
        """Make HTTP request and return response text"""
        try:
            response = self.session.get(url, params=params, timeout=10)
            return response.text
        except:
            return ""
    
    def _test_form_input(self, form, input_name, payload):
        """Test form input with SQL injection payload"""
        try:
            data = {input_name: payload}
            
            if form['method'] == 'POST':
                response = self.session.post(form['action'], data=data, timeout=10)
            else:
                response = self.session.get(form['action'], params=data, timeout=10)
            
            return self._check_sql_injection(response.text, "")
            
        except Exception as e:
            return False
    
    def _check_sql_injection(self, response_text, baseline_text):
        """Check for SQL injection indicators in response"""
        # Check for SQL error patterns
        for pattern in SQLI_ERROR_PATTERNS:
            if re.search(pattern, response_text, re.IGNORECASE):
                return True
        
        # Check for behavioral changes (optional)
        if baseline_text and len(response_text) != len(baseline_text):
            # Could indicate different response due to injection
            pass
            
        return False
    
    def scan(self, target_data):
        """Main scanning function"""
        self.vulnerabilities = []
        
        # Scan URL parameters
        for url in target_data['urls']:
            try:
                response = self.session.get(url, timeout=10)
                if response.url:
                    from urllib.parse import parse_qs, urlparse
                    parsed = urlparse(response.url)
                    params = parse_qs(parsed.query)
                    if params:
                        flat_params = {k: v[0] for k, v in params.items()}
                        self.scan_url_params(response.url, flat_params)
            except:
                pass
        
        # Scan forms
        self.scan_forms(target_data['forms'])
        
        return self.vulnerabilities