import requests
from urllib.parse import urljoin, urlencode
from .payloads import XSS_PAYLOADS

class XSSScanner:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.vulnerabilities = []
    
    def scan_url_params(self, url, params):
        """Test URL parameters for XSS vulnerabilities"""
        for param_name, param_value in params.items():
            for payload in XSS_PAYLOADS:
                test_params = params.copy()
                test_params[param_name] = payload
                
                try:
                    response = self.session.get(url, params=test_params, timeout=10)
                    
                    if self._check_xss_reflection(response.text, payload):
                        self.vulnerabilities.append({
                            'type': 'XSS (Reflected)',
                            'url': url,
                            'parameter': param_name,
                            'payload': payload,
                            'method': 'GET',
                            'severity': 'High',
                            'evidence': f"Payload reflected in response"
                        })
                        break  # Found vulnerability, move to next parameter
                        
                except Exception as e:
                    print(f"Error testing {url}: {str(e)}")
    
    def scan_forms(self, forms):
        """Test forms for XSS vulnerabilities"""
        for form in forms:
            for input_field in form['inputs']:
                if input_field['type'] in ['text', 'search', 'textarea', 'hidden']:
                    for payload in XSS_PAYLOADS:
                        if self._test_form_input(form, input_field['name'], payload):
                            self.vulnerabilities.append({
                                'type': 'XSS (Stored/Reflected)',
                                'url': form['url'],
                                'form_action': form['action'],
                                'parameter': input_field['name'],
                                'payload': payload,
                                'method': form['method'],
                                'severity': 'High',
                                'evidence': f"Form input vulnerable to XSS"
                            })
                            break
    
    def _test_form_input(self, form, input_name, payload):
        """Test a specific form input with payload"""
        try:
            data = {input_name: payload}
            
            if form['method'] == 'POST':
                response = self.session.post(form['action'], data=data, timeout=10)
            else:
                response = self.session.get(form['action'], params=data, timeout=10)
            
            return self._check_xss_reflection(response.text, payload)
            
        except Exception as e:
            return False
    
    def _check_xss_reflection(self, response_text, payload):
        """Check if payload is reflected in response"""
        # Simple reflection check
        if payload in response_text:
            return True
        
        # Check URL-encoded version
        from urllib.parse import quote
        encoded_payload = quote(payload)
        if encoded_payload in response_text:
            return True
            
        return False
    
    def scan(self, target_data):
        """Main scanning function"""
        self.vulnerabilities = []
        
        # Scan URL parameters
        for url in target_data['urls']:
            try:
                response = self.session.get(url, timeout=10)
                if response.url:  # Follow redirects
                    from urllib.parse import parse_qs, urlparse
                    parsed = urlparse(response.url)
                    params = parse_qs(parsed.query)
                    if params:
                        # Flatten params
                        flat_params = {k: v[0] for k, v in params.items()}
                        self.scan_url_params(response.url, flat_params)
            except:
                pass
        
        # Scan forms
        self.scan_forms(target_data['forms'])
        
        return self.vulnerabilities