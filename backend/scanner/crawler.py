import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time

class WebCrawler:
    def __init__(self, base_url, max_pages=50, delay=1):
        self.base_url = base_url
        self.max_pages = max_pages
        self.delay = delay
        self.visited_urls = set()
        self.forms = []
        self.input_fields = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def crawl(self):
        """Main crawling function"""
        urls_to_visit = [self.base_url]
        
        while urls_to_visit and len(self.visited_urls) < self.max_pages:
            url = urls_to_visit.pop(0)
            
            if url in self.visited_urls:
                continue
                
            print(f"Crawling: {url}")
            
            try:
                response = self.session.get(url, timeout=10)
                if response.status_code == 200:
                    self.visited_urls.add(url)
                    self._parse_page(url, response.text)
                    
                    # Find new URLs to crawl
                    new_urls = self._extract_urls(response.text, url)
                    urls_to_visit.extend([u for u in new_urls if u not in self.visited_urls])
                    
                time.sleep(self.delay)  # Be respectful to the server
                
            except Exception as e:
                print(f"Error crawling {url}: {str(e)}")
        
        return {
            'urls': list(self.visited_urls),
            'forms': self.forms,
            'input_fields': self.input_fields
        }
    
    def _parse_page(self, url, html):
        """Parse HTML to find forms and input fields"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find all forms
        for form in soup.find_all('form'):
            form_info = {
                'url': url,
                'method': form.get('method', 'get').upper(),
                'action': urljoin(url, form.get('action', '')),
                'inputs': []
            }
            
            # Find inputs in form
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                input_info = {
                    'name': input_tag.get('name', ''),
                    'type': input_tag.get('type', 'text'),
                    'value': input_tag.get('value', '')
                }
                if input_info['name']:  # Only add named inputs
                    form_info['inputs'].append(input_info)
                    
                    # Add to input fields list
                    self.input_fields.append({
                        'url': url,
                        'form_action': form_info['action'],
                        'name': input_info['name'],
                        'type': input_info['type']
                    })
            
            if form_info['inputs']:
                self.forms.append(form_info)
        
        # Find standalone input fields (not in forms)
        for input_tag in soup.find_all('input'):
            if not input_tag.find_parent('form') and input_tag.get('name'):
                self.input_fields.append({
                    'url': url,
                    'name': input_tag.get('name'),
                    'type': input_tag.get('type', 'text')
                })
    
    def _extract_urls(self, html, base_url):
        """Extract all URLs from page"""
        soup = BeautifulSoup(html, 'html.parser')
        urls = []
        
        for link in soup.find_all('a', href=True):
            url = urljoin(base_url, link['href'])
            if self._is_same_domain(url):
                urls.append(url)
        
        return list(set(urls))
    
    def _is_same_domain(self, url):
        """Check if URL belongs to same domain"""
        base_domain = urlparse(self.base_url).netloc
        url_domain = urlparse(url).netloc
        return url_domain == base_domain or url_domain == ''