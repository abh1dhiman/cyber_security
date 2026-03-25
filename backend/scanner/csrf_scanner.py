import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from .payloads import CSRF_CHECK_PATTERNS

class CSRFScanner:
    def __init__(self):
        self.session = requests.Session()
        self.vulnerabilities = []
    
    def scan_forms(self, forms):
        """Check forms for CSRF protection"""
        for form in forms:
            if form['method'] == 'POST':  # Only check POST forms
                has_csrf_token = self._check_csrf_token(form)
                
                if not has_csrf_token:
                    self.vulnerabilities.append({
                        'type': 'CSRF (Missing Token)',
                        'url': form['url'],
                        'form_action': form['action'],
                        'method': form['method'],
                        'severity': 'Medium',
                        'evidence': "No CSRF token found in form"
                    })
    
    def _check_csrf_token(self, form):
        """Check if form has CSRF protection"""
        for input_field in form['inputs']:
            # Check input names for CSRF token patterns
            name_lower = input_field['name'].lower()
            for pattern in CSRF_CHECK_PATTERNS:
                if pattern in name_lower:
                    return True
            
            # Check for hidden input with token-like value
            if input_field['type'] == 'hidden' and len(input_field.get('value', '')) > 20:
                # Long hidden values might be tokens
                return True
        
        return False
    
    def check_cookie_attributes(self, target_data):
        """Check cookie security attributes"""
        for url in target_data['urls']:
            try:
                response = self.session.get(url, timeout=10)
                
                for cookie in response.cookies:
                    issues = []
                    
                    # Check Secure flag
                    if not cookie.secure:
                        issues.append("Missing Secure flag")
                    
                    # Check HttpOnly flag
                    if not cookie.has_nonstandard_attr('HttpOnly'):
                        issues.append("Missing HttpOnly flag")
                    
                    # Check SameSite attribute
                    samesite = cookie.get_nonstandard_attr('SameSite', '')
                    if samesite and samesite.lower() == 'none':
                        issues.append("SameSite=None allows cross-site requests")
                    
                    if issues:
                        self.vulnerabilities.append({
                            'type': 'Cookie Security',
                            'url': url,
                            'cookie_name': cookie.name,
                            'severity': 'Low',
                            'evidence': f"Cookie issues: {', '.join(issues)}"
                        })
            except:
                pass
    
    def scan(self, target_data):
        """Main scanning function"""
        self.vulnerabilities = []
        
        # Scan forms for CSRF tokens
        self.scan_forms(target_data['forms'])
        
        # Check cookie security
        self.check_cookie_attributes(target_data)
        
        return self.vulnerabilities